import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('EMPLOYEE', 'performance_reviews');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

export const listPerformanceReviews = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, cycle, status } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (cycle) where.cycle = { contains: cycle, mode: 'insensitive' };
  if (status) where.status = status;

  const [reviews, totalItems] = await Promise.all([
    prisma.performanceReview.findMany({ ...prismaArgs, where }),
    prisma.performanceReview.count({ where }),
  ]);

  return formatPaginatedResponse(reviews, totalItems, pagination);
};

export const getPerformanceReviewById = async (id) => {
  const review = await prisma.performanceReview.findUnique({ where: { id } });
  if (!review) throw new NotFoundError('PerformanceReview');
  return review;
};

export const createPerformanceReview = async (data, actorId) => {
  const review = await prisma.performanceReview.create({
    data: {
      ...data,
      reviewerId: data.reviewerId || actorId,
      status: 'DRAFT',
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  audit.create(actorId, review.id, `Created performance review for cycle ${data.cycle}`);

  return review;
};

export const updatePerformanceReview = async (id, data, actorId) => {
  const review = await getPerformanceReviewById(id);
  if (review.status !== 'DRAFT') {
    throw new AppError('Only draft reviews can be updated.', 400, 'REVIEW_NOT_DRAFT');
  }

  const updated = await prisma.performanceReview.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.update(actorId, id, `Updated performance review`);

  return updated;
};

export const submitPerformanceReview = async (id, actorId) => {
  const review = await getPerformanceReviewById(id);
  if (review.status !== 'DRAFT') {
    throw new AppError('Only draft reviews can be submitted.', 400, 'REVIEW_NOT_DRAFT');
  }

  const updated = await prisma.performanceReview.update({
    where: { id },
    data: { status: 'SUBMITTED', submittedAt: new Date(), updatedBy: actorId },
  });

  audit.log(actorId, 'SUBMIT', id, `Submitted performance review`);

  const userId = await getUserIdFromEmployeeId(review.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Performance Review Submitted',
      message: `Your performance review for cycle ${review.cycle} has been submitted.`,
      type: 'INFO',
      metadata: { performanceReviewId: id, cycle: review.cycle },
    });
  }

  return updated;
};

export const acknowledgePerformanceReview = async (id, actorId) => {
  const review = await getPerformanceReviewById(id);
  if (review.status !== 'SUBMITTED') {
    throw new AppError('Only submitted reviews can be acknowledged.', 400, 'REVIEW_NOT_SUBMITTED');
  }

  const updated = await prisma.performanceReview.update({
    where: { id },
    data: { status: 'ACKNOWLEDGED', updatedBy: actorId },
  });

  audit.log(actorId, 'ACKNOWLEDGE', id, `Acknowledged performance review`);

  return updated;
};

export const completePerformanceReview = async (id, actorId) => {
  const review = await getPerformanceReviewById(id);
  if (review.status !== 'ACKNOWLEDGED') {
    throw new AppError(
      'Only acknowledged reviews can be completed.',
      400,
      'REVIEW_NOT_ACKNOWLEDGED',
    );
  }

  const updated = await prisma.performanceReview.update({
    where: { id },
    data: { status: 'COMPLETED', updatedBy: actorId },
  });

  audit.log(actorId, 'COMPLETE', id, `Completed performance review`);

  const userId = await getUserIdFromEmployeeId(review.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Performance Review Completed',
      message: `Your performance review for cycle ${review.cycle} has been completed.`,
      type: 'SUCCESS',
      metadata: { performanceReviewId: id, cycle: review.cycle },
    });
  }

  return updated;
};
