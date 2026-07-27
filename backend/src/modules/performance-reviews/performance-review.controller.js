import * as performanceReviewService from './performance-review.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listPerformanceReviews = async (req, res) =>
  sendSuccess(
    res,
    await performanceReviewService.listPerformanceReviews(req.query),
    'Performance reviews retrieved successfully.',
  );
export const getPerformanceReview = async (req, res) =>
  sendSuccess(
    res,
    await performanceReviewService.getPerformanceReviewById(req.params.id),
    'Performance review retrieved successfully.',
  );
export const createPerformanceReview = async (req, res) =>
  sendSuccess(
    res,
    await performanceReviewService.createPerformanceReview(req.body, req.user.id),
    'Performance review created successfully.',
    201,
  );
export const updatePerformanceReview = async (req, res) =>
  sendSuccess(
    res,
    await performanceReviewService.updatePerformanceReview(req.params.id, req.body, req.user.id),
    'Performance review updated successfully.',
  );
export const submitPerformanceReview = async (req, res) =>
  sendSuccess(
    res,
    await performanceReviewService.submitPerformanceReview(req.params.id, req.user.id),
    'Performance review submitted successfully.',
  );
export const acknowledgePerformanceReview = async (req, res) =>
  sendSuccess(
    res,
    await performanceReviewService.acknowledgePerformanceReview(req.params.id, req.user.id),
    'Performance review acknowledged successfully.',
  );
export const completePerformanceReview = async (req, res) =>
  sendSuccess(
    res,
    await performanceReviewService.completePerformanceReview(req.params.id, req.user.id),
    'Performance review completed successfully.',
  );
