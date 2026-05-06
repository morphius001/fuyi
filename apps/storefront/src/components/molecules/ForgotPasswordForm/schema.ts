import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().nonempty('请输入邮箱').email('请输入有效邮箱')
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
