const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      index: true,
      default: null,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: [
        'ticket.created',
        'ticket.updated',
        'ticket.status_changed',
        'ticket.priority_changed',
        'ticket.assigned',
        'comment.added',
        'ticket.resolved',
        'ticket.closed',
        'system.event',
      ],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
