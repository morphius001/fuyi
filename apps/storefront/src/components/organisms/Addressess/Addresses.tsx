"use client";
import { Button, Card } from "@/components/atoms";
import { AddressForm, Modal } from "@/components/molecules";
import { emptyDefaultAddressValues } from "@/components/molecules/AddressForm/AddressForm";
import { AddressFormData } from "@/components/molecules/AddressForm/schema";
import { deleteCustomerAddress } from "@/lib/data/customer";
import { cn } from "@/lib/utils";
import { HttpTypes } from "@medusajs/types";
import { isEmpty } from "lodash";
import { useState } from "react";

export const Addresses = ({
  user,
  regions,
}: {
  user: HttpTypes.StoreCustomer;
  regions: HttpTypes.StoreRegion[];
}) => {
  const [showForm, setShowForm] = useState(false);
  const [deleteAddress, setDeleteAddress] = useState<string | null>(null);

  const [defaultValues, setDefaultValues] = useState<AddressFormData | null>(
    null,
  );

  const countries = regions.flatMap((region) => region.countries);
  const getCountryName = (countryCode?: string | null) =>
    countries.find((country) => country && country.iso_2 === countryCode)
      ?.display_name || countryCode?.toUpperCase();

  const formatAddress = (address: HttpTypes.StoreCustomerAddress) =>
    [
      address.province,
      address.city,
      address.company,
      address.address_1,
      address.address_2,
    ]
      .filter(Boolean)
      .join(" ");

  const handleEdit = (addressId: string) => {
    const address = user.addresses.find((address) => address.id === addressId);
    if (address) {
      setDefaultValues({
        addressId: addressId,
        addressName: address.address_name || "",
        firstName: address.first_name || "",
        lastName: address.last_name || "",
        address: address.address_1 || "",
        city: address.city || "",
        countryCode: address.country_code || "",
        postalCode: address.postal_code || "",
        company: address.company || "",
        province: address.province || "",
        phone: address.phone || user.phone || "",
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (addressId: string) => {
    await deleteCustomerAddress(addressId);
    setDeleteAddress(null);
  };

  const handleAdd = () => {
    setDefaultValues(emptyDefaultAddressValues);
    setDeleteAddress(null);
    setShowForm(true);
  };

  return (
    <>
      <div
        className={cn(
          "md:col-span-3",
          isEmpty(user.addresses) ? "space-y-8" : "space-y-4",
        )}
        data-testid="addresses-container"
      >
        <h1 className="heading-md uppercase" data-testid="addresses-heading">
          收货地址
        </h1>
        {isEmpty(user.addresses) ? (
          <div className="text-center" data-testid="addresses-empty-state">
            <h3
              className="heading-lg text-primary uppercase"
              data-testid="addresses-empty-heading"
            >
              暂无收货地址
            </h3>
            <p
              className="text-lg text-secondary mt-2"
              data-testid="addresses-empty-description"
            >
              添加常用地址后，结算时可快速选择。
            </p>
            <Button
              onClick={handleAdd}
              className="mt-4"
              data-testid="addresses-add-button"
            >
              新增地址
            </Button>
          </div>
        ) : (
          <>
            <div data-testid="addresses-list">
              {user.addresses.map((address) => (
                <Card
                  className="px-4 flex justify-between items-start gap-4 max-w-2xl"
                  key={address.id}
                  data-testid={`address-card-${address.id}`}
                >
                  <div className="flex flex-col ">
                    <h4
                      className="label-md text-primary"
                      data-testid={`address-${address.id}-name`}
                    >
                      {address.address_name}
                    </h4>
                    <p
                      className="label-md text-secondary"
                      data-testid={`address-${address.id}-full-name`}
                    >
                      {`${address.last_name}${address.first_name}`}
                    </p>
                    {address.company && (
                      <p
                        className="label-md text-secondary"
                        data-testid={`address-${address.id}-company`}
                      >
                        区县/街道：{address.company}
                      </p>
                    )}
                    <p
                      className="label-md text-secondary"
                      data-testid={`address-${address.id}-full-address`}
                    >
                      {`${formatAddress(address)}${
                        address.postal_code ? `，邮编：${address.postal_code}` : ""
                      }${
                        getCountryName(address.country_code)
                          ? `，${getCountryName(address.country_code)}`
                          : ""
                      }`}
                    </p>
                    <p
                      className="label-md text-secondary"
                      data-testid={`address-${address.id}-contact`}
                    >
                      {`${address.phone || user.phone}，${user.email}`}
                    </p>
                  </div>
                  <div className="flex gap-2 sm:gap-4 flex-col-reverse sm:flex-row">
                    <Button
                      variant="tonal"
                      className="text-negative"
                      onClick={() => setDeleteAddress(address.id)}
                      data-testid={`address-delete-button-${address.id}`}
                    >
                      删除
                    </Button>
                    <Button
                      variant="tonal"
                      onClick={() => handleEdit(address.id)}
                      data-testid={`address-edit-button-${address.id}`}
                    >
                      编辑
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {user.addresses.length < 6 && (
              <Button onClick={handleAdd} data-testid="addresses-add-button">
                新增地址
              </Button>
            )}
          </>
        )}
      </div>
      {showForm && (
        <Modal
          heading={
            defaultValues?.addressId
              ? `编辑地址：${defaultValues.addressName}`
              : "新增地址"
          }
          onClose={() => setShowForm(false)}
        >
          <AddressForm
            regions={regions}
            handleClose={() => setShowForm(false)}
            defaultValues={defaultValues || emptyDefaultAddressValues}
          />
        </Modal>
      )}
      {deleteAddress && (
        <Modal
          heading="确认删除地址"
          onClose={() => setDeleteAddress(null)}
          data-testid="address-delete-modal"
        >
          <div className="px-4 flex flex-col gap-4">
            <p>确定要删除这个收货地址吗？</p>
            <div className="flex justify-end gap-4">
              <Button
                variant="tonal"
                onClick={() => setDeleteAddress(null)}
                data-testid="address-delete-cancel-button"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteAddress)}
                data-testid="address-delete-confirm-button"
              >
                删除
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
