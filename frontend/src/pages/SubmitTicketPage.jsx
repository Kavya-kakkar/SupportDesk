import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Send,
  Bold,
  Italic,
  Code,
  List,
  Link as LinkIcon,
  UploadCloud,
  Clock,
  Activity,
  CheckCircle,
} from 'lucide-react';
import api from '../api/client';

export default function SubmitTicketPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('technical');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch recent user tickets/activities for the sidebar
    const loadRecent = async () => {
      try {
        const res = await api.get('/tickets?limit=3');
        if (res.data?.data) {
          setRecentActivities(res.data.data);
        }
      } catch (e) {
        // quiet fallback
      }
    };
    loadRecent();
  }, []);

  const handleFormatText = (prefix, suffix = '') => {
    const textarea = document.getElementById('ticket-description');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    setDescription(
      description.substring(0, start) + replacement + description.substring(end)
    );
  };

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...uploaded]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/tickets', {
        title: subject,
        category,
        priority,
        description,
      });

      const created = res.data.data.ticket;
      navigate(`/tickets/${created._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary bg-primary-fixed px-space-sm py-space-xs rounded-full font-semibold">
              Support Portal
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">/</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              New Request
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Submit a Support Ticket
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Provide detailed information below so our engineering and operations teams can route your request.
          </p>
        </div>

        <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm border border-outline-variant">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="font-label-md text-label-md text-on-surface">
            All Systems Operational
          </span>
        </div>
      </div>

      {/* Main Grid: Form (8 col) + Sidebar Guidelines (4 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-space-lg flex flex-col gap-space-lg">
          {error && (
            <div className="rounded-lg p-3 bg-error-container text-on-error-container font-body-sm text-body-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
            {/* Subject */}
            <div className="flex flex-col gap-space-xs">
              <label
                className="font-title-sm text-title-sm text-on-surface flex items-center justify-between"
                htmlFor="ticket-subject"
              >
                <span>
                  Subject <span className="text-error">*</span>
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {subject.length} / 120 characters
                </span>
              </label>
              <input
                id="ticket-subject"
                type="text"
                required
                maxLength={120}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Webhook delivery timeout on production environment"
                className="w-full h-10 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container border border-transparent focus:border-primary transition-colors"
              />
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <label className="font-title-sm text-title-sm text-on-surface" htmlFor="ticket-category">
                  Category <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    id="ticket-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 pl-space-md pr-space-xl rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container border border-transparent focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Account</option>
                    <option value="feature">Feature Request</option>
                    <option value="api">API & Integrations</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                <span className="font-title-sm text-title-sm text-on-surface">
                  Priority <span className="text-error">*</span>
                </span>
                <div className="grid grid-cols-4 gap-space-xs bg-surface-container-low p-space-xs rounded-lg">
                  {[
                    { id: 'low', label: 'Low', color: 'bg-outline' },
                    { id: 'medium', label: 'Medium', color: 'bg-primary-container' },
                    { id: 'high', label: 'High', color: 'bg-tertiary-container' },
                    { id: 'urgent', label: 'Urgent', color: 'bg-error' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`flex items-center justify-center gap-1.5 h-8 rounded-md font-label-md text-label-md transition-all ${
                        priority === p.id
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                          : 'text-on-surface-variant hover:bg-surface-container-lowest'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${p.color}`} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description & Formatting Bar */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-title-sm text-title-sm text-on-surface" htmlFor="ticket-description">
                  Description <span className="text-error">*</span>
                </label>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Markdown supported
                </span>
              </div>
              <div className="rounded-xl bg-surface-container-low overflow-hidden flex flex-col border border-outline-variant">
                <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container border-b border-outline-variant">
                  <button
                    type="button"
                    title="Bold"
                    onClick={() => handleFormatText('**', '**')}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface transition-colors"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Italic"
                    onClick={() => handleFormatText('*', '*')}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface transition-colors"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Code"
                    onClick={() => handleFormatText('`', '`')}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface transition-colors"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Bullet List"
                    onClick={() => handleFormatText('\n- ')}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface transition-colors"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Link"
                    onClick={() => handleFormatText('[', '](url)')}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  id="ticket-description"
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, steps to reproduce, expected behavior, and any relevant request IDs..."
                  className="w-full p-space-md bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none resize-y"
                />
              </div>
            </div>

            {/* Attachments Dropzone */}
            <div className="flex flex-col gap-space-xs">
              <span className="font-title-sm text-title-sm text-on-surface">Attachments</span>
              <label
                htmlFor="file-input"
                className="rounded-xl bg-surface-container-low p-space-lg flex flex-col items-center justify-center gap-space-sm text-center cursor-pointer hover:bg-surface-container border border-dashed border-outline-variant transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <UploadCloud className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col gap-space-xs">
                  <p className="font-title-sm text-title-sm text-on-surface">
                    Drag & drop files here, or <span className="text-primary underline">browse</span>
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Supports PNG, JPG, PDF, LOG, and JSON up to 25MB each
                  </p>
                </div>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {files.length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container text-body-sm"
                    >
                      <span className="truncate max-w-xs">{file.name}</span>
                      <span className="text-on-surface-variant text-label-sm">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-space-md pt-space-sm border-t border-outline-variant">
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="h-10 px-space-lg rounded-lg bg-surface-container-low text-on-surface font-title-sm text-title-sm hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-space-lg rounded-lg bg-primary-container text-on-primary font-title-sm text-title-sm hover:bg-secondary transition-colors flex items-center gap-space-sm shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar: Guidelines & Recent Activity */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Support Guidelines Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="font-title-md text-title-md text-on-surface">Support Guidelines</h2>
              </div>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Our engineering team responds according to severity tier SLAs:
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-label-md text-label-md text-error font-medium">Urgent</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  &lt; 1 hour (24/7)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-label-md text-label-md text-tertiary font-medium">High</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  &lt; 4 business hours
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-label-md text-label-md text-primary font-medium">Medium</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  &lt; 24 business hours
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  Low
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  &lt; 48 business hours
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-title-md text-title-md text-on-surface">Recent Requests</h2>
            </div>

            {recentActivities.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No previous requests found.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentActivities.map((act) => (
                  <Link
                    key={act._id}
                    to={`/tickets/${act._id}`}
                    className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-primary font-semibold">
                        {act.ticketId}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant capitalize">
                        {act.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface truncate">
                      {act.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
