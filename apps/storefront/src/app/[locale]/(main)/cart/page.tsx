import { Suspense } from 'react';

import { Metadata } from 'next';
import Link from 'next/link';

import { Cart } from '@/components/sections';

export const metadata: Metadata = {
  title: '购物车',
  description: '我的购物车'
};

export default async function CartPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="w-screen max-w-[100vw] overflow-x-hidden bg-[#F6F8FB] pb-16 text-primary lg:w-full lg:max-w-none lg:bg-white lg:pb-0">
      <section className="px-3 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/${locale}/search`} className="text-[13px] leading-5 text-[#155EEF]">
            返回
          </Link>
          <h1 className="text-[18px] font-semibold leading-6">购物车</h1>
          <Link href={`/${locale}`} className="text-[13px] leading-5 text-[#155EEF]">
            继续买
          </Link>
        </div>
      </section>

      <section className="container grid grid-cols-12 gap-y-4 px-3 pb-4 lg:px-0">
        <Suspense fallback={<>加载中...</>}>
          <Cart />
        </Suspense>
      </section>

      <nav className="fixed bottom-0 left-0 z-30 grid w-screen max-w-[100vw] grid-cols-[repeat(5,60px)] justify-center gap-x-3 border-t border-[#E5E7EB] bg-white px-2 py-2 text-center text-[12px] leading-4 text-secondary shadow-[0_-4px_16px_rgba(15,23,42,0.08)] lg:hidden">
        <Link href={`/${locale}`} className="truncate text-secondary">
          首页
        </Link>
        <Link href={`/${locale}/search`} className="truncate text-secondary">
          找货
        </Link>
        <Link href={`/${locale}/categories`} className="truncate text-secondary">
          档口
        </Link>
        <Link href={`/${locale}/cart`} className="truncate font-semibold text-[#155EEF]">
          购物车
        </Link>
        <Link href={`/${locale}/user/orders`} className="truncate text-secondary">
          我的
        </Link>
      </nav>
    </main>
  );
}
