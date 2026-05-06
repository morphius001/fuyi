"use client";

import { FC, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { HttpTypes } from "@medusajs/types";
import {
  FieldError,
  FieldValues,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";

import { Button } from "@/components/atoms";
import { LabeledInput } from "@/components/cells";
import CountrySelect from "@/components/cells/CountrySelect/CountrySelect";
import { addCustomerAddress, updateCustomerAddress } from "@/lib/data/customer";

import { AddressFormData, addressSchema } from "./schema";

interface Props {
  defaultValues?: AddressFormData;

  regions: HttpTypes.StoreRegion[];
  handleClose?: () => void;
}

export const emptyDefaultAddressValues = {
  addressName: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  countryCode: "",
  postalCode: "",
  company: "",
  province: "",
  phone: "",
  metadata: {},
};

export const AddressForm: FC<Props> = ({ defaultValues, ...props }) => {
  const methods = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaultValues || emptyDefaultAddressValues,
  });

  return (
    <FormProvider {...methods}>
      <Form {...props} />
    </FormProvider>
  );
};

const Form: FC<Props> = ({ regions, handleClose }) => {
  const [error, setError] = useState<string>();
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const region = {
    countries: regions.flatMap((region) => region.countries),
  };

  const submit = async (data: FieldValues) => {
    const formData = new FormData();
    formData.append("addressId", data.addressId || "");
    formData.append("address_name", data.addressName);
    formData.append("first_name", data.firstName);
    formData.append("last_name", data.lastName);
    formData.append("address_1", data.address);
    formData.append("address_2", "");
    formData.append("province", data.province);
    formData.append("city", data.city);
    formData.append("country_code", data.countryCode);
    formData.append("postal_code", data.postalCode);
    formData.append("company", data.company);
    formData.append("phone", data.phone);

    const res = data.addressId
      ? await updateCustomerAddress(formData)
      : await addCustomerAddress(formData);

    if (!res.success) {
      setError(res.error);
      return;
    }

    setError("");
    handleClose && handleClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} data-testid="address-form">
      <div className="space-y-4 px-4">
        <div className="items-top mb-4 grid max-w-full grid-cols-2 gap-4">
          <LabeledInput
            label="地址名称"
            placeholder="例如：家、公司"
            className="col-span-2"
            error={errors.addressName as FieldError}
            data-testid="address-form-address-name-input"
            {...register("addressName")}
          />
          <LabeledInput
            label="收货人名"
            placeholder="请输入名"
            error={errors.firstName as FieldError}
            data-testid="address-form-first-name-input"
            {...register("firstName")}
          />
          <LabeledInput
            label="收货人姓"
            placeholder="请输入姓"
            error={errors.lastName as FieldError}
            data-testid="address-form-last-name-input"
            {...register("lastName")}
          />
          <LabeledInput
            label="手机号"
            placeholder="请输入中国大陆手机号"
            error={errors.phone as FieldError}
            data-testid="address-form-phone-input"
            {...register("phone")}
          />
          <LabeledInput
            label="省 / 自治区 / 直辖市"
            placeholder="请输入省份"
            error={errors.province as FieldError}
            data-testid="address-form-province-input"
            {...register("province")}
          />
          <LabeledInput
            label="城市"
            placeholder="请输入城市"
            error={errors.city as FieldError}
            data-testid="address-form-city-input"
            {...register("city")}
          />
          <LabeledInput
            label="区县 / 街道（选填）"
            placeholder="请输入区县、街道或乡镇"
            error={errors.company as FieldError}
            data-testid="address-form-company-input"
            {...register("company")}
          />
          <LabeledInput
            label="详细地址"
            placeholder="请输入小区、楼栋、门牌号"
            error={errors.address as FieldError}
            data-testid="address-form-address-input"
            {...register("address")}
          />
          <LabeledInput
            label="邮政编码"
            placeholder="请输入邮政编码"
            error={errors.postalCode as FieldError}
            data-testid="address-form-postal-code-input"
            {...register("postalCode")}
          />
          <div>
            <CountrySelect
              region={region as HttpTypes.StoreRegion}
              {...register("countryCode")}
              value={watch("countryCode")}
              className="h-12"
              data-testid="address-form-country-select"
            />
            {errors.countryCode && (
              <p
                className="label-sm text-negative"
                data-testid="address-form-country-error"
              >
                {(errors.countryCode as FieldError).message}
              </p>
            )}
          </div>
        </div>
        {error && (
          <p
            className="label-md text-negative"
            data-testid="address-form-error"
          >
            {error}
          </p>
        )}
        <Button className="w-full" data-testid="address-form-submit-button">
          保存地址
        </Button>
      </div>
    </form>
  );
};
