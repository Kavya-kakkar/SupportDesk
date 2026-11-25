import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, ArrowRight, Eye, EyeOff, Bolt, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  const { login, register, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ text: '', isError: false });
    setLoading(true);

    try {
      if (mode === 'signin') {
        const user = await login(email, password);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/tickets');
        }
      } else {
        const user = await register({
          name: name || organization || email.split('@')[0],
          email,
          password,
          organization: organization || 'Acme Support Ops',
        });
        navigate('/tickets');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error' || !err.response
          ? 'Cannot connect to backend server. Please ensure backend is running on http://localhost:5000.'
          : 'Authentication failed. Please check your credentials.');
      setFeedback({ text: msg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const demoEmail = role === 'admin' ? 'admin@company.com' : 'user@company.com';
    const demoPassword = 'Password123!';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setMode('signin');
    setLoading(true);
    setFeedback({ text: '', isError: false });

    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/tickets');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error' || !err.response
          ? 'Cannot connect to backend server. Please ensure backend is running on http://localhost:5000.'
          : 'Demo sign-in failed. Please try again.');
      setFeedback({ text: msg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-margin bg-surface">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl border border-outline-variant">
            {/* Logo and Subtitle */}
            <div className="flex flex-col items-center text-center mb-space-lg">
              <div className="flex items-center gap-2.5 mb-space-md">
                <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                  SupportDesk
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {mode === 'signin'
                  ? 'Sign in to access your support workspace'
                  : 'Create a new SupportDesk workspace account'}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div
              className="grid grid-cols-2 gap-1 p-1 bg-surface-container rounded-lg mb-space-lg"
              role="tablist"
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setFeedback({ text: '', isError: false });
                }}
                className={`py-2 px-3 rounded-md font-title-sm text-title-sm transition-all ${
                  mode === 'signin'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFeedback({ text: '', isError: false });
                }}
                className={`py-2 px-3 rounded-md font-title-sm text-title-sm transition-all ${
                  mode === 'register'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
              {mode === 'register' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="name">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface" htmlFor="org">
                      Workspace Name
                    </label>
                    <input
                      id="org"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Acme Support Ops"
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-colors"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                  Work Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() =>
                        setFeedback({
                          text: 'For demo accounts, use Password123! or the quick-fill buttons below.',
                          isError: false,
                        })
                      }
                      className="font-label-md text-label-md text-primary hover:text-secondary transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-9 pl-3 pr-9 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface flex items-center justify-center"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-on-surface-variant" />
                    ) : (
                      <Eye className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'signin' && (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded accent-primary-container cursor-pointer"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Remember me
                    </span>
                  </label>
                </div>
              )}

              {feedback.text && (
                <div
                  className={`rounded-lg px-3 py-2 font-body-sm text-body-sm ${
                    feedback.isError
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-primary-fixed text-on-primary-fixed-variant'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 rounded-lg bg-primary-container hover:bg-secondary text-on-primary font-title-sm text-title-sm transition-colors flex items-center justify-center gap-2 mt-1 shadow-sm disabled:opacity-50"
              >
                <span>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access Credentials */}
            <div className="mt-space-lg pt-space-md bg-surface-container-low -mx-space-xl -mb-space-xl px-space-xl pb-space-xl rounded-b-xl border-t border-outline-variant">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider font-semibold">
                  Demo Access
                </span>
                <span className="font-label-sm text-label-sm text-outline">
                  Quick-fill credentials
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('user')}
                  className="w-full h-8 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center justify-between shadow-sm border border-outline-variant disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>Sign in as Demo User (Customer)</span>
                  </span>
                  <Bolt className="w-3.5 h-3.5 text-outline" />
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin('admin')}
                  className="w-full h-8 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center justify-between shadow-sm border border-outline-variant disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Sign in as Support Admin</span>
                  </span>
                  <Bolt className="w-3.5 h-3.5 text-outline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
