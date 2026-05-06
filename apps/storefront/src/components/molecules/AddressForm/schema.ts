import { z } from "zod";

export const addressSchema = z.object({
  addressId: z.string().optional(),
  addressName: z.string().nonempty("请输入地址名称"),
  firstName: z.string().nonempty("请输入收货人名"),
  lastName: z.string().nonempty("请输入收货人姓"),
  address: z.string().nonempty("请输入详细地址"),
  city: z.string().nonempty("请输入城市"),
  countryCode: z.string().nonempty("请选择国家/地区"),
  postalCode: z.string().nonempty("请输入邮政编码"),
  company: z.string().optional(),
  province: z.string().nonempty("请输入省 / 自治区 / 直辖市"),
  phone: z
    .string()
    .nonempty("请输入手机号")
    .regex(/^(1[3-9]\d{9}|\+861[3-9]\d{9})$/, "请输入有效的中国大陆手机号"),
  metadata: z.record(z.any()).optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
