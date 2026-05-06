import { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/molecules/ForgotPasswordForm/ForgotPasswordForm';

export const metadata: Metadata = {
  title: '忘记密码',
  description: '重置密码'
};

export default function ForgotPasswordPage() {
  return (
    <main className="container">
      <ForgotPasswordForm />
    </main>
  );
}
