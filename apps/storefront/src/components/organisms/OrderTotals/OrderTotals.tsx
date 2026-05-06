import { Card, Divider } from "@/components/atoms";
import { convertToLocale } from "@/lib/helpers/money";

export const OrderTotals = ({ orderSet }: { orderSet: any }) => {
  const delivery = orderSet.shipping_total;
  const subtotal = orderSet.total - delivery;
  const total = orderSet.total;

  const currency_code = orderSet.payment_collection.currency_code;

  return (
    <Card className="mb-8 p-4">
      <p className="label-md mb-2 flex justify-between text-secondary">
        商品金额：
        <span className="text-primary">
          {convertToLocale({
            amount: subtotal,
            currency_code,
          })}
        </span>
      </p>
      <p className="label-md flex justify-between text-secondary">
        配送费：
        <span className="text-primary">
          {convertToLocale({
            amount: delivery,
            currency_code,
          })}
        </span>
      </p>
      <Divider className="my-4" />
      <p className="label-md flex items-center justify-between text-secondary">
        合计：
        <span className="text-primary heading-md">
          {convertToLocale({
            amount: total,
            currency_code,
          })}
        </span>
      </p>
    </Card>
  );
};
