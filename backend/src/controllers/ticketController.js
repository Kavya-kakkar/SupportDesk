const ticketService = require('../services/ticketService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    const ticket = await ticketService.createTicket(
      { title, description, category, priority },
      req.user
    );

    return successResponse(res, 201, 'Ticket created successfully.', { ticket });
  } catch (err) {
    next(err);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getUserTickets(req.user._id, req.query);
    return successResponse(res, 200, 'Tickets retrieved successfully.', result.tickets, {
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (err) {
    next(err);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicket(req.params.id, req.user);
    return successResponse(res, 200, 'Ticket details retrieved.', { ticket });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user);
    return successResponse(res, 200, 'Ticket updated successfully.', { ticket });
  } catch (err) {
    next(err);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const result = await ticketService.deleteTicket(req.params.id, req.user);
    return successResponse(res, 200, result.message, { ticketId: result.ticketId });
  } catch (err) {
    next(err);
  }
};

const getTicketActivity = async (req, res, next) => {
  try {
    // Verify user has access to this ticket first
    await ticketService.getTicket(req.params.id, req.user);
    const activities = await ticketService.getTicketActivity(req.params.id);
    return successResponse(res, 200, 'Ticket activity history.', { activities });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketActivity,
};
