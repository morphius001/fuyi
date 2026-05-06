import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

import {
  freshProducts,
  marketCategories,
  marketHeroImage,
  marketSwitches,
  productTagStyles,
  stalls,
} from "../data/home-market"

export const metadata: Metadata = {
  title: "市场频道",
  description: "按市场、类目和档口浏览本地海鲜生鲜供应。",
}

const productImagePositions = [
  "left 36%",
  "center 42%",
  "right 45%",
  "42% 58%",
  "62% 36%",
  "32% 64%",
]

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="w-screen max-w-[100vw] overflow-x-hidden bg-[#F6F8FB] px-3 pb-24 pt-3 text-primary lg:w-full lg:max-w-none lg:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-[1480px]">
        <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm lg:rounded-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="p-4 lg:p-6">
              <Link
                href={`/${locale}`}
                className="text-[13px] leading-5 text-[#155EEF] lg:label-md"
              >
                返回本地鲜货首页
              </Link>
              <p className="mt-4 label-md text-[#155EEF]">市场频道</p>
              <h1 className="mt-2 text-[28px] font-semibold leading-[36px] tracking-normal lg:text-[38px] lg:leading-[46px]">
                先选市场，再找档口和鲜货
              </h1>
              <p className="mt-3 max-w-[760px] text-sm text-secondary lg:text-md">
                同一平台可切换不同市场，商户可属于多个市场。消费者按市场、档口号和今日上新浏览，履约方式进店后确认。
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["4个", "试点市场"],
                  ["34家", "认证档口"],
                  ["128款", "今日鲜货"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] p-3"
                  >
                    <p className="text-[24px] font-semibold leading-[30px] text-[#155EEF]">
                      {value}
                    </p>
                    <p className="mt-1 text-sm text-secondary">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[220px] border-t border-[#E5E7EB] lg:border-l lg:border-t-0">
              <Image
                src={marketHeroImage}
                alt="本地海鲜生鲜市场"
                fill
                priority
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 rounded-sm bg-white/92 p-3 backdrop-blur">
                <p className="label-lg">三门海鲜市场开市中</p>
                <p className="mt-1 text-sm text-secondary">
                  鲜活区、冰鲜区、干货区同步更新。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:rounded-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="label-lg">可选市场</p>
                <span className="text-sm text-secondary">开关由后台控制</span>
              </div>
              <div className="mt-3 grid gap-3">
                {marketSwitches.map((market, index) => (
                  <Link
                    key={market.name}
                    href={`/${locale}/categories`}
                    className={`rounded-sm border p-3 ${
                      index === 0
                        ? "border-[#155EEF] bg-[#EFF6FF]"
                        : "border-[#E5E7EB] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="label-md">{market.name}</p>
                      <span
                        className={`rounded-sm px-2 py-1 text-[12px] leading-4 ${
                          index === 0
                            ? "bg-[#155EEF] text-white"
                            : "bg-white text-secondary"
                        }`}
                      >
                        {index === 0 ? "当前" : "切换"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-secondary">
                      {market.area} · {market.open}
                    </p>
                    <p className="mt-1 text-sm text-[#155EEF]">
                      {market.delivery} · 今日上新 {market.fresh}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:rounded-sm">
              <p className="label-lg">市场类目</p>
              <div className="mt-3 grid gap-2">
                {marketCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/${locale}/search?q=${encodeURIComponent(
                      category.name
                    )}`}
                    className="rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] p-3 hover:border-[#155EEF]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="label-md">{category.name}</p>
                      <span className="rounded-sm bg-white px-2 py-1 text-[12px] leading-4 text-secondary">
                        {category.count}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-secondary">{category.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <section className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:rounded-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="label-md text-[#155EEF]">档口推荐</p>
                  <h2 className="heading-md">按档口找货</h2>
                </div>
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent("档口")}`}
                  className="label-md text-[#155EEF] hover:underline"
                >
                  更多
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {stalls.map((stall) => (
                  <Link
                    key={stall.handle}
                    href={`/${locale}/sellers/${stall.handle}`}
                    className="rounded-sm border border-[#E5E7EB] bg-white p-4 hover:border-[#155EEF]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate heading-sm">{stall.name}</p>
                        <p className="mt-1 truncate text-sm text-secondary">
                          {stall.market} · {stall.booth}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-sm border border-[#F97316] px-3 py-1.5 text-[13px] leading-4 text-[#EA580C]">
                        进店
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-sm bg-[#E6F7F2] px-2 py-1 text-[12px] leading-4 text-[#0F8F6B]">
                        {stall.status}
                      </span>
                      <span className="rounded-sm bg-[#EFF6FF] px-2 py-1 text-[12px] leading-4 text-[#155EEF]">
                        {stall.badge.replace("展示", "")}
                      </span>
                      {stall.live && (
                        <span className="rounded-sm bg-[#FFF4E5] px-2 py-1 text-[12px] leading-4 text-[#9A4B00]">
                          直播讲货中
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-secondary">
                      主营：{stall.categories}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      履约：进店后选择自提或配送
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:rounded-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="label-md text-[#155EEF]">今日到货</p>
                  <h2 className="heading-md">市场鲜货</h2>
                </div>
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent("今日到货")}`}
                  className="label-md text-[#155EEF] hover:underline"
                >
                  全部
                </Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {freshProducts.slice(0, 6).map((product, index) => (
                  <Link
                    key={product.name}
                    href={`/${locale}/products/${product.handle}`}
                    className="rounded-sm border border-[#E5E7EB] bg-white p-3 hover:border-[#155EEF]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#F5F7FA]">
                      <Image
                        src={marketHeroImage}
                        alt={product.name}
                        fill
                        sizes="220px"
                        className="object-cover"
                        style={{
                          objectPosition:
                            productImagePositions[
                              index % productImagePositions.length
                            ],
                        }}
                      />
                      <span
                        className={`absolute left-2 top-2 rounded-sm px-2 py-1 text-[12px] leading-4 ${
                          productTagStyles[product.tag] ||
                          "bg-white text-secondary"
                        }`}
                      >
                        {product.tag}
                      </span>
                    </div>
                    <p className="mt-3 truncate label-lg">{product.name}</p>
                    <p className="mt-1 truncate text-sm text-secondary">
                      {product.spec}
                    </p>
                    <p className="mt-2 text-[22px] font-semibold leading-[28px] text-[#EA580C]">
                      {product.price}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      {product.seller} · {product.market}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 z-30 grid w-screen max-w-[100vw] grid-cols-[repeat(4,68px)] justify-center gap-x-4 border-t border-[#E5E7EB] bg-white px-2 py-2 text-center text-[12px] leading-4 text-secondary shadow-[0_-4px_16px_rgba(15,23,42,0.08)] lg:hidden">
        <Link href={`/${locale}`} className="truncate text-secondary">
          首页
        </Link>
        <Link href={`/${locale}/search`} className="truncate text-secondary">
          找货
        </Link>
        <Link href={`/${locale}/categories`} className="truncate font-semibold text-[#155EEF]">
          市场
        </Link>
        <Link href={`/${locale}/user/orders`} className="truncate text-secondary">
          我的
        </Link>
      </nav>
    </main>
  )
}
