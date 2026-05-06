import { HomeProductsCarousel } from '@/components/organisms';
import { Product } from '@/types/product';

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'cn',
  products = [],
  home = false
}: {
  heading: string;
  locale?: string;
  products?: Product[];
  home?: boolean;
}) => {
  return (
    <section className="w-full py-8">
      <h2 className="heading-lg mb-6 font-bold uppercase tracking-tight">{heading}</h2>
      <HomeProductsCarousel
        locale={locale}
        sellerProducts={products.slice(0, 4)}
        home={home}
      />
    </section>
  );
};
