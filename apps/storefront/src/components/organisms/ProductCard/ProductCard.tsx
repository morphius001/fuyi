"use client";

import { HttpTypes } from "@medusajs/types";
import Image from "next/image";

import { Button } from "@/components/atoms";
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink";
import { getProductPrice } from "@/lib/helpers/get-product-price";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";

export const ProductCard = ({
  product,
  className,
}: {
  product: HttpTypes.StoreProduct | Product;
  className?: string;
}) => {
  if (!product) {
    return null;
  }

  const { cheapestPrice } = getProductPrice({
    product: product as HttpTypes.StoreProduct,
  });

  const productName = String(product.title || "商品");
  const seller = (product as any).seller;
  const tagValues =
    (product as HttpTypes.StoreProduct).tags
      ?.slice(0, 2)
      .map((tag) => tag.value)
      .filter(Boolean) || [];
  const cardTags = tagValues.length ? tagValues : ["今日到货", "本地档口"];

  return (
    <div
      className={cn(
        "group relative flex w-full min-w-[250px] flex-col justify-between rounded-sm border p-1 transition-shadow hover:shadow-sm lg:w-[calc(25%-1rem)]",
        className,
      )}
      data-testid="product-card"
      data-product-handle={product.handle}
    >
      <div
        className="relative aspect-square h-full w-full bg-primary"
        data-testid="product-card-image-container"
      >
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`查看 ${productName}`}
          title={`查看 ${productName}`}
          data-testid="product-card-link"
        >
          <div className="absolute left-2 top-2 z-10 rounded-sm bg-action px-2 py-1 text-xs font-semibold text-action-on-primary">
            今日鲜货
          </div>
          <div className="align-center flex h-full w-full justify-center overflow-hidden rounded-sm">
            {product.thumbnail ? (
              <Image
                priority
                fetchPriority="high"
                src={decodeURIComponent(product.thumbnail)}
                alt={`${productName} 商品图`}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-square h-full w-full rounded-xs object-cover object-center transition-all duration-300 lg:group-hover:-mt-14"
                data-testid="product-card-image"
              />
            ) : (
              <Image
                priority
                fetchPriority="high"
                src="/images/placeholder.svg"
                alt={`${productName} 商品图占位`}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                data-testid="product-card-placeholder-image"
              />
            )}
          </div>
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`查看更多 ${productName} 信息`}
          title={`查看更多 ${productName} 信息`}
        >
          <Button
            className="absolute bottom-1 z-10 hidden h-auto w-full rounded-sm bg-action uppercase text-action-on-primary lg:h-[48px] lg:group-hover:block"
            data-testid="product-card-see-more-button"
          >
            查看详情
          </Button>
        </LocalizedClientLink>
      </div>
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={`进入 ${productName} 页面`}
        title={`进入 ${productName} 页面`}
      >
        <div
          className="p-4"
          data-testid="product-card-info"
        >
          <div className="w-full">
            <h3
              className="heading-sm truncate"
              data-testid="product-card-title"
            >
              {product.title}
            </h3>
            <div
              className="mt-2 flex items-center gap-2"
              data-testid="product-card-price"
            >
              <span className="text-xs text-secondary">今日参考价</span>
              <p
                className="font-medium text-ui-fg-interactive"
                data-testid="product-card-current-price"
              >
                {cheapestPrice?.calculated_price || "价格待确认"}
              </p>
              {cheapestPrice?.calculated_price !==
                cheapestPrice?.original_price && (
                <p
                  className="text-sm text-gray-500 line-through"
                  data-testid="product-card-original-price"
                >
                  {cheapestPrice?.original_price}
                </p>
              )}
            </div>
            <div className="mt-3 space-y-1 text-xs text-secondary">
              <p>市场：{seller?.city || "本地市场"}</p>
              <p>档口：{seller?.name || "认证商家"}</p>
              <p className="text-[#155EEF]">履约：进店选择</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-secondary">
              {cardTags.map((tag) => (
                <span key={tag} className="rounded-sm bg-component-secondary px-2 py-1">
                  {tag}
                </span>
              ))}
              <span className="rounded-sm bg-component-secondary px-2 py-1">
                售后保障
              </span>
            </div>
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  );
};
