import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Sign In | Owuan',
  description: 'Sign in to your Owuan account',
};

export default function LoginPage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-32">
      <AuthForm mode="signin" />
    </main>
  );
}
