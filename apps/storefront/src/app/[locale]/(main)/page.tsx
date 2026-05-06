import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"

import { listRegions } from "@/lib/data/regions"
import { retrieveChinaMarkets } from "@/lib/data/china-markets"
import { toHreflang } from "@/lib/helpers/hreflang"
import {
  freshProducts,
  guarantees,
  marketCategories,
  marketHeroImage,
  marketSwitches,
  portalStats,
  priceBoard,
  productTagStyles,
  stalls,
} from "./data/home-market"

const mobileHomeEntries = [
  { title: "鲜活水产", text: "鱼虾蟹贝" },
  { title: "冰鲜冻品", text: "黄鱼带鱼" },
  { title: "海产干货", text: "虾皮鱼干" },
  { title: "水果蔬菜", text: "时令配菜" },
  { title: "附近档口", text: "按店找货" },
  { title: "今日行情", text: "参考价格" },
]

const productImagePositions = [
  "left 36%",
  "center 42%",
  "right 45%",
  "42% 58%",
  "62% 36%",
  "32% 64%",
]

const readMarketMetadataString = (
  metadata: Record<string, unknown> | undefined,
  key: string
) => {
  const value = metadata?.[key]

  return typeof value === "string" && value.trim() ? value : undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || [])
          .map((r) => r.countries?.map((c) => c.iso_2) || [])
          .flat()
          .filter(Boolean)
      )
    ) as string[]

    languages = locales.reduce<Record<string, string>>((acc, code) => {
      acc[toHreflang(code)] = `${baseUrl}/${code}`
      return acc
    }, {})
  } catch {
    languages = { [toHreflang(locale)]: `${baseUrl}/${locale}` }
  }

  const title = "本地鲜货市场"
  const description =
    "按市场切换，查看本地海鲜生鲜档口、今日鲜货和本地履约服务。"
  const canonical = `${baseUrl}/${locale}`

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || "Fuyi"}`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Fuyi",
      type: "website",
      images: [
        {
          url: `${baseUrl}${marketHeroImage}`,
          width: 1200,
          height: 630,
          alt: "本地海鲜生鲜市场首页",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}${marketHeroImage}`],
    },
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Fuyi"
  const chinaMarkets = await retrieveChinaMarkets()
  const activeMarket = chinaMarkets.items[0]
  const activeMarketName = activeMarket?.name ?? marketSwitches[0].name
  const activeMarketCity = activeMarket
    ? [activeMarket.city, activeMarket.district].filter(Boolean).join(" / ")
    : "台州城区"
  const activeMarketHours =
    readMarketMetadataString(activeMarket?.metadata, "hours") ??
    marketSwitches[0].open
  const activeMarketNotice =
    readMarketMetadataString(activeMarket?.metadata, "notice") ??
    "鲜活区、冰鲜区、干货区同步更新，示例市场后续可由配置切换。"
  const homeMarketSwitches =
    chinaMarkets.items.length > 0
      ? chinaMarkets.items.slice(0, 3).map((market) => ({
          name: market.name,
          area:
            [market.city, market.district].filter(Boolean).join(" / ") ||
            "本地市场",
          open:
            readMarketMetadataString(market.metadata, "hours") ??
            "营业时间待配置",
          delivery: "进店查看履约方式",
          fresh: `${stalls.filter((stall) => stall.market === market.name).length || "多"}家档口`,
        }))
      : marketSwitches

  return (
    <main className="row-start-2 w-screen max-w-[100vw] overflow-x-hidden bg-[#F6F8FB] pb-16 text-primary lg:w-full lg:max-w-none lg:pb-0">
      <link
        rel="preload"
        as="image"
        href={marketHeroImage}
        imageSrcSet={`${marketHeroImage} 1200w`}
        imageSizes="(min-width: 1024px) 44vw, 100vw"
      />
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            logo: `${baseUrl}/favicon.ico`,
          }),
        }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            inLanguage: toHreflang(locale),
          }),
        }}
      />

      <section className="box-border w-screen max-w-[100vw] overflow-hidden bg-[#F6F8FB] px-3 pb-24 pt-3 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold leading-6 text-primary">
              {activeMarketName}
            </p>
            <p className="mt-0.5 text-[12px] leading-4 text-secondary">
              开市 {activeMarketHours} · {activeMarketCity}
            </p>
          </div>
          <Link
            href={`/${locale}/categories`}
            className="shrink-0 rounded-full border border-[#DDE4F0] bg-white px-3 py-1.5 text-[12px] leading-4 text-[#155EEF]"
          >
            切换市场
          </Link>
        </div>

        <form action={`/${locale}/search`} className="mt-3">
          <label className="sr-only" htmlFor="mobile-portal-search">
            搜海鲜、档口
          </label>
          <input
            id="mobile-portal-search"
            name="q"
            type="search"
            placeholder="搜海鲜、档口"
            className="h-11 w-full rounded-full border border-[#E5E7EB] bg-white px-4 text-[14px] leading-5 shadow-sm outline-none focus:border-[#155EEF]"
          />
        </form>

        <div className="mt-3 overflow-hidden rounded-lg bg-[#155EEF] text-white shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_112px]">
            <div className="p-4">
              <p className="text-[22px] font-semibold leading-7 tracking-normal">
                今日鲜货到市
              </p>
              <p className="mt-1 text-[13px] leading-5 text-white/85">
                按市场找档口，看今日上新
              </p>
              <div className="mt-3 flex gap-2 text-[11px] leading-4 text-white">
                <span className="rounded-full bg-white/18 px-2 py-1">
                  今日到货 128款
                </span>
                <span className="rounded-full bg-white/18 px-2 py-1">
                  34家认证档口
                </span>
              </div>
            </div>
            <div className="relative min-h-[126px] overflow-hidden">
              <Image
                src={marketHeroImage}
                alt="本地海鲜市场今日鲜货"
                width={112}
                height={126}
                unoptimized
                className="h-full min-h-[126px] w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            {mobileHomeEntries.map((entry) => (
              <Link
                key={entry.title}
                href={
                  entry.title === "今日行情"
                    ? `/${locale}/search`
                    : entry.title === "附近档口"
                      ? `/${locale}/categories`
                      : `/${locale}/search`
                }
                className="flex min-h-[56px] min-w-0 flex-col items-center justify-center rounded-lg bg-[#F5F7FA] px-2 text-center"
              >
                <span className="w-full truncate text-[13px] font-semibold leading-5 text-primary">
                  {entry.title}
                </span>
                <span className="mt-0.5 w-full truncate text-[11px] leading-4 text-secondary">
                  {entry.text}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold leading-5">今日行情</p>
              <Link
                href={`/${locale}/search`}
                className="text-[12px] leading-4 text-[#155EEF]"
              >
                全部
              </Link>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {priceBoard.slice(0, 4).map(([name, price, tag]) => (
                <Link
                  key={name}
                  href={`/${locale}/search?q=${encodeURIComponent(name)}`}
                  className="rounded-lg bg-[#F5F7FA] p-2"
                >
                  <p className="truncate text-[13px] font-semibold leading-4">
                    {name}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold leading-4 text-[#EA580C]">
                    {price}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-secondary">
                    {tag}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold leading-5">附近档口</p>
              <Link
                href={`/${locale}/categories`}
                className="text-[12px] leading-4 text-[#155EEF]"
              >
                更多
              </Link>
            </div>
            <div className="mt-2 grid gap-2">
              {stalls.slice(0, 3).map((stall) => (
                <Link
                  key={stall.name}
                  href={`/${locale}/sellers/${stall.handle}`}
                  className="rounded-lg bg-[#F5F7FA] p-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold leading-5">
                        {stall.name}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] leading-4 text-secondary">
                        {stall.market} · {stall.booth}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-sm bg-[#E6F7F2] px-2 py-1 text-[11px] leading-4 text-[#0F8F6B]">
                      {stall.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[12px] leading-4 text-secondary">
                    {stall.categories}
                  </p>
                  <p className="mt-1 truncate text-[11px] leading-4 text-[#155EEF]">
                    履约：进店选择
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto box-border hidden w-full max-w-[1680px] gap-4 px-4 py-5 lg:grid lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:px-8 2xl:px-10">
        <aside className="hidden space-y-3 lg:block">
          <div className="rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
            <nav className="divide-y divide-[#E5E7EB]" aria-label="市场类目">
              {marketCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/${locale}/categories`}
                  className="block px-4 py-3 transition-colors hover:bg-[#F5F7FA]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="label-lg">{category.name}</p>
                    <span className="rounded-sm bg-[#F5F7FA] px-2 py-1 text-[12px] leading-4 text-secondary">
                      {category.count}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-secondary">{category.desc}</p>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <section className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
          <div className="grid min-h-[500px] lg:grid-cols-[minmax(0,1fr)_42%]">
            <div className="flex flex-col justify-between gap-6 p-6 xl:p-8">
              <div>
                <p className="label-md text-[#155EEF]">{activeMarketName}</p>
                <h1 className="mt-2 max-w-[820px] text-[26px] font-semibold leading-[34px] tracking-normal md:text-[44px] md:leading-[52px]">
                  今日鲜货开市
                </h1>
                <p className="mt-4 max-w-[760px] text-md text-secondary">
                  先选市场和档口，再看今日上新、规格、库存和参考价。自提或配送在商家页和结算页确认。
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/search`}
                    className="inline-flex h-11 items-center justify-center rounded-sm bg-[#155EEF] px-5 label-md text-white hover:bg-[#1D4ED8]"
                  >
                    看今日鲜货
                  </Link>
                  <Link
                    href={`/${locale}/categories`}
                    className="inline-flex h-11 items-center justify-center rounded-sm border border-[#155EEF] px-5 label-md text-[#155EEF] hover:bg-[#EFF6FF]"
                  >
                    逛附近档口
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {portalStats.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-sm border border-[#E5E7EB] bg-[#F5F7FA] p-3"
                  >
                    <p className="text-[26px] font-semibold leading-[32px] text-[#1D4ED8]">
                      {value}
                    </p>
                    <p className="mt-1 text-sm text-secondary">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 rounded-sm border border-[#E5E7EB] bg-[#F5F7FA] p-4 text-sm text-secondary md:grid-cols-3">
                <div>
                  <p className="label-md text-primary">开市时间</p>
                  <p className="mt-1">{activeMarketHours}</p>
                </div>
                <div>
                  <p className="label-md text-primary">主要品类</p>
                  <p className="mt-1">鲜活水产、冰鲜冻品、海产干货</p>
                </div>
                <div>
                  <p className="label-md text-primary">履约说明</p>
                  <p className="mt-1">进店后选择自提或配送</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[260px] border-t border-[#E5E7EB] lg:border-l lg:border-t-0">
              <Image
                src={marketHeroImage}
                alt="本地海鲜市场档口和今日鲜货"
                fill
                priority
                quality={80}
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 rounded-sm bg-white/92 p-3 backdrop-blur">
                <p className="label-lg">{activeMarketName}今日开市</p>
                <p className="mt-1 text-sm text-secondary">
                  {activeMarketNotice}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="rounded-lg border border-[#FECACA] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
                <div className="h-8 w-8 rounded-full bg-[#CBD5E1]" />
              </div>
              <div className="min-w-0">
                <p className="heading-sm">欢迎来到 FUYI</p>
                <p className="mt-1 text-sm text-secondary">
                  登录后保存常买档口
                </p>
              </div>
            </div>

            <div className="my-4 h-px bg-[#FEE2E2]" />

            <div className="text-center">
              <p className="heading-sm">按市场找鲜货</p>
              <p className="mt-1 text-sm text-secondary">
                档口报价、今日上新、售后规则更清楚
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              <Link
                href={`/${locale}/login`}
                className="flex h-11 items-center justify-center rounded-lg bg-[#EF1F2D] label-md text-white hover:bg-[#DC1724]"
              >
                立即登录
              </Link>
              <Link
                href={`/${locale}/search`}
                className="flex h-11 items-center justify-center rounded-lg bg-[#FEECEC] label-md text-[#EF1F2D] hover:bg-[#FEE2E2]"
              >
                发布找货需求
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_76px] items-end gap-3">
              <div>
                <p className="heading-sm">商家入驻有福利</p>
                <p className="mt-1 text-sm text-secondary">档口、批发商、供应商</p>
                <Link
                  href={`/${locale}/categories`}
                  className="mt-3 inline-flex h-8 items-center justify-center rounded-sm bg-[#EF4444] px-3 label-sm text-white hover:bg-[#DC2626]"
                >
                  立即入驻
                </Link>
              </div>
              <div className="relative h-16 rounded-lg bg-[#FEE2E2]">
                <div className="absolute left-3 top-4 h-8 w-10 rounded-sm bg-[#EF4444]" />
                <div className="absolute left-5 top-1 h-6 w-8 rotate-[-8deg] rounded-sm bg-[#FCA5A5]" />
                <div className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            {homeMarketSwitches.slice(0, 1).map((market) => (
              <div
                key={market.name}
                className="mt-5 rounded-sm bg-[#F8FAFC] p-3 text-sm text-secondary"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{market.name}</span>
                  <span className="shrink-0 text-[#0F8F6B]">开市中</span>
                </div>
                <p className="mt-1 truncate">
                  {market.open} · 今日上新 {market.fresh}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto hidden w-full max-w-[1680px] gap-4 px-4 pb-5 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:px-8 2xl:px-10">
        <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex justify-end">
            <Link
              href={`/${locale}/categories`}
              className="label-md text-[#155EEF] hover:underline"
            >
              查看全部档口
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {stalls.map((stall) => {
              const stallProducts = freshProducts.filter(
                (product) => product.seller === stall.name
              )
              const showcaseProducts = (
                stallProducts.length > 0 ? stallProducts : freshProducts
              ).slice(0, 3)

              return (
                <Link
                  key={stall.name}
                  href={`/${locale}/sellers/${stall.handle}`}
                  className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm hover:border-[#155EEF]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[#16A34A] text-[28px] font-semibold leading-none text-white">
                        {stall.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate heading-sm">{stall.name}</p>
                        <p className="mt-1 truncate text-sm text-secondary">
                          {stall.market} · {stall.booth}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-sm border border-[#F97316] px-3 py-1.5 text-[13px] leading-4 text-[#EA580C]">
                      进店
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {showcaseProducts.map((product, productIndex) => (
                      <div key={`${stall.name}-${product.name}`} className="min-w-0">
                        <div className="relative aspect-square overflow-hidden rounded-sm bg-[#F5F7FA]">
                          <Image
                            src={marketHeroImage}
                            alt={`${product.name} 示例图`}
                            fill
                            sizes="120px"
                            className="object-cover"
                            style={{
                              objectPosition:
                                productImagePositions[productIndex],
                            }}
                          />
                          <span className="absolute left-1 top-1 rounded-sm bg-white/90 px-1.5 py-0.5 text-[10px] leading-3 text-[#EA580C]">
                            {product.tag}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 min-h-[36px] text-[13px] leading-[18px] text-primary">
                          {product.name} {product.spec}
                        </p>
                        <p className="mt-1 text-[16px] font-semibold leading-5 text-[#E11D48]">
                          {product.price.replace(".00", "")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3 text-[12px] leading-4 text-secondary">
                    <span className="truncate">
                      {stall.status} · {stall.categories}
                    </span>
                    {stall.live && (
                      <span className="shrink-0 rounded-sm bg-[#FFF4E5] px-2 py-1 text-[#9A4B00]">
                        直播讲货中
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {freshProducts.map((product, productIndex) => (
              <article
                key={product.name}
                className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-sm border border-[#E5E7EB] p-3"
              >
                <div className="relative h-24 overflow-hidden rounded-sm bg-[#F5F7FA]">
                  <Image
                    src={marketHeroImage}
                    alt={`${product.name} 示例图`}
                    fill
                    sizes="96px"
                    className="object-cover"
                    style={{
                      objectPosition:
                        productImagePositions[
                          productIndex % productImagePositions.length
                        ],
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate label-lg">{product.name}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-secondary">
                        {product.spec}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-sm px-2 py-1 text-[12px] leading-4 ${
                        productTagStyles[product.tag] ||
                        "bg-[#F5F7FA] text-secondary"
                      }`}
                    >
                      {product.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-[23px] font-semibold leading-[30px] text-[#EA580C]">
                    {product.price}
                  </p>
                  <div className="mt-2 grid gap-1 text-sm text-secondary">
                    <p className="truncate">档口：{product.seller}</p>
                    <p className="truncate">到货：{product.stock}</p>
                    <p className="truncate">履约：进店选择</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto hidden w-full max-w-[1680px] px-4 pb-8 lg:block lg:px-8 2xl:px-10">
        <div
          id="progress"
          className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-md text-[#155EEF]">市场履约保障</p>
              <h2 className="mt-2 heading-md">自提、配送、冷链</h2>
            </div>
            <Link
              href={`/${locale}/pickup-card`}
              className="text-sm text-[#1D4ED8] hover:underline"
            >
              提货卡单独入口
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {guarantees.map(([title, text]) => (
              <div
                key={title}
                className="rounded-sm border border-[#E5E7EB] bg-[#F5F7FA] p-3"
              >
                <p className="label-lg">{title}</p>
                <p className="mt-1 text-sm text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-auto z-30 grid w-screen max-w-[100vw] grid-cols-[repeat(4,72px)] justify-center gap-x-5 border-t border-[#E5E7EB] bg-white px-2 py-2 text-center text-[12px] leading-4 text-secondary shadow-[0_-4px_16px_rgba(15,23,42,0.08)] lg:hidden">
        <Link href={`/${locale}`} className="min-w-0 truncate font-semibold text-[#155EEF]">
          首页
        </Link>
        <Link href={`/${locale}/search`} className="min-w-0 truncate text-secondary">
          找货
        </Link>
        <Link href={`/${locale}/categories`} className="min-w-0 truncate text-secondary">
          档口
        </Link>
        <Link href={`/${locale}/user/orders`} className="min-w-0 truncate text-secondary">
          我的
        </Link>
      </nav>
    </main>
  )
}
