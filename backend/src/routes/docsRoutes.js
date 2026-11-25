const express = require('express');
const router = express.Router();

const API_DIRECTORY = {
  service: 'SupportDesk API',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  status: 'online',
  health: '/api/health',
  documentation: '/docs',
  demoCredentials: {
    admin: { email: 'admin@company.com', password: 'Password123!', role: 'admin' },
    customer: { email: 'user@company.com', password: 'Password123!', role: 'user' },
  },
  endpoints: [
    { method: 'GET', path: '/api/health', access: 'Public', description: 'System health check & status' },
    { method: 'POST', path: '/api/auth/register', access: 'Public', description: 'Register a new customer account' },
    { method: 'POST', path: '/api/auth/login', access: 'Public', description: 'Authenticate user & obtain JWT token' },
    { method: 'GET', path: '/api/auth/me', access: 'Authenticated', description: 'Get current authenticated user profile' },
    { method: 'GET', path: '/api/tickets', access: 'Customer', description: 'Get customer tickets with pagination & SLA stats' },
    { method: 'POST', path: '/api/tickets', access: 'Customer', description: 'Create a new support ticket' },
    { method: 'GET', path: '/api/tickets/:id', access: 'Owner/Admin', description: 'Get ticket details and comments' },
    { method: 'PUT', path: '/api/tickets/:id', access: 'Owner/Admin', description: 'Update permitted ticket fields' },
    { method: 'DELETE', path: '/api/tickets/:id', access: 'Owner/Admin', description: 'Delete ticket' },
    { method: 'GET', path: '/api/tickets/:id/activity', access: 'Owner/Admin', description: 'Get ticket audit activity trail' },
    { method: 'GET', path: '/api/tickets/:id/comments', access: 'Owner/Admin', description: 'Get ticket conversation thread' },
    { method: 'POST', path: '/api/tickets/:id/comments', access: 'Owner/Admin', description: 'Post customer reply or admin internal note' },
    { method: 'GET', path: '/api/admin/dashboard', access: 'Admin', description: 'Get operational telemetry, volume trends & SLA health' },
    { method: 'GET', path: '/api/admin/tickets', access: 'Admin', description: 'Filter, search, sort, and paginate all tickets' },
    { method: 'PATCH', path: '/api/admin/tickets/:id/status', access: 'Admin', description: 'Update ticket status (open, in_progress, resolved, closed)' },
    { method: 'PATCH', path: '/api/admin/tickets/:id/priority', access: 'Admin', description: 'Update ticket priority (low, medium, high, urgent)' },
  ],
};

const renderDocsHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SupportDesk API — Interactive Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background-color: #F8FAFC; color: #0F172A; line-height: 1.5; padding: 2rem 1rem; }
    .container { max-width: 960px; margin: 0 auto; }
    .header { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    .badge { display: inline-flex; align-items: center; gap: 0.5rem; background: #DCFCE7; color: #166534; font-size: 0.8125rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1rem; }
    .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #22C55E; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
    h1 { font-size: 1.875rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem; letter-spacing: -0.025em; }
    p.lead { color: #475569; font-size: 1rem; margin-bottom: 1.5rem; }
    .demo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .demo-card { background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1rem; font-size: 0.875rem; }
    .demo-card strong { display: block; color: #0F172A; margin-bottom: 0.25rem; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; background: #FFFFFF; padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid #CBD5E1; color: #0F172A; }
    .card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 2rem; }
    h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: #0F172A; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; text-align: left; }
    th { background: #F8FAFC; color: #475569; font-weight: 600; padding: 0.75rem 1rem; border-bottom: 1px solid #E2E8F0; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    td { padding: 0.875rem 1rem; border-bottom: 1px solid #F1F5F9; }
    tr:last-child td { border-bottom: none; }
    .method { display: inline-block; font-weight: 700; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 6px; font-family: 'JetBrains Mono', monospace; min-width: 54px; text-align: center; }
    .get { background: #EFF6FF; color: #1D4ED8; }
    .post { background: #ECFDF5; color: #047857; }
    .put { background: #FFFBEB; color: #B45309; }
    .patch { background: #FAF5FF; color: #7E22CE; }
    .delete { background: #FEF2F2; color: #B91C1C; }
    .access-tag { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 6px; background: #F1F5F9; color: #475569; }
    .footer { text-align: center; color: #64748B; font-size: 0.875rem; margin-top: 2rem; }
    .footer a { color: #0284C7; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge"><span class="badge-dot"></span> API Operational &amp; Connected</div>
      <h1>SupportDesk API Service</h1>
      <p class="lead">Production-grade Helpdesk &amp; Support Ticket Management System RESTful API.</p>
      
      <div class="demo-grid">
        <div class="demo-card">
          <strong>👑 Admin Console Access</strong>
          Email: <code>admin@company.com</code><br>
          Password: <code>Password123!</code>
        </div>
        <div class="demo-card">
          <strong>👤 Customer Portal Access</strong>
          Email: <code>user@company.com</code><br>
          Password: <code>Password123!</code>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Endpoints Reference</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Endpoint</th>
            <th>Access</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${API_DIRECTORY.endpoints
            .map(
              (ep) => `<tr>
            <td><span class="method ${ep.method.toLowerCase()}">${ep.method}</span></td>
            <td><code>${ep.path}</code></td>
            <td><span class="access-tag">${ep.access}</span></td>
            <td>${ep.description}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Health probe: <a href="/api/health"><code>/api/health</code></a> | GitHub Repository: <a href="https://github.com/Kavya-kakkar/SupportDesk" target="_blank">Kavya-kakkar/SupportDesk</a></p>
    </div>
  </div>
</body>
</html>`;

router.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.type('html').send(renderDocsHtml());
  }
  return res.json(API_DIRECTORY);
});

module.exports = router;
