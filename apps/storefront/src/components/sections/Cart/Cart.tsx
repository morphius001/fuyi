'use client';

import { Button } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { CartEmpty, CartItems, CartSummary } from '@/components/organisms';
import { useCartContext } from '@/components/providers';

export const Cart = () => {
  const { cart } = useCartContext();

  if (!cart || !cart.items?.length) {
    return <CartEmpty />;
  }

  return (
    <>
      <div className="col-span-12 lg:col-span-6">
        <CartItems cart={cart} />
      </div>
      <div className="lg:col-span-2"></div>
      <div className="col-span-12 lg:col-span-4">
        <div className="h-fit rounded-sm border p-4">
          <div className="mb-4">
            <h2 className="heading-sm text-primary">购物车汇总</h2>
            <p className="mt-1 text-sm text-secondary">
              生鲜、海鲜商品会按商家和市场履约规则结算；配送费和可达范围以结算页为准。
            </p>
          </div>
          <CartSummary
            item_total={cart?.item_subtotal || 0}
            shipping_total={cart?.shipping_subtotal || 0}
            total={cart?.total || 0}
            currency_code={cart?.currency_code || ''}
            tax={cart?.tax_total || 0}
            discount_total={cart?.discount_subtotal || 0}
          />
          <LocalizedClientLink href="/checkout?step=address">
            <Button className="sticky bottom-3 flex w-full items-center justify-center py-3 md:static">
              去结算
            </Button>
          </LocalizedClientLink>
          <p className="mt-3 text-xs text-secondary">
            提货卡是独立提货凭证，不在购物车中作为优惠券、余额或支付方式使用。
          </p>
        </div>
      </div>
    </>
  );
};
