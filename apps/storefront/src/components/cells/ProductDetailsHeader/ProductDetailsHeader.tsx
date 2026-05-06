'use client';

import { HttpTypes } from '@medusajs/types';

import { Button } from '@/components/atoms';
import { ProductVariants } from '@/components/molecules';
import { Chat } from '@/components/organisms/Chat/Chat';
import { useCartContext } from '@/components/providers';
import useGetAllSearchParams from '@/hooks/useGetAllSearchParams';
import { getProductPrice } from '@/lib/helpers/get-product-price';
import { toast } from '@/lib/helpers/toast';
import { SellerProps } from '@/types/seller';
import { Wishlist } from '@/types/wishlist';

import { WishlistButton } from '../WishlistButton/WishlistButton';

const optionsAsKeymap = (variantOptions: HttpTypes.StoreProductVariant['options']) => {
  return variantOptions?.reduce(
    (acc: Record<string, string>, varopt: HttpTypes.StoreProductOptionValue) => {
      acc[varopt.option?.title.toLowerCase() || ''] = varopt.value;

      return acc;
    },
    {}
  );
};

export const ProductDetailsHeader = ({
  product,
  locale,
  user,
  wishlist
}: {
  product: HttpTypes.StoreProduct & { seller?: SellerProps };
  locale: string;
  user: HttpTypes.StoreCustomer | null;
  wishlist?: Wishlist;
}) => {
  const { addToCart, onAddToCart, cart, isAddingItem } = useCartContext();
  const { allSearchParams } = useGetAllSearchParams();

  const { cheapestVariant, cheapestPrice } = getProductPrice({
    product
  });

  // Check if product has any valid prices in current region
  const hasAnyPrice = cheapestPrice !== null && cheapestVariant !== null;

  // set default variant
  const selectedVariant = hasAnyPrice
    ? {
        ...optionsAsKeymap(cheapestVariant.options ?? null),
        ...allSearchParams
      }
    : allSearchParams;

  // get selected variant id
  const variantId =
    product.variants?.find(({ options }: { options: any }) =>
      options?.every((option: any) =>
        selectedVariant[option.option?.title.toLowerCase() || '']?.includes(option.value)
      )
    )?.id || '';

  // get variant price
  const { variantPrice } = getProductPrice({
    product,
    variantId
  });

  const variantStock =
    product.variants?.find(({ id }) => id === variantId)?.inventory_quantity || 0;

  const variantHasPrice = !!product.variants?.find(({ id }) => id === variantId)?.calculated_price;

  const isVariantStockMaxLimitReached =
    (cart?.items?.find(item => item.variant_id === variantId)?.quantity ?? 0) >= variantStock;

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!variantId || !hasAnyPrice || isVariantStockMaxLimitReached) return;

    const subtotal = +(variantPrice?.calculated_price_without_tax_number || 0);
    const total = +(variantPrice?.calculated_price_number || 0);

    const storeCartLineItem = {
      thumbnail: product.thumbnail || '',
      product_title: product.title,
      quantity: 1,
      subtotal,
      total,
      tax_total: total - subtotal,
      variant_id: variantId,
      product_id: product.id,
      variant: product.variants?.find(({ id }) => id === variantId)
    };

    // Optimistic update
    onAddToCart(storeCartLineItem, variantPrice?.currency_code || 'eur');

    try {
      await addToCart({
        variantId: variantId,
        quantity: 1,
        countryCode: locale
      });
    } catch (error) {
      toast.error({
        title: '加入购物车失败',
        description: '当前规格库存不足，请选择其他规格后重试。'
      });
    }
  };

  const isAddToCartDisabled =
    !variantStock || !variantHasPrice || !hasAnyPrice || isVariantStockMaxLimitReached;
  const selectedSpec = Object.values(selectedVariant).filter(Boolean).join(' / ');
  const productTags = product.tags?.slice(0, 3).map(tag => tag.value).filter(Boolean) || [];
  const trustTags = productTags.length
    ? productTags
    : ['今日到货', '本地档口', '支持自提'];
  const productNotice = product.title?.includes('蟹') || product.title?.includes('鲜')
    ? '鲜活建议自提'
    : '到店确认规格';
  const stallFulfillment = ['到店自提', '档口自送', '市场统一配送'];

  return (
    <div
      className="rounded-sm border p-5 pb-24 md:pb-5"
      data-testid="product-details-header"
    >
      <div className="flex justify-between">
        <div>
          <h2 className="label-md text-secondary">本地鲜货 / 市场档口直发</h2>
          <h1
            className="heading-lg text-primary"
            data-testid="product-title"
          >
            {product.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {trustTags.map(tag => (
              <span
                key={tag}
                className="rounded-sm bg-ui-bg-subtle px-2 py-1 text-xs font-medium text-ui-fg-subtle"
              >
                {tag}
              </span>
            ))}
            {product.seller && (
              <span className="rounded-sm bg-ui-bg-subtle px-2 py-1 text-xs font-medium text-ui-fg-subtle">
                商家已入驻
              </span>
            )}
          </div>
          <div className="mt-4" data-testid="product-price-container">
            <p className="label-md text-secondary">今日参考价</p>
            {hasAnyPrice && variantPrice ? (
              <div className="mt-1 flex flex-wrap items-end gap-2">
                <span
                  className="heading-md text-ui-fg-interactive"
                  data-testid="product-price-current"
                >
                  {variantPrice.calculated_price}
                </span>
                {variantPrice.calculated_price_number !== variantPrice.original_price_number && (
                  <span
                    className="label-md text-secondary line-through"
                    data-testid="product-price-original"
                  >
                    {variantPrice.original_price}
                  </span>
                )}
                <span className="label-sm text-secondary">实际金额以结算页为准</span>
              </div>
            ) : (
              <span
                className="label-md pb-4 pt-2 text-secondary"
                data-testid="product-price-unavailable"
              >
                当前地区暂不可售
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-sm border bg-ui-bg-subtle p-3">
              <p className="text-ui-fg-muted">当前规格</p>
              <p className="mt-1 font-medium text-ui-fg-base">
                {selectedSpec || '请选择规格'}
              </p>
            </div>
            <div className="rounded-sm border bg-ui-bg-subtle p-3">
              <p className="text-ui-fg-muted">可售库存</p>
              <p className="mt-1 font-medium text-ui-fg-base">
                {variantStock ? `${variantStock} 件/份` : '待确认'}
              </p>
            </div>
            <div className="rounded-sm border bg-ui-bg-subtle p-3">
              <p className="text-ui-fg-muted">本商品提示</p>
              <p className="mt-1 font-medium text-ui-fg-base">{productNotice}</p>
            </div>
            <div className="rounded-sm border bg-ui-bg-subtle p-3">
              <p className="text-ui-fg-muted">售后保障</p>
              <p className="mt-1 font-medium text-ui-fg-base">坏损举证</p>
            </div>
          </div>
        </div>
        <div>
          {/* Add to Wishlist */}
          <WishlistButton
            productId={product.id}
            wishlist={wishlist}
            user={user}
          />
        </div>
      </div>
      {/* Product Variants */}
      {hasAnyPrice && (
        <ProductVariants
          product={product}
          selectedVariant={selectedVariant}
        />
      )}
      <div className="mb-4 rounded-sm border border-[#DBEAFE] bg-[#F8FBFF] p-3 text-sm text-ui-fg-subtle">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium text-[#1E3A8A]">档口取送能力</p>
            <p className="mt-1 text-xs text-[#475569]">
              市场可提供统一配送，商家自行选择是否加入；结算页按档口确认。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stallFulfillment.map(item => (
              <span
                key={item}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#1D4ED8] ring-1 ring-[#BFDBFE]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4 rounded-sm border border-ui-border-base bg-ui-bg-subtle p-3 text-sm text-ui-fg-subtle">
        活鲜、冰鲜、冷冻商品可能受市场营业时间、商家备货、称重和配送范围影响；下单前请确认规格、数量和取送方式。
      </div>
      {/* Add to Cart */}
      <Button
        onClick={handleAddToCart}
        disabled={isAddToCartDisabled}
        loading={isAddingItem}
        className="mb-4 flex w-full justify-center py-3 uppercase"
        size="large"
        data-testid="product-add-to-cart-button"
      >
        {!hasAnyPrice
          ? '当前地区暂不可售'
          : variantStock && variantHasPrice
            ? '加入购物车'
            : '暂时缺货'}
      </Button>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-primary p-3 shadow-lg md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-secondary">{product.title}</p>
            <p className="heading-sm text-primary">
              {variantPrice?.calculated_price || cheapestPrice?.calculated_price || '价格待确认'}
            </p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            loading={isAddingItem}
            className="shrink-0 uppercase"
            size="small"
            data-testid="product-sticky-add-to-cart-button"
          >
            {variantStock && variantHasPrice && hasAnyPrice ? '加入购物车' : '不可购买'}
          </Button>
        </div>
      </div>
      {/* Seller message */}

      {user && product.seller && (
        <Chat
          user={user}
          seller={product.seller}
          buttonClassNames="w-full uppercase"
          product={product}
        />
      )}
    </div>
  );
};
