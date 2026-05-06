'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Container } from '@medusajs/ui';
import Link from 'next/link';
import { FieldError, FieldValues, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { Button } from '@/components/atoms';
import { LabeledInput } from '@/components/cells';
import { PasswordValidator } from '@/components/cells/PasswordValidator/PasswordValidator';
import { signup } from '@/lib/data/customer';
import { toast } from '@/lib/helpers/toast';

import { RegisterFormData, registerFormSchema } from './schema';

export const RegisterForm = () => {
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: ''
    }
  });

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  );
};

const Form = () => {
  const [passwordError, setPasswordError] = useState({
    isValid: false,
    lower: false,
    upper: false,
    '8chars': false,
    symbolOrDigit: false
  });

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting }
  } = useFormContext<RegisterFormData>();

  const submit = async (data: RegisterFormData) => {
    if (!passwordError.isValid) {
      return;
    }

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('first_name', data.firstName);
    formData.append('last_name', data.lastName);
    formData.append('phone', data.phone);

    const res = await signup(formData);

    if (res && !res?.id) {
      // Temporary solution. Check also for status code when it's fixed by backend
      const errorMessage = res.toLowerCase().includes('error: identity with email already exists')
        ? '该邮箱已绑定其他账户，请直接登录。'
        : res;
      toast.error({ title: errorMessage });
    }
  };

  return (
    <main
      className="container"
      data-testid="register-page"
    >
      <Container
        className="mx-auto mt-8 max-w-xl border p-4"
        data-testid="register-form-container"
      >
        <h1 className="heading-md mb-8 uppercase text-primary">创建账户</h1>
        <form
          onSubmit={handleSubmit(submit)}
          data-testid="register-form"
        >
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <LabeledInput
              className="md:w-1/2"
              label="名"
              placeholder="请输入名"
              error={errors.firstName as FieldError}
              data-testid="register-first-name-input"
              {...register('firstName')}
            />
            <LabeledInput
              className="md:w-1/2"
              label="姓"
              placeholder="请输入姓"
              error={errors.lastName as FieldError}
              data-testid="register-last-name-input"
              {...register('lastName')}
            />
          </div>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <LabeledInput
              className="md:w-1/2"
              label="邮箱"
              placeholder="请输入邮箱地址"
              error={errors.email as FieldError}
              data-testid="register-email-input"
              {...register('email')}
            />
            <LabeledInput
              className="md:w-1/2"
              label="手机号"
              placeholder="请输入中国大陆手机号"
              error={errors.phone as FieldError}
              data-testid="register-phone-input"
              {...register('phone')}
            />
          </div>
          <div>
            <LabeledInput
              className="mb-4"
              label="密码"
              placeholder="请输入密码"
              type="password"
              error={errors.password as FieldError}
              data-testid="register-password-input"
              {...register('password')}
            />
            <PasswordValidator
              password={watch('password')}
              setError={setPasswordError}
            />
          </div>

          <Button
            className="mt-8 flex w-full justify-center uppercase"
            disabled={isSubmitting}
            loading={isSubmitting}
            data-testid="register-submit-button"
          >
            创建账户
          </Button>
        </form>
      </Container>
      <Container className="mx-auto mt-8 max-w-xl border p-4">
        <h2 className="heading-md mb-8 uppercase text-primary">已有账户？</h2>
        <Link
          href="/login"
          data-testid="register-login-link"
        >
          <Button
            variant="tonal"
            className="mt-8 flex w-full justify-center uppercase"
          >
            登录
          </Button>
        </Link>
      </Container>
    </main>
  );
};
