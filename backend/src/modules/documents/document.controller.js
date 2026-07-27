import * as documentService from './document.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('DOCUMENT', 'employee_documents');

export const listDocuments = async (req, res) => {
  const result = await documentService.listDocuments(req.query);
  return sendSuccess(res, result, 'Documents retrieved successfully.');
};

export const getDocument = async (req, res) => {
  const document = await documentService.getDocumentById(req.params.id);
  return sendSuccess(res, document, 'Document retrieved successfully.');
};

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    throw new Error('File is required for upload.');
  }
  const document = await documentService.createDocument(req.file, req.body, req.user.id);
  return sendSuccess(res, document, 'Document uploaded successfully.', 201);
};

export const updateDocument = async (req, res) => {
  const document = await documentService.updateDocumentMetadata(
    req.params.id,
    req.body,
    req.user.id,
  );
  return sendSuccess(res, document, 'Document metadata updated successfully.');
};

export const archiveDocument = async (req, res) => {
  await documentService.archiveDocument(req.params.id, req.user.id);
  return res.status(204).send();
};

export const downloadDocument = async (req, res) => {
  const document = await documentService.getDocumentById(req.params.id);

  // Audit the download event
  audit.log(
    req.user.id,
    'DOWNLOAD',
    document.id,
    `Downloaded document: ${document.originalFilename}`,
    { employeeId: document.employeeId },
  );

  // Stream the file to the client.
  res.download(document.storagePath, document.originalFilename);
};
