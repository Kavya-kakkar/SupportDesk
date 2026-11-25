const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/database');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');
const Comment = require('../src/models/Comment');
const ActivityLog = require('../src/models/ActivityLog');
require('../src/services/eventService'); // register event listeners

describe('SupportDesk Full-Stack API Test Suite', () => {
  let customerUser;
  let anotherUser;
  let adminUser;
  let customerToken;
  let anotherToken;
  let adminToken;
  let createdTicketId;
  let createdTicketMongoId;

  beforeAll(async () => {
    await connectDB();

    // Clean test collections
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Comment.deleteMany({});
    await ActivityLog.deleteMany({});
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  // Scenario 1: User registration and login
  describe('1. Authentication: Registration and Login', () => {
    it('should register a new customer account successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Customer',
          email: 'alice@example.com',
          password: 'Password123!',
          organization: 'Alice Enterprises',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.role).toBe('user');
      expect(res.body.data.user.password).toBeUndefined(); // Security: never return password

      customerToken = res.body.data.token;
      customerUser = res.body.data.user;
    });

    it('should register a second customer account for permission isolation testing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Unrelated',
          email: 'bob@example.com',
          password: 'Password123!',
          organization: 'Bob Co',
        });

      expect(res.status).toBe(201);
      anotherToken = res.body.data.token;
      anotherUser = res.body.data.user;
    });

    it('should register an admin user directly in DB for testing', async () => {
      const admin = new User({
        name: 'Chief Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'admin',
        organization: 'SupportDesk Global Ops',
      });
      await admin.save();
      adminUser = admin;

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Password123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.role).toBe('admin');
      adminToken = loginRes.body.data.token;
    });

    it('should login an existing user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return current user profile via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('alice@example.com');
    });
  });

  // Scenario 2: Invalid credentials
  describe('2. Authentication: Invalid Credentials Handling', () => {
    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Alice',
          email: 'alice@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  // Scenario 3: Protected routes without JWT
  describe('3. Security: Protected Routes Without JWT', () => {
    it('should reject accessing /api/tickets without Authorization header', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token provided/i);
    });

    it('should reject accessing /api/tickets with invalid malformed JWT', async () => {
      const res = await request(app)
        .get('/api/tickets')
        .set('Authorization', 'Bearer invalid_malformed_token_string');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // Scenario 6: Ticket creation
  describe('6. Ticket Management: Ticket Creation', () => {
    it('should allow customer to create a new ticket', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: 'Database connection pool exhausted',
          description: 'Production cluster reaching max pool size during burst operations.',
          category: 'technical',
          priority: 'urgent',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticket.ticketId).toBeDefined();
      expect(res.body.data.ticket.title).toBe('Database connection pool exhausted');
      expect(res.body.data.ticket.status).toBe('open');
      expect(res.body.data.ticket.priority).toBe('urgent');

      createdTicketMongoId = res.body.data.ticket._id;
      createdTicketId = res.body.data.ticket.ticketId;
    });

    it('should reject ticket creation with missing subject or description', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: '',
          description: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // Scenario 4: User attempting to access another user's ticket
  describe("4. Security: Access Isolation (User accessing another's ticket)", () => {
    it("should forbid Bob from accessing Alice's ticket details", async () => {
      const res = await request(app)
        .get(`/api/tickets/${createdTicketMongoId}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/permission/i);
    });

    it("should allow Alice to access her own ticket details", async () => {
      const res = await request(app)
        .get(`/api/tickets/${createdTicketMongoId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.title).toBe('Database connection pool exhausted');
    });

    it("should allow Admin to access any ticket details", async () => {
      const res = await request(app)
        .get(`/api/tickets/${createdTicketMongoId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.ticketId).toBe(createdTicketId);
    });
  });

  // Scenario 5: User attempting to access admin endpoints
  describe('5. Security: Role-Based Authorization on Admin Endpoints', () => {
    it('should return 403 Forbidden when normal user calls GET /api/admin/tickets', async () => {
      const res = await request(app)
        .get('/api/admin/tickets')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 Forbidden when normal user calls GET /api/admin/dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 Forbidden when normal user attempts PATCH /api/admin/tickets/:id/status', async () => {
      const res = await request(app)
        .patch(`/api/admin/tickets/${createdTicketMongoId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'resolved' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // Scenario 7: Ticket updates
  describe('7. Ticket Management: Ticket Updates', () => {
    it('should allow customer to update permitted fields on their ticket', async () => {
      const res = await request(app)
        .put(`/api/tickets/${createdTicketMongoId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          title: 'Database connection pool exhausted [Updated]',
          category: 'technical',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.title).toBe('Database connection pool exhausted [Updated]');
    });
  });

  // Scenario 8: Admin status and priority changes
  describe('8. Admin Operations: Status and Priority Changes', () => {
    it('should allow Admin to change ticket status to in_progress', async () => {
      const res = await request(app)
        .patch(`/api/admin/tickets/${createdTicketMongoId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.status).toBe('in_progress');
    });

    it('should allow Admin to change ticket priority to high', async () => {
      const res = await request(app)
        .patch(`/api/admin/tickets/${createdTicketMongoId}/priority`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ priority: 'high' });

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.priority).toBe('high');
    });

    it('should allow Admin to mark ticket resolved', async () => {
      const res = await request(app)
        .patch(`/api/admin/tickets/${createdTicketMongoId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'resolved' });

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.status).toBe('resolved');
    });
  });

  // Scenario 9: Comment creation and internal notes
  describe('9. Collaboration: Comments and Internal Notes', () => {
    it('should allow customer to add a public comment', async () => {
      const res = await request(app)
        .post(`/api/tickets/${createdTicketMongoId}/comments`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          message: 'Here is the stack trace from error logs.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.message).toBe('Here is the stack trace from error logs.');
      expect(res.body.data.comment.isInternal).toBe(false);
    });

    it('should allow Admin to add a private internal note', async () => {
      const res = await request(app)
        .post(`/api/tickets/${createdTicketMongoId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          message: 'Internal ops: RDS CPU spiked to 98% due to missing index.',
          isInternal: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.isInternal).toBe(true);
    });

    it('should hide internal notes from normal customer in comments list', async () => {
      const res = await request(app)
        .get(`/api/tickets/${createdTicketMongoId}/comments`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      const comments = res.body.data.comments;
      expect(comments.some((c) => c.isInternal === true)).toBe(false);
    });

    it('should show internal notes to administrator in comments list', async () => {
      const res = await request(app)
        .get(`/api/tickets/${createdTicketMongoId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const comments = res.body.data.comments;
      expect(comments.some((c) => c.isInternal === true)).toBe(true);
    });
  });

  // Scenario 10: Activity log generation
  describe('10. Event System: Activity Log Generation', () => {
    it('should have recorded activity logs for ticket created, updated, status changed, and comments', async () => {
      // Small pause to ensure event loop listeners executed
      await new Promise((resolve) => setTimeout(resolve, 300));

      const res = await request(app)
        .get(`/api/tickets/${createdTicketMongoId}/activity`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      const activities = res.body.data.activities;
      expect(activities.length).toBeGreaterThanOrEqual(3);

      const eventTypes = activities.map((a) => a.eventType);
      expect(eventTypes).toContain('ticket.created');
      expect(eventTypes).toContain('comment.added');
    });
  });

  // Scenario 11: Search, filtering, and pagination
  describe('11. Query Engine: Search, Filtering, and Pagination', () => {
    it('should filter tickets by status and pagination', async () => {
      const res = await request(app)
        .get('/api/admin/tickets?status=resolved&page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.pagination.page).toBe(1);
    });

    it('should search tickets by subject query', async () => {
      const res = await request(app)
        .get('/api/admin/tickets?search=Database')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toMatch(/Database/i);
    });
  });

  // Scenario 12: Dashboard statistics
  describe('12. Telemetry: Dashboard Statistics', () => {
    it('should return live computed statistics from MongoDB', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.telemetry).toBeDefined();
      expect(res.body.data.telemetry.totalTickets).toBeGreaterThanOrEqual(1);
      expect(res.body.data.byPriority).toBeDefined();
      expect(res.body.data.byStatus).toBeDefined();
      expect(res.body.data.volumeTrend).toBeInstanceOf(Array);
      expect(res.body.data.volumeTrend.length).toBe(7);
    });
  });
});
