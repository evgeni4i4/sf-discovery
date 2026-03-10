'use client';

import { useState, type FormEvent } from 'react';
import { signInWithMagicLink } from '@/lib/auth';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      await signInWithMagicLink(email.trim());
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong',
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2">SF Discovery</h1>
        <p className="text-center text-gray-500 mb-8">
          Sign in to start discovering San Francisco
        </p>

        {status === 'sent' ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-green-800 font-medium">Check your email</p>
            <p className="text-green-600 text-sm mt-2">
              We sent a magic link to <strong>{email}</strong>.
              Click the link in the email to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                disabled={status === 'loading'}
              />
            </div>

            {status === 'error' && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {status === 'loading' ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
