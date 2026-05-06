import NotFound from '@/app/not-found';
import { ProductDetails, ProductGallery } from '@/components/organisms';
import { listProducts } from '@/lib/data/products';
import Image from 'next/image';
import Link from 'next/link';

import { HomeProductSection } from '../HomeProductSection/HomeProductSection';

export const ProductDetailsPage = async ({
  handle,
  locale
}: {
  handle: string;
  locale: string;
}) => {
  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true
  }).then(({ response }) => response.products[0]);

  if (!prod) return null;

  if (prod.seller?.store_status === 'SUSPENDED') {
    return NotFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link
          href={`/${locale}/categories`}
          className="text-[13px] leading-5 text-[#155EEF] lg:label-md"
        >
          返回市场频道
        </Link>
        <Link
          href={`/${locale}/search?q=${encodeURIComponent(prod.title || '今日鲜货')}`}
          className="text-[13px] leading-5 text-[#155EEF] lg:label-md"
        >
          查看相似鲜货
        </Link>
      </div>

      <div
        className="grid gap-4 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:rounded-sm lg:p-4"
        data-testid="product-details-page"
      >
        <div
          className="min-w-0 overflow-hidden rounded-sm border border-[#E5E7EB] bg-[#F8FAFC]"
          data-testid="product-gallery-container"
        >
          {prod?.images?.length ? (
            <ProductGallery images={prod.images} />
          ) : (
            <div className="relative aspect-square min-h-[280px]">
              <Image
                src="/images/local-market/seafood-market-hero.png"
                alt={`${prod.title} 商品图`}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
        <div
          className="min-w-0"
          data-testid="product-details-container"
        >
          <ProductDetails
            product={prod}
            locale={locale}
          />
        </div>
      </div>

      <div className="my-4 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:rounded-sm">
        <HomeProductSection
          heading="同档口更多鲜货"
          products={prod.seller?.products}
          // seller_handle={prod.seller?.handle}
          locale={locale}
        />
      </div>
    </div>
  );
};
