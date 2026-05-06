import Image from 'next/image';

import { Button } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';

export const BannerSection = () => {
  return (
    <section className="container bg-tertiary text-tertiary">
      <div className="grid grid-cols-1 items-center lg:grid-cols-2">
        <div className="flex h-full flex-col justify-between rounded-sm border border-secondary px-6 py-6">
          <div className="mb-8 lg:mb-48">
            <span className="inline-block rounded-sm border border-secondary px-4 py-1 text-sm">
              #精选专题
            </span>
            <h2 className="display-sm">春夏穿搭：舒适与个性刚刚好</h2>
            <p className="max-w-lg text-lg text-tertiary">
              浏览灵感单品和精选组合，快速找到适合日常通勤、出游和聚会的风格。
            </p>
          </div>
          <LocalizedClientLink href="/collections/boho">
            <Button
              size="large"
              className="w-fit bg-secondary/10"
            >
              去看看
            </Button>
          </LocalizedClientLink>
        </div>
        <div className="relative flex aspect-[4/3] justify-end rounded-sm lg:aspect-auto lg:h-full">
          <Image
            loading="lazy"
            fetchPriority="high"
            src="/images/banner-section/Image.jpg"
            alt="春夏穿搭专题"
            width={700}
            height={600}
            className="rounded-sm object-cover object-top"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
};
