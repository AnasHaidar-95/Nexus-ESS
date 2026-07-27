import * as applicantService from './applicant.service.js';
import { sendError } from '../../core/utils/api-response.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await applicantService.getOwnApplicantProfile(req.user.id);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await applicantService.updateOwnApplicantProfile(req.user.id, req.body);
    res.json({ data: profile, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

export const submit = async (req, res, next) => {
  try {
    const profile = await applicantService.submitForApproval(req.user.id);
    res.json({ data: profile, message: 'Profile submitted for approval' });
  } catch (err) {
    next(err);
  }
};

export const uploadDoc = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(
        res,
        'No file uploaded. Allowed: PDF, DOC, DOCX, PNG, JPG.',
        400,
        'VALIDATION_ERROR',
      );
    }
    if (req.body.category) req.file.category = req.body.category;
    const doc = await applicantService.uploadDocument(req.user.id, req.file);
    res.status(201).json({ data: doc, message: 'Document uploaded' });
  } catch (err) {
    next(err);
  }
};

export const deleteDoc = async (req, res, next) => {
  try {
    await applicantService.deleteDocument(req.user.id, req.params.id);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
};

export const downloadApplicantDocument = async (req, res, next) => {
  try {
    const doc = await applicantService.getApplicantDocumentById(req.params.id);
    res.download(doc.storagePath, doc.originalFilename);
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await applicantService.listApplicants(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getDetail = async (req, res, next) => {
  try {
    const profile = await applicantService.getApplicantDetail(req.params.id);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export const approve = async (req, res, next) => {
  try {
    const employee = await applicantService.approveApplicant(req.params.id, req.body, req.user.id);
    res.json({ data: employee, message: 'Applicant approved and employee created' });
  } catch (err) {
    next(err);
  }
};

export const reject = async (req, res, next) => {
  try {
    await applicantService.rejectApplicant(req.params.id, req.body, req.user.id);
    res.json({ message: 'Applicant rejected' });
  } catch (err) {
    next(err);
  }
};
