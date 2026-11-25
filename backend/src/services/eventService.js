const ActivityLog = require('../models/ActivityLog');
const ticketEvents = require('../events/ticketEvents');

/**
 * EventService handles event subscription and ensures ActivityLog persistence in MongoDB.
 */
class EventService {
  constructor() {
    this.init();
  }

  init() {
    // Ticket Created
    ticketEvents.on(ticketEvents.EVENTS.TICKET_CREATED, async (payload) => {
      await this.logActivity({
        ticketId: payload.ticket._id,
        actorId: payload.actor._id,
        eventType: 'ticket.created',
        description: `Ticket created by ${payload.actor.name}`,
        metadata: {
          ticketId: payload.ticket.ticketId,
          priority: payload.ticket.priority,
          category: payload.ticket.category,
          title: payload.ticket.title,
        },
      });
    });

    // Ticket Updated
    ticketEvents.on(ticketEvents.EVENTS.TICKET_UPDATED, async (payload) => {
      await this.logActivity({
        ticketId: payload.ticket._id,
        actorId: payload.actor._id,
        eventType: 'ticket.updated',
        description: `Ticket details updated by ${payload.actor.name}`,
        metadata: payload.changes || {},
      });
    });

    // Status Changed
    ticketEvents.on(ticketEvents.EVENTS.STATUS_CHANGED, async (payload) => {
      const isResolved = payload.newStatus === 'resolved';
      const isClosed = payload.newStatus === 'closed';
      const eventType = isResolved
        ? 'ticket.resolved'
        : isClosed
        ? 'ticket.closed'
        : 'ticket.status_changed';

      await this.logActivity({
        ticketId: payload.ticket._id,
        actorId: payload.actor._id,
        eventType,
        description: `Status changed from ${payload.oldStatus} to ${payload.newStatus} by ${payload.actor.name}`,
        metadata: {
          oldStatus: payload.oldStatus,
          newStatus: payload.newStatus,
          ticketId: payload.ticket.ticketId,
        },
      });
    });

    // Priority Changed
    ticketEvents.on(ticketEvents.EVENTS.PRIORITY_CHANGED, async (payload) => {
      await this.logActivity({
        ticketId: payload.ticket._id,
        actorId: payload.actor._id,
        eventType: 'ticket.priority_changed',
        description: `Priority changed from ${payload.oldPriority} to ${payload.newPriority} by ${payload.actor.name}`,
        metadata: {
          oldPriority: payload.oldPriority,
          newPriority: payload.newPriority,
          ticketId: payload.ticket.ticketId,
        },
      });
    });

    // Ticket Assigned
    ticketEvents.on(ticketEvents.EVENTS.TICKET_ASSIGNED, async (payload) => {
      await this.logActivity({
        ticketId: payload.ticket._id,
        actorId: payload.actor._id,
        eventType: 'ticket.assigned',
        description: `Ticket assigned to ${payload.assigneeName || 'Admin'} by ${payload.actor.name}`,
        metadata: {
          assignedTo: payload.assignedTo,
          ticketId: payload.ticket.ticketId,
        },
      });
    });

    // Comment Added
    ticketEvents.on(ticketEvents.EVENTS.COMMENT_ADDED, async (payload) => {
      const typeDesc = payload.comment.isInternal ? 'Internal note added' : 'Reply posted';
      await this.logActivity({
        ticketId: payload.ticket._id,
        actorId: payload.actor._id,
        eventType: 'comment.added',
        description: `${typeDesc} by ${payload.actor.name}`,
        metadata: {
          commentId: payload.comment._id,
          isInternal: payload.comment.isInternal,
          ticketId: payload.ticket.ticketId,
        },
      });
    });
  }

  /**
   * Persist activity log safely in MongoDB
   */
  async logActivity({ ticketId, actorId, eventType, description, metadata = {} }) {
    try {
      const log = new ActivityLog({
        ticketId,
        actorId,
        eventType,
        description,
        metadata,
      });
      await log.save();
      return log;
    } catch (err) {
      console.error('[EventService] Failed to persist activity log:', err);
    }
  }
}

module.exports = new EventService();
