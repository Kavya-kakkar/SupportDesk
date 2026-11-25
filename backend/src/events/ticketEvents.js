const EventEmitter = require('events');

class TicketEventEmitter extends EventEmitter {}

const ticketEvents = new TicketEventEmitter();

// Event names
ticketEvents.EVENTS = {
  TICKET_CREATED: 'ticket.created',
  TICKET_UPDATED: 'ticket.updated',
  STATUS_CHANGED: 'ticket.status_changed',
  PRIORITY_CHANGED: 'ticket.priority_changed',
  TICKET_ASSIGNED: 'ticket.assigned',
  COMMENT_ADDED: 'comment.added',
  TICKET_RESOLVED: 'ticket.resolved',
  TICKET_CLOSED: 'ticket.closed',
};

module.exports = ticketEvents;
