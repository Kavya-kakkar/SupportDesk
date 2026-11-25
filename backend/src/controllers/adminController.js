const Ticket = require('../models/Ticket');
const ActivityLog = require('../models/ActivityLog');
const ticketService = require('../services/ticketService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getAllTickets(req.query);
    return successResponse(res, 200, 'Admin tickets retrieved successfully.', result.tickets, {
      pagination: result.pagination,
      counts: result.counts,
      metrics: result.metrics,
    });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await ticketService.updateStatus(req.params.id, status, req.user);
    return successResponse(res, 200, `Ticket status updated to ${ticket.status}.`, { ticket });
  } catch (err) {
    next(err);
  }
};

const updatePriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    const ticket = await ticketService.updatePriority(req.params.id, priority, req.user);
    return successResponse(res, 200, `Ticket priority updated to ${ticket.priority}.`, { ticket });
  } catch (err) {
    next(err);
  }
};

const assignTicket = async (req, res, next) => {
  try {
    const { assigneeId } = req.body;
    const ticket = await ticketService.assignTicket(req.params.id, assigneeId, req.user);
    return successResponse(res, 200, 'Ticket assignment updated.', { ticket });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Status Counts
    const [
      totalCount,
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      urgentCount,
      highCount,
      mediumCount,
      lowCount,
    ] = await Promise.all([
      Ticket.countDocuments({}),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in_progress' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Ticket.countDocuments({ status: 'closed' }),
      Ticket.countDocuments({ priority: 'urgent' }),
      Ticket.countDocuments({ priority: 'high' }),
      Ticket.countDocuments({ priority: 'medium' }),
      Ticket.countDocuments({ priority: 'low' }),
    ]);

    // 2. High Priority / Urgent Escalation Queue
    const escalations = await Ticket.find({
      priority: { $in: ['urgent', 'high'] },
      status: { $in: ['open', 'in_progress'] },
    })
      .populate('createdBy', 'name email organization')
      .populate('assignedTo', 'name email')
      .sort({ priority: 1, createdAt: 1 })
      .limit(6);

    // 3. Ticket Volume & Resolution Trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const incomingByDay = await Ticket.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const resolvedByDay = await Ticket.aggregate([
      {
        $match: {
          status: 'resolved',
          updatedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format 7 days trend array
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const incoming = incomingByDay.find((x) => x._id === dateKey)?.count || 0;
      const resolved = resolvedByDay.find((x) => x._id === dateKey)?.count || 0;

      trend.push({
        date: dateKey,
        day: dayName,
        incoming,
        resolved,
      });
    }

    // 4. Resolved today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedTodayCount = await Ticket.countDocuments({
      status: 'resolved',
      updatedAt: { $gte: today },
    });

    // 5. Live SLA & First Response Time Metrics from database
    const operationalMetrics = await ticketService.calculateOperationalMetrics({});

    return successResponse(res, 200, 'Admin dashboard statistics.', {
      telemetry: {
        totalTickets: totalCount,
        openTickets: openCount,
        inProgressTickets: inProgressCount,
        resolvedTickets: resolvedCount,
        closedTickets: closedCount,
        openQueue: openCount + inProgressCount,
        urgentTickets: urgentCount,
        resolvedToday: resolvedTodayCount,
        avgFirstResponseTime: operationalMetrics.avgFirstResponseTime,
        avgFirstResponseMinutes: operationalMetrics.avgFirstResponseMinutes,
        slaCompliance: operationalMetrics.slaCompliance,
        slaStatusText: operationalMetrics.slaStatusText,
      },
      byPriority: {
        urgent: urgentCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      byStatus: {
        open: openCount,
        in_progress: inProgressCount,
        resolved: resolvedCount,
        closed: closedCount,
      },
      volumeTrend: trend,
      escalations,
    });
  } catch (err) {
    next(err);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const { search, actor, eventType, dateRange, page = 1, limit = 15 } = req.query;
    const filter = {};

    if (eventType && eventType.toLowerCase() !== 'all') {
      filter.eventType = eventType;
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      if (dateRange === '24h') {
        const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filter.createdAt = { $gte: since };
      } else if (dateRange === '7d') {
        const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filter.createdAt = { $gte: since };
      } else if (dateRange === '30d') {
        const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filter.createdAt = { $gte: since };
      }
    }

    if (search && search.trim()) {
      filter.description = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total, total24h] = await Promise.all([
      ActivityLog.find(filter)
        .populate('actorId', 'name email role')
        .populate('ticketId', 'ticketId title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ActivityLog.countDocuments(filter),
      ActivityLog.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    return successResponse(res, 200, 'Activity logs retrieved.', logs, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      events24h: total24h,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTickets,
  updateStatus,
  updatePriority,
  assignTicket,
  getDashboardStats,
  getActivityLogs,
};
