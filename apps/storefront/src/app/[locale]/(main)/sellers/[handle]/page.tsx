import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

import { ProductCard } from "@/components/organisms"
import { retrieveChinaSeller } from "@/lib/data/china-sellers"
import { listProducts } from "@/lib/data/products"

const shopHeroImage = "/images/local-market/seafood-market-hero.png"

const productImagePositions = [
  "left 36%",
  "center 42%",
  "right 45%",
  "42% 58%",
]

const shopProfiles = {
  "a-hai-xian-huo-dang": {
    name: "阿海鲜活档",
    market: "三门海鲜市场",
    booth: "A区 18号",
    status: "营业中",
    live: true,
    headline: "今日鲜活梭子蟹、皮皮虾、花蛤现货",
    announcement:
      "今日 06:30 开市，梭子蟹午市补货。鲜活商品价格随到货波动，以商家确认和结算页为准。",
    categories: ["梭子蟹", "皮皮虾", "花蛤", "活明虾"],
    credentials: ["市场认证档口", "营业执照", "档口号已展示", "检测报告"],
    fulfillment: ["市场统一配送", "档口自送", "到店自提"],
    metrics: [
      ["4.9", "档口评分"],
      ["42%", "近 7 日回头客"],
      ["18款", "今日上新"],
      ["06:30", "今日开市"],
    ],
    products: [
      ["鲜活梭子蟹", "公母混装 · 3-5两/只 · 1斤起", "¥68-82/斤", "剩 36 筐", "鲜活", "建议自提"],
      ["皮皮虾", "中大规格 · 约12只/斤 · 1斤起", "¥48-56/斤", "剩 22 筐", "鲜活", "建议自提"],
      ["花蛤净养装", "净养吐沙 · 2斤/袋 · 1袋起", "¥10-13/斤", "剩 28 筐", "鲜活", "今日可送"],
    ],
  },
  "wan-kou-bing-xian-hang": {
    name: "湾口冰鲜行",
    market: "三门海鲜市场",
    booth: "B区 06号",
    status: "接单中",
    live: false,
    headline: "冰鲜黄鱼、带鱼、鲳鱼冷链现货",
    announcement:
      "冷链配送时段 10:00 / 15:00；冰鲜商品以当日分拣和商家确认为准。",
    categories: ["小黄鱼", "带鱼", "鲳鱼", "冷冻虾仁"],
    credentials: ["检测报告", "冷库资质", "食品经营许可", "市场档口"],
    fulfillment: ["市场统一配送", "档口自送", "到店自提"],
    metrics: [
      ["4.8", "档口评分"],
      ["96%", "冷链准时率"],
      ["26款", "冰鲜现货"],
      ["15:00", "下一配送时段"],
    ],
    products: [
      ["东海小黄鱼", "冰鲜统货 · 8-10条/斤 · 2斤起", "¥39.80/斤", "上午新到", "冰鲜", "冷链可送"],
      ["冷冻虾仁", "500g/袋", "¥49.90/袋", "冷库现货", "冷冻", "冷链可送"],
      ["舟山带鱼段", "净切 1kg/盒", "¥72.00/盒", "冷链现货", "冰鲜", "冷链可送"],
    ],
  },
  "hai-wei-gan-huo-pu": {
    name: "海味干货铺",
    market: "舟山沈家门市场",
    booth: "干货区 12号",
    status: "可预订",
    live: false,
    headline: "海产干货、礼盒、企业福利提货套餐",
    announcement:
      "干货支持快递配送和门店自提。提货卡权益需走独立提货入口，不在店铺页抵扣。",
    categories: ["虾皮", "淡菜干", "鱼干", "干货礼袋"],
    credentials: ["食品经营许可", "渠道授权", "批次信息", "售后说明"],
    fulfillment: ["市场统一配送", "档口自送", "门店自提"],
    metrics: [
      ["4.7", "店铺评分"],
      ["15款", "干货现货"],
      ["3类", "礼盒规格"],
      ["48h", "发货时效"],
    ],
    products: [
      ["淡菜干礼袋", "250g/袋", "¥45.00/袋", "现货", "干货", "今日可送"],
      ["虾皮家庭装", "500g/袋", "¥36.00/袋", "现货", "干货", "今日可送"],
      ["海产干货礼盒", "企业福利装", "¥168.00/盒", "可预订", "干货", "礼盒可送"],
    ],
  },
  "lao-lin-ben-di-cai-tan": {
    name: "老林本地菜摊",
    market: "宁波路林水产市场",
    booth: "配菜区 03号",
    status: "营业中",
    live: false,
    headline: "本地时令蔬菜、葱姜蒜和海鲜配菜",
    announcement:
      "本店提供本地时令蔬菜、葱姜蒜和海鲜配菜，适合随海鲜订单一起采购。",
    categories: ["生姜", "葱蒜", "时令蔬菜", "配菜组合"],
    credentials: ["档口认证", "本地采购", "摊位信息", "联系方式"],
    fulfillment: ["市场统一配送", "档口自送", "到店自提"],
    metrics: [
      ["4.6", "档口评分"],
      ["12款", "配菜现货"],
      ["5km", "配送范围"],
      ["07:00", "今日开市"],
    ],
    products: [
      ["海鲜配菜组合", "葱姜蒜辣椒", "¥9.90/份", "现配", "蔬菜", "今日可送"],
      ["本地生姜", "500g/份", "¥6.80/份", "现货", "蔬菜", "今日可送"],
      ["时令青菜", "本地统货 · 2斤/袋 · 1袋起", "¥12.00/份", "上午新到", "蔬菜", "今日可送"],
    ],
  },
} as const

const tagStyles: Record<string, string> = {
  鲜活: "bg-[#E6F7F2] text-[#0F8F6B]",
  冰鲜: "bg-[#EFF6FF] text-[#1D4ED8]",
  冷冻: "bg-[#EFF6FF] text-[#1D4ED8]",
  干货: "bg-[#FEF3C7] text-[#B45309]",
  蔬菜: "bg-[#ECFDF3] text-[#067647]",
}

type StaticShopProfile = (typeof shopProfiles)[keyof typeof shopProfiles]

type ResolvedShopProfile = Omit<
  StaticShopProfile,
  "categories" | "credentials" | "fulfillment"
> & {
  categories: string[]
  credentials: string[]
  fulfillment: string[]
  dataSource: "seller_metadata" | "static_profile"
}

const readMetadataText = (
  metadata: Record<string, unknown> | undefined,
  keys: string[]
) => {
  for (const key of keys) {
    const value = metadata?.[key]

    if (typeof value === "string" && value.trim()) {
      return value
    }
  }

  return undefined
}

const readMetadataList = (
  metadata: Record<string, unknown> | undefined,
  keys: string[]
) => {
  for (const key of keys) {
    const value = metadata?.[key]

    if (Array.isArray(value)) {
      const items = value.filter(
        (item): item is string => typeof item === "string" && !!item.trim()
      )

      if (items.length > 0) {
        return items
      }
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split(/[、,，/]/)
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }

  return undefined
}

const resolveShopProfile = (
  base: StaticShopProfile,
  seller?: {
    name: string
    status: string
    metadata?: Record<string, unknown>
  }
): ResolvedShopProfile => {
  const metadata = seller?.metadata

  if (!seller) {
    return {
      ...base,
      categories: [...base.categories],
      credentials: [...base.credentials],
      fulfillment: [...base.fulfillment],
      dataSource: "static_profile",
    }
  }

  return {
    ...base,
    name: seller.name || base.name,
    market: readMetadataText(metadata, ["market_name", "market"]) ?? base.market,
    booth:
      readMetadataText(metadata, ["booth_no", "booth", "stall_no"]) ??
      base.booth,
    status: seller.status === "open" ? "营业中" : base.status,
    live: metadata?.live_enabled === true || base.live,
    headline: readMetadataText(metadata, ["headline"]) ?? base.headline,
    announcement:
      readMetadataText(metadata, ["announcement"]) ?? base.announcement,
    categories:
      readMetadataList(metadata, ["categories", "category_summary"]) ??
      [...base.categories],
    credentials:
      readMetadataList(metadata, ["credentials", "credential_summary"]) ??
      [...base.credentials],
    fulfillment:
      readMetadataList(metadata, [
        "fulfillment_methods",
        "fulfillment",
        "delivery_summary",
      ]) ?? [...base.fulfillment],
    dataSource: "seller_metadata",
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const shop = shopProfiles[handle as keyof typeof shopProfiles] ?? shopProfiles["a-hai-xian-huo-dang"]

  return {
    title: `${shop.name} | 本地市场档口`,
    description: `${shop.market} ${shop.booth} 的本地生鲜档口主页。`,
  }
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params
  const baseShop =
    shopProfiles[handle as keyof typeof shopProfiles] ??
    shopProfiles["a-hai-xian-huo-dang"]
  const sellerResponse = await retrieveChinaSeller(handle)
  const shop = resolveShopProfile(baseShop, sellerResponse?.seller)
  const sellerProductIds = sellerResponse?.product_ids ?? []
  const {
    response: { products: realProducts, count: realProductCount },
  } = sellerProductIds.length
    ? await listProducts({
        countryCode: locale,
        queryParams: {
          id: sellerProductIds,
          limit: 8,
        },
      })
    : {
        response: {
          products: [],
          count: 0,
        },
      }

  return (
    <main className="w-screen max-w-[100vw] overflow-x-hidden bg-[#F6F8FB] pb-24 text-primary lg:w-full lg:max-w-none lg:pb-0">
      <section className="bg-[#F6F8FB] px-3 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/${locale}/search?q=${encodeURIComponent(shop.categories[0])}`} className="text-[13px] leading-5 text-[#155EEF]">
            返回
          </Link>
          <h1 className="truncate text-[18px] font-semibold leading-6">
            {shop.name}
          </h1>
          <Link
            href={`/${locale}/cart`}
            className="rounded-full bg-white px-3 py-1.5 text-[13px] leading-5 text-[#155EEF]"
          >
            购物车
          </Link>
        </div>

        <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <div className="grid gap-2">
            <div className="min-w-0">
              <p className="truncate text-[20px] font-semibold leading-7">
                {shop.name}
              </p>
              <p className="mt-1 text-[12px] leading-4 text-secondary">
                {shop.market} · {shop.booth}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#E6F7F2] px-2 py-1 text-[11px] leading-4 text-[#0F8F6B]">
                {shop.status}
              </span>
              {shop.live && (
                <span className="rounded-full bg-[#FFF4E5] px-2 py-1 text-[11px] leading-4 text-[#9A4B00]">
                  直播讲货中
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-[#F5F7FA] p-2">
            <p className="text-[12px] font-semibold leading-4 text-primary">
              本店支持
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {shop.fulfillment.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-2 py-0.5 text-[11px] leading-4 text-[#1D4ED8]"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-1 text-[11px] leading-4 text-secondary">
              {shop.dataSource === "seller_metadata"
                ? "配送/自提来自商家只读配置，真实履约仍以结算页和商家确认为准。"
                : "市场统一配送为市场能力，商家可自行选择是否加入。"}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-[#F5F7FA] p-2">
              <p className="text-[18px] font-semibold leading-6 text-[#1D4ED8]">
                {shop.metrics[0][0]}
              </p>
              <p className="text-[11px] leading-4 text-secondary">档口评分</p>
            </div>
            <div className="rounded-lg bg-[#F5F7FA] p-2">
              <p className="text-[18px] font-semibold leading-6 text-[#1D4ED8]">
                {shop.metrics[1][0]}
              </p>
              <p className="text-[11px] leading-4 text-secondary">回头客</p>
            </div>
            <div className="rounded-lg bg-[#F5F7FA] p-2">
              <p className="text-[18px] font-semibold leading-6 text-[#1D4ED8]">
                {shop.metrics[3][0]}
              </p>
              <p className="text-[11px] leading-4 text-secondary">开市</p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] px-3 py-2 text-[12px] leading-5 text-[#92400E] shadow-sm">
          {shop.announcement}
        </div>

        <nav className="sticky top-0 z-20 mt-3 flex gap-2 border-b border-[#E5E7EB] bg-[#F6F8FB] py-2">
          {["今日鲜货", "店铺介绍", "售后说明"].map((tab, index) => (
            <Link
              key={tab}
              href={index === 0 ? "#today-products" : index === 1 ? "#shop-info" : "#after-sale"}
              className={`rounded-full px-3 py-1.5 text-[12px] leading-4 ${
                index === 0 ? "bg-[#155EEF] text-white" : "bg-white text-secondary"
              }`}
            >
              {tab}
            </Link>
          ))}
        </nav>

        <section id="today-products" className="mt-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-semibold leading-5">真实可购商品</p>
            <span className="text-[12px] leading-4 text-secondary">{realProductCount} 条</span>
          </div>
          <p className="mt-1 text-[12px] leading-5 text-secondary">
            来自当前档口 Store API 商品，进入详情页选择规格后加入真实购物车。
          </p>
          {realProducts.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {realProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="min-w-0 rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-4 text-[12px] leading-5 text-secondary">
              当前没有可售真实商品，先展示下方档口样例。
            </div>
          )}
        </section>

        <section className="mt-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-semibold leading-5">档口展示样例</p>
            <span className="text-[12px] leading-4 text-secondary">样例不直接加购</span>
          </div>
          <div className="mt-3 grid gap-3">
            {shop.products.map(([name, spec, price, stock, tag, productHint], index) => (
              <article key={name} className="rounded-lg border border-[#E5E7EB] bg-white p-3">
                <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                  <div className="relative h-[88px] overflow-hidden rounded-lg bg-[#F5F7FA]">
                    <Image
                      src={shopHeroImage}
                      alt={name}
                      fill
                      unoptimized
                      sizes="88px"
                      className="object-cover"
                      style={{
                        objectPosition:
                          productImagePositions[
                            index % productImagePositions.length
                          ],
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <p className="min-w-0 truncate text-[15px] font-semibold leading-5">
                        {name}
                      </p>
                      <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] leading-4 text-[#1D4ED8]">
                        {productHint}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[12px] leading-4 text-secondary">
                      {spec}
                    </p>
                    <p className="mt-2 text-[20px] font-semibold leading-6 text-[#EA580C]">
                      {price}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] leading-4 ${tagStyles[tag] || "bg-[#F8FAFC] text-secondary"}`}>
                        {tag}
                      </span>
                      <span className="rounded-full bg-[#E6F7F2] px-2 py-0.5 text-[11px] leading-4 text-[#0F8F6B]">
                        {index === 0 ? "今日到货" : "可自提"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-[12px] leading-5 text-secondary">
                  <span>库存：{stock}</span>
                  {index === 0 ? (
                    <span className="inline-flex h-8 items-center rounded-full bg-[#F8FAFC] px-3 text-[12px] font-semibold text-secondary">
                      进店后确认规格
                    </span>
                  ) : (
                    <span className="inline-flex h-8 items-center rounded-full bg-[#F8FAFC] px-3 text-[12px] font-semibold text-secondary">
                      展示样例
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="shop-info" className="mt-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <p className="text-[16px] font-semibold leading-5">店铺介绍</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {shop.credentials.slice(0, 3).map((item) => (
              <span key={item} className="rounded-full bg-[#EFF6FF] px-2 py-1 text-[11px] leading-4 text-[#1D4ED8]">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="after-sale" className="mt-3 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
          <p className="text-[16px] font-semibold leading-5">售后说明</p>
          <p className="mt-2 text-[12px] leading-5 text-secondary">
            鲜活、冰鲜和称重商品存在价格与重量浮动；坏损、少件、错发以平台售后规则和商家确认记录为准。
          </p>
        </section>
      </section>

      <section className="hidden border-b border-[#E5E7EB] bg-white lg:block">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href={`/${locale}`} className="label-md text-[#155EEF] hover:underline">
              返回本地鲜货首页
            </Link>
            <h1 className="mt-2 text-[32px] font-semibold leading-[40px] tracking-normal text-primary md:text-[42px] md:leading-[50px]">
              {shop.name}
            </h1>
            <p className="mt-1 text-md text-secondary">
              {shop.market} · {shop.booth} · {shop.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-sm bg-[#E6F7F2] px-3 py-2 label-md text-[#0F8F6B]">
              {shop.status}
            </span>
            {shop.live && (
              <span className="rounded-sm bg-[#FFF4E5] px-3 py-2 label-md text-[#9A4B00]">
                直播讲货中
              </span>
            )}
            <span className="rounded-sm bg-[#EFF6FF] px-3 py-2 label-md text-[#1D4ED8]">
              市场认证
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto hidden w-full max-w-[1480px] gap-4 px-4 py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
          <div className="grid min-h-[360px] lg:grid-cols-[minmax(0,1fr)_42%]">
            <div className="flex flex-col justify-between gap-6 p-5 md:p-6">
              <div>
                <p className="label-md text-[#155EEF]">档口主页</p>
                <h2 className="mt-2 max-w-[720px] text-[28px] font-semibold leading-[36px] tracking-normal md:text-[34px] md:leading-[42px]">
                  {shop.headline}
                </h2>
                <p className="mt-3 max-w-[760px] text-md text-secondary">
                  {shop.announcement}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {shop.metrics.map(([value, label]) => (
                  <div key={label} className="rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                    <p className="text-[24px] font-semibold leading-[30px] text-[#1D4ED8]">
                      {value}
                    </p>
                    <p className="mt-1 text-sm text-secondary">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[260px] border-t border-[#E5E7EB] lg:border-l lg:border-t-0">
              <Image
                src={shopHeroImage}
                alt={`${shop.name} 档口形象`}
                fill
                priority
                quality={80}
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 rounded-sm bg-white/92 p-3 backdrop-blur">
                <p className="label-lg">{shop.market}</p>
                <p className="mt-1 text-sm text-secondary">
                  {shop.dataSource === "seller_metadata"
                    ? "档口信息和履约方式来自商家只读配置。"
                    : "档口信息、营业时间和履约方式可由后台维护。"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="label-lg">主营类目</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {shop.categories.map((category) => (
                <span key={category} className="rounded-sm bg-[#EFF6FF] px-3 py-2 text-sm text-[#1D4ED8]">
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="label-lg">资质 / 可信信息</p>
            <div className="mt-3 grid gap-2">
              {shop.credentials.map((item) => (
                <p key={item} className="rounded-sm bg-[#F8FAFC] px-3 py-2 text-sm text-secondary">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto hidden w-full max-w-[1480px] gap-4 px-4 pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-md text-[#155EEF]">真实商品</p>
              <h2 className="heading-md">可进入详情加购</h2>
            </div>
            <p className="text-sm text-secondary">当前档口 Store API 返回 {realProductCount} 条，本阶段不接订单外逻辑</p>
          </div>
          {realProducts.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
              {realProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="min-w-0 lg:w-full"
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-sm bg-[#F8FAFC] px-4 py-8 text-sm text-secondary">
              当前没有可售真实商品，先展示下方档口样例。
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-md text-[#64748B]">档口展示样例</p>
              <h2 className="heading-md">后续接入商家商品列表</h2>
            </div>
            <p className="text-sm text-secondary">样例不直接加购，价格库存以商家确认为准</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {shop.products.map(([name, spec, price, stock, tag, productHint], index) => (
              <article key={name} className="rounded-sm border border-[#E5E7EB] bg-white p-4">
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-sm bg-[#F5F7FA]">
                  <Image
                    src={shopHeroImage}
                    alt={name}
                    fill
                    sizes="260px"
                    className="object-cover"
                    style={{
                      objectPosition:
                        productImagePositions[
                          index % productImagePositions.length
                        ],
                    }}
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="label-lg">{name}</p>
                    <p className="mt-1 text-sm text-secondary">{spec}</p>
                  </div>
                  <span className={`shrink-0 rounded-sm px-2 py-1 text-[12px] leading-4 ${tagStyles[tag] || "bg-[#F8FAFC] text-secondary"}`}>
                    {tag}
                  </span>
                </div>
                <p className="mt-3 text-[24px] font-semibold leading-[30px] text-[#EA580C]">
                  {price}
                </p>
                <p className="mt-2 text-sm text-secondary">到货：{stock}</p>
                <p className="mt-1 text-sm text-secondary">
                  商品提示：{productHint}
                </p>
                <button
                  disabled
                  className="mt-3 h-10 w-full rounded-sm bg-[#155EEF] label-md text-white"
                >
                  进店选规格
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="label-lg">配送 / 自提规则</p>
            <div className="mt-3 grid gap-2">
              {shop.fulfillment.map((item) => (
                <p key={item} className="rounded-sm bg-[#F8FAFC] px-3 py-2 text-sm text-secondary">
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-3 text-sm text-secondary">
              {shop.dataSource === "seller_metadata"
                ? "当前展示来自商家 metadata，只读展示不改变配送服务或运费。"
                : "当前为静态回退展示，后续应由商家配置读取。"}
            </p>
          </div>
          <div className="rounded-sm border border-[#F59E0B] bg-[#FFFBEB] p-4 shadow-sm">
            <p className="label-lg text-[#92400E]">安全边界</p>
            <p className="mt-2 text-sm text-[#92400E]">
              本页展示店铺主页结构，客服、直播、物流、库存、支付和订单状态后续需要通过独立服务和后台配置接入。
            </p>
          </div>
        </aside>
      </section>

      <div className="fixed bottom-10 left-0 z-30 w-screen max-w-[100vw] px-3 lg:hidden">
        <div className="flex items-center justify-between rounded-full bg-[#111827] px-4 py-2 text-white shadow-lg">
          <div>
            <p className="text-[13px] font-semibold leading-5">档口展示样例</p>
            <p className="text-[12px] leading-4 text-white/75">真实加购后再结算</p>
          </div>
          <Link
            href={`/${locale}/cart`}
            className="rounded-full bg-[#155EEF] px-5 py-2 text-[14px] font-semibold leading-5"
          >
            查看购物车
          </Link>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 z-30 grid w-screen max-w-[100vw] grid-cols-[repeat(5,60px)] justify-center gap-x-3 border-t border-[#E5E7EB] bg-white px-2 py-2 text-center text-[12px] leading-4 text-secondary shadow-[0_-4px_16px_rgba(15,23,42,0.08)] lg:hidden">
        <Link href={`/${locale}`} className="truncate text-secondary">
          首页
        </Link>
        <Link href={`/${locale}/search`} className="truncate text-secondary">
          找货
        </Link>
        <Link href={`/${locale}/categories`} className="truncate font-semibold text-[#155EEF]">
          档口
        </Link>
        <Link href={`/${locale}/cart`} className="truncate text-secondary">
          购物车
        </Link>
        <Link href={`/${locale}/user/orders`} className="truncate text-secondary">
          我的
        </Link>
      </nav>
    </main>
  )
}
