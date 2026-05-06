'use client';

import { useEffect, useState } from 'react';

import { CheckCircle } from '@medusajs/icons';

import { Card } from '@/components/atoms';
import { cn } from '@/lib/utils';

function validatePassword(password: string) {
  const errors = {
    tooShort: password.length < 8,
    noLower: !/[a-z]/.test(password),
    noUpper: !/[A-Z]/.test(password),
    noDigit: !/[0-9]/.test(password),
    noSymbol: !/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)
  };

  return {
    isValid: !Object.values(errors).some(Boolean),
    errors
  };
}

export const PasswordValidator = ({
  password,
  setError
}: {
  password: string;
  setError: (error: any) => void;
}) => {
  const [newPasswordError, setNewPasswordError] = useState({
    isValid: false,
    lower: false,
    upper: false,
    '8chars': false,
    digit: false,
    symbol: false
  });

  useEffect(() => {
    const validation = validatePassword(password);

    setError({
      isValid: validation.isValid,
      lower: validation.errors.noLower,
      upper: validation.errors.noUpper,
      '8chars': validation.errors.tooShort,
      digit: validation.errors.noDigit,
      symbol: validation.errors.noSymbol
    });
    setNewPasswordError({
      isValid: validation.isValid,
      lower: validation.errors.noLower,
      upper: validation.errors.noUpper,
      '8chars': validation.errors.tooShort,
      digit: validation.errors.noDigit,
      symbol: validation.errors.noSymbol
    });
  }, [password]);
  return (
    <Card className="p-4">
      <p
        className={cn(
          'label-md mb-2 flex items-center gap-2',
          newPasswordError['8chars'] ? 'text-red-700' : 'text-green-700'
        )}
      >
        <CheckCircle /> 至少 8 个字符
      </p>
      <p
        className={cn(
          'label-md mb-2 flex items-center gap-2',
          newPasswordError['lower'] ? 'text-red-700' : 'text-green-700'
        )}
      >
        <CheckCircle /> 至少一个小写字母
      </p>
      <p
        className={cn(
          'label-md mb-2 flex items-center gap-2',
          newPasswordError['upper'] ? 'text-red-700' : 'text-green-700'
        )}
      >
        <CheckCircle /> 至少一个大写字母
      </p>
      <p
        className={cn(
          'label-md mb-2 flex items-center gap-2',
          newPasswordError['digit'] ? 'text-red-700' : 'text-green-700'
        )}
      >
        <CheckCircle /> 至少一个数字
      </p>
      <p
        className={cn(
          'label-md mb-2 flex items-center gap-2',
          newPasswordError['symbol'] ? 'text-red-700' : 'text-green-700'
        )}
      >
        <CheckCircle /> 至少一个特殊字符
      </p>
    </Card>
  );
};
