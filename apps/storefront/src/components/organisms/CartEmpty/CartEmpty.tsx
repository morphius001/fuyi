import { Button } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';

export function CartEmpty() {
  return (
    <div
      className="col-span-12 flex justify-center py-6 pt-4"
      data-testid="cart-empty"
    >
      <div className="flex w-[466px] flex-col">
        <h2 className="heading-lg text-center text-primary">购物车</h2>
        <p className="mt-2 text-center text-lg text-secondary">
          购物车还是空的，先去挑选几件商品吧。
        </p>
        <LocalizedClientLink
          href="/categories"
          className="mt-6"
        >
          <Button className="flex w-full items-center justify-center py-3">去逛逛</Button>
        </LocalizedClientLink>
      </div>
    </div>
  );
}
