import { Card } from "@/components/atoms";
import { retrieveCustomer } from "@/lib/data/customer";
import { getRegion } from "@/lib/data/regions";

export const OrderAddresses = async ({ singleOrder }: { singleOrder: any }) => {
  const user = await retrieveCustomer();
  const region = await getRegion(singleOrder.shipping_address.country_code);
  const formatAddress = (address: any) =>
    [
      address?.province,
      address?.city,
      address?.company,
      address?.address_1,
      address?.address_2,
    ]
      .filter(Boolean)
      .join(" ");

  if (!user) return null;

  return (
    <Card className="px-4 grid sm:grid-cols-2 gap-4">
      <div className="flex flex-col ">
        <h4 className="label-md text-primary">收货地址</h4>
        <p className="label-md text-secondary">
          {`${singleOrder.shipping_address.last_name}${singleOrder.shipping_address.first_name}`}
        </p>
        <p className="label-md text-secondary">
          {`${formatAddress(singleOrder.shipping_address)}${
            singleOrder.shipping_address.postal_code
              ? `，邮编：${singleOrder.shipping_address.postal_code}`
              : ""
          }${
            region
              ? `，${region.name}`
              : `，${singleOrder.shipping_address.country_code?.toUpperCase()}`
          }`}
        </p>
        <p className="label-md text-secondary">
          {`${singleOrder.shipping_address.phone || user.phone}，${user.email}`}
        </p>
      </div>
      <div>
        <h4 className="label-md text-primary">账单地址</h4>
        {singleOrder.billing_address.id === singleOrder.shipping_address.id ? (
          <p className="label-md text-secondary">同收货地址</p>
        ) : (
          <>
            <p className="label-md text-secondary">
              {`${singleOrder.billing_address.last_name}${singleOrder.billing_address.first_name}`}
            </p>
            <p className="label-md text-secondary">
              {`${formatAddress(singleOrder.billing_address)}${
                singleOrder.billing_address.postal_code
                  ? `，邮编：${singleOrder.billing_address.postal_code}`
                  : ""
              }${
                region
                  ? `，${region.name}`
                  : `，${singleOrder.billing_address.country_code?.toUpperCase()}`
              }`}
            </p>
            <p className="label-md text-secondary">
              {`${singleOrder.billing_address.phone || user.phone}，${
                user.email
              }`}
            </p>
          </>
        )}
      </div>
    </Card>
  );
};
