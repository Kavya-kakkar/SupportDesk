const Comment = require('../models/Comment');
const ticketService = require('../services/ticketService');
const ticketEvents = require('../events/ticketEvents');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getComments = async (req, res, next) => {
  try {
    // Ensure user has access to view this ticket
    const ticket = await ticketService.getTicket(req.params.id, req.user);

    const query = { ticketId: ticket._id };
    // Normal users MUST NOT see internal notes
    if (req.user.role !== 'admin') {
      query.isInternal = false;
    }

    const comments = await Comment.find(query)
      .populate('userId', 'name email role organization')
      .sort({ createdAt: 1 });

    return successResponse(res, 200, 'Comments retrieved.', { comments });
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicket(req.params.id, req.user);
    const { message, isInternal } = req.body;

    // Only administrators can create internal notes
    const internalFlag = req.user.role === 'admin' ? Boolean(isInternal) : false;

    const comment = new Comment({
      ticketId: ticket._id,
      userId: req.user._id,
      message,
      isInternal: internalFlag,
    });

    await comment.save();
    await comment.populate('userId', 'name email role organization');

    // Emit comment event for activity log persistence
    ticketEvents.emit(ticketEvents.EVENTS.COMMENT_ADDED, {
      ticket,
      comment,
      actor: req.user,
    });

    return successResponse(res, 201, 'Comment added successfully.', { comment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getComments,
  createComment,
};
