'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { account } from '@/lib/appwrite'; // <- import Appwrite account

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      await account.createRecovery(email, 'https://startuphq-ai.vercel.app/reset-password'); // change this to your deployed reset page
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we’ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </Button>

          {status === 'success' && (
            <p className="text-green-600 text-sm">✅ Reset email sent! Check your inbox.It may take more time so please wait.</p>
          )}
          {status === 'error' && (
            <p className="text-red-600 text-sm">❌ {error}</p>
          )}
        </CardContent>
      </form>
      <div className="mt-4 p-6 pt-0 text-center text-sm">
        <Link href="/login" className="underline">
          Back to login
        </Link>
      </div>
    </Card>
  );
}
