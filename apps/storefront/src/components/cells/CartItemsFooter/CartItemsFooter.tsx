import { convertToLocale } from '@/lib/helpers/money';

export const CartItemsFooter = ({
  currency_code,
  price
}: {
  currency_code: string;
  price: number;
}) => {
  return (
    <div className="label-md flex items-center justify-between rounded-sm border p-4">
      <div>
        <p className="text-secondary">商家配送费</p>
        <p className="mt-1 text-xs text-secondary">最终配送方式和费用以结算页返回为准</p>
      </div>
      <p>
        {convertToLocale({
          amount: price / 1,
          currency_code
        })}
      </p>
    </div>
  );
};
