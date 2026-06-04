import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth';

export const metadata: Metadata = {
  title: 'Create Account | Owuan',
  description: 'Create your Owuan account',
};

export default function RegisterPage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center px-4 py-32">
      <AuthForm mode="signup" />
    </main>
  );
}
