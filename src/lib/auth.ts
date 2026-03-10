import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Sign in with magic link (passwordless email).
 * Sends a one-time login link to the provided email address.
 */
export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // After clicking the link, redirect back to the app
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw new Error(`Sign-in failed: ${error.message}`);
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Sign-out failed: ${error.message}`);
}

/**
 * Get the current session (null if not authenticated).
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current user (null if not authenticated).
 */
export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void,
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session),
  );
  return () => subscription.unsubscribe();
}
