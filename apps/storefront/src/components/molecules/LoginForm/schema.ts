import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().nonempty('请输入邮箱').email('请输入有效邮箱'),
  password: z.string().nonempty('请输入密码')
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
