'use client';

import { CartSummary } from '@/components/organisms';
import { PromoCode } from '@/components/organisms/PromoCode/PromoCode';

import { CartItems } from './CartItems';
import PaymentButton from './PaymentButton';

const Review = ({ cart }: { cart: any }) => {
  const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard);

  return (
    <div>
      <div className="mb-6 rounded-sm border p-4">
        <h2 className="heading-sm text-primary">核对订单</h2>
        <p className="mt-2 text-sm text-secondary">
          请确认商品规格、数量、收货方式和联系方式。提交后，生鲜海鲜类商品会按商家接单、市场营业时间和配送能力履约。
        </p>
      </div>
      <div className="mb-6 w-full">
        <CartItems cart={cart} />
      </div>

      <div className={'mb-6'}>
        <PromoCode cart={cart} />
      </div>

      <div className="mb-6 w-full rounded-sm border p-4">
        <CartSummary
          item_total={cart?.item_subtotal || 0}
          shipping_total={cart?.shipping_subtotal || 0}
          total={cart?.total || 0}
          currency_code={cart?.currency_code || ''}
          tax={cart?.tax_total || 0}
          discount_total={cart?.discount_total || 0}
        />
      </div>

      {previousStepsCompleted && (
        <>
          <p className="mb-3 text-xs text-secondary">
            点击提交订单后，请以支付渠道和平台后端异步通知结果为准。
          </p>
        <PaymentButton
          cart={cart}
          data-testid="submit-order-button"
        />
        </>
      )}
    </div>
  );
};

export default Review;
