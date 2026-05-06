import { ProductDetailsPage } from "@/components/sections"
import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import {
  getFreshProductByHandle,
  marketHeroImage,
  productTagStyles,
  sellerHandlesByName,
} from "../../data/home-market"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params
  const mockProduct = getFreshProductByHandle(handle)

  if (mockProduct) {
    return {
      title: `${mockProduct.name} | 本地鲜货`,
      description: `${mockProduct.seller} 的 ${mockProduct.name}，${mockProduct.spec}。`,
    }
  }

  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true,
  }).then(({ response }) => response.products[0])

  if (!prod) {
    return {
      title: "鲜货详情",
      description: "本地鲜货详情页",
    }
  }

  return generateProductMetadata(prod)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params
  const mockProduct = getFreshProductByHandle(handle)

  if (mockProduct) {
    const sellerHandle = sellerHandlesByName[mockProduct.seller]

    return (
      <main className="w-screen max-w-[100vw] overflow-x-hidden bg-[#F6F8FB] px-3 pb-24 pt-3 text-primary lg:w-full lg:max-w-none lg:px-8 lg:py-6">
        <div className="mx-auto w-full max-w-[1480px]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link
              href={`/${locale}/categories`}
              className="text-[13px] leading-5 text-[#155EEF] lg:label-md"
            >
              返回市场频道
            </Link>
            <Link
              href={`/${locale}/sellers/${sellerHandle}`}
              className="text-[13px] leading-5 text-[#155EEF] lg:label-md"
            >
              进入档口
            </Link>
          </div>

          <section className="grid gap-4 rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:rounded-sm lg:p-4">
            <div className="relative min-h-[320px] overflow-hidden rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] md:aspect-square">
              <Image
                src={marketHeroImage}
                alt={`${mockProduct.name} 商品图`}
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
              <span
                className={`absolute left-3 top-3 rounded-sm px-2 py-1 text-[12px] leading-4 ${
                  productTagStyles[mockProduct.tag] || "bg-white text-secondary"
                }`}
              >
                {mockProduct.tag}
              </span>
            </div>

            <div className="rounded-sm border border-[#E5E7EB] p-4 lg:p-5">
              <p className="label-md text-[#155EEF]">本地鲜货 / 档口供给</p>
              <h1 className="mt-2 text-[28px] font-semibold leading-[36px] tracking-normal lg:text-[38px] lg:leading-[46px]">
                {mockProduct.name}
              </h1>
              <p className="mt-3 text-md text-secondary">{mockProduct.spec}</p>

              <div className="mt-5">
                <p className="label-md text-secondary">今日参考价</p>
                <p className="mt-1 text-[34px] font-semibold leading-[42px] text-[#EA580C]">
                  {mockProduct.price}
                </p>
                <p className="mt-1 text-sm text-secondary">
                  鲜活和称重商品会随到货、规格和称重结果浮动。
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["档口", mockProduct.seller],
                  ["市场", mockProduct.market],
                  ["到货", mockProduct.stock],
                  ["鲜度", mockProduct.freshness],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] p-3"
                  >
                    <p className="text-sm text-secondary">{label}</p>
                    <p className="mt-1 label-md text-primary">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-sm border border-[#DBEAFE] bg-[#F8FBFF] p-3">
                <p className="label-md text-[#1E3A8A]">履约方式</p>
                <p className="mt-1 text-sm text-secondary">
                  {mockProduct.delivery}；市场统一配送、档口自送、到店自提由商家进店后确认。
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/${locale}/sellers/${sellerHandle}`}
                  className="inline-flex h-11 items-center justify-center rounded-sm bg-[#155EEF] px-5 label-md text-white hover:bg-[#1D4ED8]"
                >
                  进入档口选规格
                </Link>
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent(
                    mockProduct.name
                  )}`}
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-[#155EEF] px-5 label-md text-[#155EEF] hover:bg-[#EFF6FF]"
                >
                  查看相似鲜货
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm lg:rounded-sm">
            <h2 className="heading-md">购买说明</h2>
            <div className="mt-3 grid gap-3 text-sm text-secondary md:grid-cols-3">
              <p className="rounded-sm bg-[#F8FAFC] p-3">
                规格、重量和库存以商家确认以及结算页为准。
              </p>
              <p className="rounded-sm bg-[#F8FAFC] p-3">
                跨档口订单可能分开自提或配送。
              </p>
              <p className="rounded-sm bg-[#F8FAFC] p-3">
                鲜活商品签收时建议确认重量、规格和外观。
              </p>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="w-screen max-w-[100vw] overflow-x-hidden bg-[#F6F8FB] px-3 pb-24 pt-3 text-primary lg:w-full lg:max-w-none lg:px-8 lg:py-6">
      <ProductDetailsPage handle={handle} locale={locale} />
    </main>
  )
}
