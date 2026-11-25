const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');

const seedInitialData = async () => {
  try {
    // 1. Ensure Demo Users exist
    let demoUser = await User.findOne({ email: 'user@company.com' });
    if (!demoUser) {
      demoUser = new User({
        name: 'Demo User',
        email: 'user@company.com',
        password: 'Password123!',
        role: 'user',
        organization: 'Acme Support Ops',
      });
      await demoUser.save();
      console.log('[Seed] Created Demo User: user@company.com / Password123!');
    }

    let adminUser = await User.findOne({ email: 'admin@company.com' });
    if (!adminUser) {
      adminUser = new User({
        name: 'Support Admin',
        email: 'admin@company.com',
        password: 'Password123!',
        role: 'admin',
        organization: 'SupportDesk Operations',
      });
      await adminUser.save();
      console.log('[Seed] Created Support Admin: admin@company.com / Password123!');
    }

    // 2. Ensure Sample Tickets exist matching Stitch UI
    const tickets = [
      {
        ticketId: 'TKT-1042',
        title: 'SSO SAML configuration error on login',
        description:
          'Hi team, we just rotated our IdP X.509 certificate for SAML SSO, and now all users are hitting an Invalid SAML Assertion: Signature verification failed error when trying to sign in. Can you help us check what is cached on your end?',
        category: 'technical',
        priority: 'urgent',
        status: 'open',
        createdBy: demoUser._id,
        assignedTo: adminUser._id,
      },
      {
        ticketId: 'TKT-1041',
        title: 'Webhook payload signature mismatch in staging',
        description:
          'Staging webhooks are failing HMAC SHA256 validation against the secret key configured in developer portal. Please verify the signing algorithm.',
        category: 'api',
        priority: 'high',
        status: 'in_progress',
        createdBy: demoUser._id,
        assignedTo: adminUser._id,
      },
      {
        ticketId: 'TKT-1039',
        title: 'Role permissions not syncing for newly invited members',
        description:
          'When inviting new workspace admins, their privileges default to read-only viewer until manual browser refresh and cache purge.',
        category: 'feature',
        priority: 'medium',
        status: 'open',
        createdBy: demoUser._id,
        assignedTo: adminUser._id,
      },
      {
        ticketId: 'TKT-1036',
        title: 'API rate limit 429 errors on batch export endpoint',
        description:
          'Our automated midnight sync job received HTTP 429 responses despite being well below the agreed 1,000 req/min enterprise quota.',
        category: 'api',
        priority: 'urgent',
        status: 'in_progress',
        createdBy: demoUser._id,
        assignedTo: adminUser._id,
      },
      {
        ticketId: 'TKT-1032',
        title: 'Update billing invoice recipient email address',
        description:
          'Please update our accounting invoice dispatch address to finance-ops@acmecorp.example.com effective immediately.',
        category: 'billing',
        priority: 'low',
        status: 'resolved',
        createdBy: demoUser._id,
        assignedTo: adminUser._id,
      },
      {
        ticketId: 'TKT-1030',
        title: 'Custom domain SSL renewal verification failed',
        description:
          'Automated Let’s Encrypt renewal failed for portal.acmecorp.com due to ACME challenge DNS timeout.',
        category: 'technical',
        priority: 'medium',
        status: 'closed',
        createdBy: demoUser._id,
        assignedTo: adminUser._id,
      },
    ];

    for (const t of tickets) {
      await Ticket.updateOne({ ticketId: t.ticketId }, { $setOnInsert: t }, { upsert: true });
    }

    const primaryTicket = await Ticket.findOne({ ticketId: 'TKT-1042' });
    if (primaryTicket) {
      const commentCount = await Comment.countDocuments({ ticketId: primaryTicket._id });
      if (commentCount === 0) {
        const comments = [
          {
            ticketId: primaryTicket._id,
            userId: demoUser._id,
            message:
              'Hi team, we just rotated our IdP X.509 certificate for SAML SSO, and now all users are hitting an Invalid SAML Assertion: Signature verification failed error when trying to sign in. Can you help us check what is cached on your end?',
            isInternal: false,
            createdAt: new Date(Date.now() - 35 * 60 * 1000),
          },
          {
            ticketId: primaryTicket._id,
            userId: adminUser._id,
            message:
              'Checked tenant SSO metadata in Admin Console. The old certificate fingerprint is still active because the metadata XML was not re-fetched after rotation. Need to ask Demo User to confirm if they uploaded the new metadata URL or static XML.',
            isInternal: true,
            createdAt: new Date(Date.now() - 25 * 60 * 1000),
          },
          {
            ticketId: primaryTicket._id,
            userId: adminUser._id,
            message:
              'Hello! I inspected your workspace SAML configuration and noticed the previous X.509 certificate fingerprint is still cached. Could you confirm whether you updated the metadata via a dynamic URL or pasted the static XML? Once confirmed, I can flush the IdP cache immediately.',
            isInternal: false,
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
          },
        ];
        await Comment.insertMany(comments);

        const logs = [
          {
            ticketId: primaryTicket._id,
            actorId: demoUser._id,
            eventType: 'ticket.created',
            description: 'Ticket created by Demo User',
            metadata: { ticketId: 'TKT-1042', priority: 'urgent' },
            createdAt: new Date(Date.now() - 35 * 60 * 1000),
          },
          {
            ticketId: primaryTicket._id,
            actorId: adminUser._id,
            eventType: 'ticket.assigned',
            description: 'Ticket assigned to Support Admin',
            metadata: { ticketId: 'TKT-1042', assignedTo: adminUser._id },
            createdAt: new Date(Date.now() - 30 * 60 * 1000),
          },
          {
            ticketId: primaryTicket._id,
            actorId: adminUser._id,
            eventType: 'comment.added',
            description: 'Internal note added by Support Admin',
            metadata: { isInternal: true },
            createdAt: new Date(Date.now() - 25 * 60 * 1000),
          },
          {
            ticketId: primaryTicket._id,
            actorId: adminUser._id,
            eventType: 'comment.added',
            description: 'Public reply sent by Support Admin',
            metadata: { isInternal: false },
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
          },
        ];
        await ActivityLog.insertMany(logs);
      }
    }
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  }
};

module.exports = { seedInitialData };
