import * as incidentService from './attendance-incident.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listIncidents = async (req, res) => {
  const result = await incidentService.listIncidents(req.query);
  return sendSuccess(res, result, 'Incidents retrieved successfully.');
};

export const getIncident = async (req, res) => {
  const incident = await incidentService.getIncidentById(req.params.id);
  return sendSuccess(res, incident, 'Incident retrieved successfully.');
};

export const createIncident = async (req, res) => {
  const incident = await incidentService.createIncident(req.body, req.user.id);
  return sendSuccess(res, incident, 'Incident created successfully.', 201);
};

export const updateIncident = async (req, res) => {
  const incident = await incidentService.updateIncident(req.params.id, req.body, req.user.id);
  return sendSuccess(res, incident, 'Incident updated successfully.');
};

export const cancelIncident = async (req, res) => {
  const incident = await incidentService.cancelIncident(req.params.id, req.user.id);
  return sendSuccess(res, incident, 'Incident cancelled successfully.');
};

export const resolveIncident = async (req, res) => {
  const incident = await incidentService.resolveIncident(
    req.params.id,
    req.body.resolutionNotes,
    req.user.id,
  );
  return sendSuccess(res, incident, 'Incident resolved successfully.');
};

export const rejectIncident = async (req, res) => {
  const incident = await incidentService.rejectIncident(
    req.params.id,
    req.body.reason,
    req.user.id,
  );
  return sendSuccess(res, incident, 'Incident rejected successfully.');
};

export const addComment = async (req, res) => {
  const incident = await incidentService.addComment(req.params.id, req.body.comment, req.user.id);
  return sendSuccess(res, incident, 'Comment added successfully.');
};
