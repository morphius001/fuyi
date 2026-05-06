import { z } from 'zod';

export const registerFormSchema = z.object({
  firstName: z.string().nonempty('请输入名').max(50, '名最多 50 个字符'),
  lastName: z.string().nonempty('请输入姓').max(50, '姓最多 50 个字符'),
  email: z.string().nonempty('请输入邮箱').email('请输入有效邮箱').max(60, '邮箱最多 60 个字符'),
  password: z
    .string()
    .nonempty('请输入密码')
    .min(8, '密码至少 8 个字符')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
      message: '密码需包含至少一个大写字母、一个数字和一个特殊字符'
    })
    .max(64, '密码最多 64 个字符'),
  phone: z
    .string()
    .min(1, '请输入手机号')
    .regex(/^(1[3-9]\d{9}|\+861[3-9]\d{9})$/, { message: '请输入有效的中国大陆手机号' })
    .max(20, '手机号最多 20 个字符')
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
