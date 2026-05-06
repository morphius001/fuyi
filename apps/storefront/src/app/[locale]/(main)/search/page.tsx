import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

import { ProductCard } from "@/components/organisms"
import { retrieveChinaDiscovery } from "@/lib/data/china-discovery"
import { listProducts } from "@/lib/data/products"

export const metadata: Metadata = {
  title: "搜索本地鲜货",
  description: "按商品、店铺/档口、市场和类目查找本地鲜货与经营商户。",
}

const productImagePositions = [
  "left 36%",
  "center 42%",
  "right 45%",
  "42% 58%",
]

const productResults = [
  {
    name: "鲜活梭子蟹",
    productHandle: "xian-huo-suo-zi-xie",
    spec: "公母混装 · 3-5两/只 · 1斤起",
    price: "¥68-82/斤",
    stock: "剩 36 筐",
    shop: "阿海鲜活档",
    handle: "a-hai-xian-huo-dang",
    market: "三门海鲜市场",
    booth: "A区18号",
    badges: ["今日到货", "鲜活"],
    productHint: "建议自提",
    stallFulfillment: ["到店自提", "档口自送", "市场统一配送"],
    image: "/images/local-market/seafood-market-hero.png",
  },
  {
    name: "精品母蟹礼盒",
    productHandle: "xian-huo-suo-zi-xie",
    spec: "母蟹礼盒 · 4只/盒 · 约2斤",
    price: "¥168/盒",
    stock: "剩 18 盒",
    shop: "湾口冰鲜行",
    handle: "wan-kou-bing-xian-hang",
    market: "三门海鲜市场",
    booth: "B区06号",
    badges: ["礼盒"],
    productHint: "今日可送",
    stallFulfillment: ["市场统一配送", "到店自提"],
    image: "/images/local-market/seafood-market-hero.png",
  },
  {
    name: "东海小黄鱼",
    productHandle: "dong-hai-xiao-huang-yu",
    spec: "冰鲜统货 · 8-10条/斤 · 2斤起",
    price: "¥36-42/斤",
    stock: "上午新到",
    shop: "海味干货铺",
    handle: "hai-wei-gan-huo-pu",
    market: "舟山沈家门市场",
    booth: "干货区12号",
    badges: ["冰鲜"],
    productHint: "冷链可送",
    stallFulfillment: ["市场统一配送", "快递配送"],
    image: "/images/local-market/seafood-market-hero.png",
  },
  {
    name: "花蛤净养装",
    productHandle: "hua-ge-jing-yang-zhuang",
    spec: "净养吐沙 · 2斤/袋 · 1袋起",
    price: "¥10-13/斤",
    stock: "现货",
    shop: "老林本地菜摊",
    handle: "lao-lin-ben-di-cai-tan",
    market: "宁波路林水产市场",
    booth: "配菜区03号",
    badges: ["净养", "今日价"],
    productHint: "建议自提",
    stallFulfillment: ["到店自提", "档口自送"],
    image: "/images/local-market/seafood-market-hero.png",
  },
]

const fallbackShopResults = [
  {
    name: "阿海鲜活档",
    handle: "a-hai-xian-huo-dang",
    market: "三门海鲜市场",
    booth: "A区 18号",
    tags: ["市场认证", "直播讲货中", "鲜活水产"],
    summary: "梭子蟹、皮皮虾、花蛤，市场自提 / 5公里配送。",
  },
  {
    name: "湾口冰鲜行",
    handle: "wan-kou-bing-xian-hang",
    market: "三门海鲜市场",
    booth: "B区 06号",
    tags: ["检测报告", "冷链配送", "冰鲜冻品"],
    summary: "带鱼、鲳鱼、黄鱼，支持冷链配送 / 次日达。",
  },
  {
    name: "海味干货铺",
    handle: "hai-wei-gan-huo-pu",
    market: "舟山沈家门市场",
    booth: "干货区 12号",
    tags: ["食品经营许可", "快递配送", "礼盒"],
    summary: "虾皮、淡菜干、鱼干，适合企业福利和提货卡权益。",
  },
]

const fallbackMarketResults = [
  {
    name: "三门海鲜市场",
    city: "台州三门",
    hours: "06:30 - 17:30",
    notice: "鲜活区今日到货，冷链配送 10:00 / 15:00。",
    delivery: "市场自提 / 同城配送 / 冷链",
  },
  {
    name: "舟山沈家门市场",
    city: "舟山普陀",
    hours: "07:00 - 18:00",
    notice: "冰鲜海货和干货礼盒供应。",
    delivery: "门店自提 / 快递配送",
  },
]

const fallbackCategoryResults = [
  { handle: "seafood-live", name: "鲜活水产", description: "鱼虾蟹贝", count: "48款" },
  { handle: "frozen", name: "冰鲜冻品", description: "带鱼黄鱼冻虾", count: "36款" },
  { handle: "dried-seafood", name: "海产干货", description: "虾皮淡菜鱼干", count: "22款" },
  { handle: "fruit-vegetable", name: "水果蔬菜", description: "本地时令配菜", count: "18款" },
]

const filters = ["今日到货", "鲜活", "价格优先", "附近档口"]

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ q?: string }>
}) {
  const { locale } = await params
  const rawQuery = (await searchParams)?.q?.trim()
  const query = rawQuery || "今日鲜货"
  const discovery = await retrieveChinaDiscovery()
  const {
    response: { products: realProducts, count: realProductCount },
  } = await listProducts({
    countryCode: locale,
    queryParams: {
      ...(rawQuery ? { q: rawQuery } : {}),
      limit: 8,
    },
  })
  const shopResults =
    discovery.sellers.length > 0 ? discovery.sellers : fallbackShopResults
  const marketResults =
    discovery.markets.length > 0 ? discovery.markets : fallbackMarketResults
  const categoryResults =
    discovery.categories.length > 0
      ? discovery.categories
      : fallbackCategoryResults

  return (
    <main className="w-screen max-w-[100vw] overflow-x-hidden bg-[#F6F8FB] px-3 pb-24 pt-3 text-primary lg:w-full lg:max-w-none lg:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-[1480px]">
        <section className="hidden rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm lg:block">
          <Link href={`/${locale}`} className="label-md text-[#155EEF] hover:underline">
            返回本地鲜货首页
          </Link>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="label-md text-[#155EEF]">搜索结果</p>
              <h1 className="mt-2 text-[30px] font-semibold leading-[38px] tracking-normal">
                “{query}”相关鲜货
              </h1>
              <p className="mt-2 text-md text-secondary">
                真实商品可进入详情加购；店铺/档口和类目读取只读发现 API，市场先作为配置契约展示。
              </p>
            </div>
            <form action={`/${locale}/search`} className="grid gap-2 sm:grid-cols-[minmax(260px,1fr)_auto]">
              <label className="sr-only" htmlFor="search-page-input">
                搜索关键词
              </label>
              <input
                id="search-page-input"
                name="q"
                type="search"
                defaultValue={query}
                className="h-12 rounded-sm border-2 border-[#155EEF] bg-white px-3 text-md outline-none"
              />
              <button
                type="submit"
                className="h-12 rounded-sm bg-[#155EEF] px-6 label-md text-white hover:bg-[#1D4ED8]"
              >
                重新搜索
              </button>
            </form>
          </div>
        </section>

        <section className="lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/${locale}`} className="text-[13px] leading-5 text-[#155EEF]">
              返回
            </Link>
            <h1 className="text-[18px] font-semibold leading-6">搜索鲜货</h1>
            <Link
              href={`/${locale}/cart`}
              className="rounded-full bg-white px-3 py-1.5 text-[13px] leading-5 text-[#155EEF]"
            >
              购物车
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[13px] leading-5 shadow-sm">
            <span className="font-semibold">三门海鲜市场 · 台州城区</span>
            <Link href={`/${locale}/categories`} className="text-[#155EEF]">
              切换
            </Link>
          </div>

          <form action={`/${locale}/search`} className="mt-3">
            <label className="sr-only" htmlFor="mobile-search-page-input">
              搜索关键词
            </label>
            <input
              id="mobile-search-page-input"
              name="q"
              type="search"
              defaultValue={query}
              className="h-11 w-full rounded-full border border-[#E5E7EB] bg-white px-4 text-[14px] leading-5 shadow-sm outline-none focus:border-[#155EEF]"
            />
          </form>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter, index) => (
              <Link
                key={filter}
                href={`/${locale}/search?q=${encodeURIComponent(query)}`}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] leading-4 ${
                  index === 0
                    ? "bg-[#155EEF] text-white"
                    : "bg-white text-secondary"
                }`}
              >
                {filter}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-3 grid gap-4 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {realProducts.length > 0 ? (
              <div className="rounded-lg border border-[#BFDBFE] bg-white p-3 shadow-sm lg:rounded-sm lg:p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="label-md text-[#155EEF]">真实商品结果</p>
                    <h2 className="heading-md">可加购商品</h2>
                  </div>
                  <p className="text-sm text-secondary">{realProductCount} 条</p>
                </div>
                <p className="mt-2 text-sm text-secondary">
                  以下商品来自 Store API，可进入详情页选择规格后加入真实购物车。
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {realProducts.map((product) => (
                    <ProductCard key={product.id} product={product} className="min-w-0 lg:w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-[#F59E0B] bg-[#FFFBEB] p-3 shadow-sm lg:rounded-sm lg:p-4">
                <p className="label-md text-[#92400E]">暂无真实商品结果</p>
                <p className="mt-1 text-sm text-[#92400E]">
                  当前展示下方市场样例；真实商品需要通过后台商品和商家数据接入后显示。
                </p>
              </div>
            )}

            <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm lg:rounded-sm lg:p-4">
              <div className="hidden items-end justify-between gap-3 lg:flex">
                <div>
                  <p className="label-md text-[#155EEF]">市场样例</p>
                  <h2 className="heading-md">相关鲜货展示</h2>
                </div>
                <p className="text-sm text-secondary">{productResults.length} 条</p>
              </div>
              <div className="flex items-center justify-between lg:hidden">
                <p className="text-[16px] font-semibold leading-5">市场样例鲜货</p>
                <span className="text-[12px] leading-4 text-secondary">
                  {productResults.length} 条
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2 lg:mt-4">
                {productResults.map((product, productIndex) => (
                  <article
                    key={product.name}
                    className="rounded-lg border border-[#E5E7EB] bg-white p-3 lg:rounded-sm lg:p-4"
                  >
                    <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
                      <div className="relative h-[88px] overflow-hidden rounded-lg bg-[#F5F7FA]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="88px"
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
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <p className="min-w-0 truncate text-[15px] font-semibold leading-5 lg:text-[16px]">
                                {product.name}
                              </p>
                              <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[11px] leading-4 text-[#1D4ED8]">
                                {product.productHint}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-[12px] leading-4 text-secondary">
                              {product.spec}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[20px] font-semibold leading-6 text-[#EA580C] lg:text-[24px] lg:leading-[30px]">
                          {product.price}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {product.badges.map((badge) => (
                            <span
                              key={badge}
                              className="rounded-full bg-[#E6F7F2] px-2 py-0.5 text-[11px] leading-4 text-[#0F8F6B]"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-[#F8FAFC] p-2 text-[12px] leading-5 text-secondary">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate">
                          {product.shop} · {product.booth}
                        </p>
                        <span className="shrink-0 text-[#155EEF]">{product.stock}</span>
                      </div>
                      <p className="mt-0.5 truncate">{product.market}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.stallFulfillment.map((item) => (
                          <span
                            key={`${product.name}-${item}`}
                            className="rounded-full bg-white px-2 py-0.5 text-[11px] leading-4 text-[#1D4ED8] ring-1 ring-[#BFDBFE]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-[1fr_1fr] gap-2">
                      <Link
                        href={`/${locale}/sellers/${product.handle}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[#155EEF] px-3 text-[13px] font-semibold leading-4 text-[#155EEF] hover:bg-[#EFF6FF]"
                      >
                        进店
                      </Link>
                      <span
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-[#F8FAFC] px-3 text-[13px] font-semibold leading-4 text-secondary"
                        title="静态市场样例，不进入真实商品详情"
                      >
                        样例展示
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="hidden rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm lg:block">
              <p className="label-md text-[#155EEF]">店铺 / 档口</p>
              <h2 className="heading-md">相关档口</h2>
              <div className="mt-4 grid gap-3">
                {shopResults.map((shop) => (
                  <article key={shop.handle} className="rounded-sm border border-[#E5E7EB] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="heading-sm">{shop.name}</p>
                        <p className="mt-1 text-sm text-secondary">
                          {shop.market} · {shop.booth}
                        </p>
                        <p className="mt-2 text-sm text-secondary">{shop.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {shop.tags.map((tag) => (
                            <span key={tag} className="rounded-sm bg-[#F8FAFC] px-2 py-1 text-[12px] text-secondary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/${locale}/sellers/${shop.handle}`}
                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-sm bg-[#155EEF] px-3 label-md text-white hover:bg-[#1D4ED8]"
                      >
                        查看店铺
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="hidden space-y-4 lg:block">
            <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="label-lg">市场配置</p>
              <div className="mt-3 grid gap-3">
                {marketResults.map((market) => (
                  <div key={market.name} className="rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                    <p className="label-lg">{market.name}</p>
                    <p className="mt-1 text-sm text-secondary">{market.city} · {market.hours}</p>
                    <p className="mt-2 text-sm text-secondary">{market.notice}</p>
                    <p className="mt-2 text-sm text-[#1D4ED8]">{market.delivery}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="label-lg">类目</p>
              <div className="mt-3 grid gap-2">
                {categoryResults.map((category) => (
                  <Link
                    key={category.handle}
                    href={`/${locale}/categories/${category.handle}`}
                    className="rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] p-3 hover:border-[#155EEF]"
                  >
                    <p className="label-md">{category.name}</p>
                    <p className="mt-1 text-sm text-secondary">
                      {category.description} · {category.count}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-[#F59E0B] bg-[#FFFBEB] p-4 shadow-sm">
              <p className="label-lg text-[#92400E]">买鲜提示</p>
              <p className="mt-2 text-sm text-[#92400E]">
                鲜活和称重商品价格、库存会随到货变化，最终以商家确认和结算页为准。
              </p>
            </div>
          </aside>
        </section>
      </div>

      <div className="fixed bottom-10 left-0 z-30 w-screen max-w-[100vw] px-3 lg:hidden">
        <div className="flex items-center justify-between rounded-full bg-[#111827] px-4 py-2 text-white shadow-lg">
          <div>
            <p className="text-[13px] font-semibold leading-5">真实商品可加购</p>
            <p className="text-[12px] leading-4 text-white/75">样例内容只做展示</p>
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
        <Link href={`/${locale}/search`} className="truncate font-semibold text-[#155EEF]">
          找货
        </Link>
        <Link href={`/${locale}/categories`} className="truncate text-secondary">
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
