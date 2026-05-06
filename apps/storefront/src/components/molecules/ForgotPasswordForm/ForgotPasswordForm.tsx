'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FetchError } from '@medusajs/js-sdk';
import Link from 'next/link';
import { FieldError, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { Button } from '@/components/atoms';
import { LabeledInput } from '@/components/cells';
import { sendResetPasswordEmail } from '@/lib/data/customer';
import { toast } from '@/lib/helpers/toast';

import { ForgotPasswordFormData, forgotPasswordSchema } from './schema';

export const ForgotPasswordForm = () => {
  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  );
};

const Form = () => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset
  } = useFormContext<ForgotPasswordFormData>();

  const submit = async (data: ForgotPasswordFormData) => {
    if (!data.email) return;

    const result = await sendResetPasswordEmail(data.email);

    if (!result.success) {
      toast.error({ title: result.error || '发生错误，请稍后重试。' });
      return;
    }

    reset({ email: '' });

    toast.success({
      title: `已提交密码重置申请。如果 ${data.email} 对应账户存在，你将收到重置邮件；链接有效期为 1 小时。`
    });
  };

  return (
    <div
      className="mx-auto mt-6 w-full max-w-xl space-y-4 rounded-sm border p-4"
      data-testid="forgot-password-form-container"
    >
      <h1 className="heading-md my-0 mb-2 uppercase text-primary">忘记密码？</h1>
      <p className="text-md">输入注册邮箱，我们会发送密码重置邮件。</p>
      <form
        onSubmit={handleSubmit(submit)}
        data-testid="forgot-password-form"
      >
        <div className="space-y-4">
          <LabeledInput
            label="邮箱"
            placeholder="请输入邮箱地址"
            error={errors.email as FieldError}
            data-testid="forgot-password-email-input"
            {...register('email')}
          />
        </div>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full uppercase"
            disabled={isSubmitting}
            data-testid="forgot-password-submit-button"
          >
            重置密码
          </Button>

          <Link
            href="/user"
            className="flex"
            data-testid="forgot-password-back-to-login-link"
          >
            <Button
              variant="tonal"
              className="flex w-full justify-center uppercase"
            >
              返回登录
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};
