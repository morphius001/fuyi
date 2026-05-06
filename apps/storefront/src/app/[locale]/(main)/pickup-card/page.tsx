import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "提货卡提货",
  description:
    "提货卡是消费者预先获得的权益提货凭证，用于提交提货申请，不是支付方式、优惠券或储值卡。",
}

const rights = [
  "输入卡号/卡密或扫码后查看权益内容",
  "确认提货商品、规格、数量和收货/自提信息",
  "提交提货申请后等待商家备货和平台履约",
]

const boundaries = [
  "不是支付方式",
  "不是优惠券、满减券或折扣券",
  "不是储值卡、余额或购物车抵扣",
  "当前页面为 mock 占位，不会真实核销卡密",
]

const fulfillmentFields = [
  ["联系人", "示例：张先生"],
  ["手机号", "示例：138****8000"],
  ["省 / 市 / 区县", "浙江省 / 台州市 / 三门县"],
  ["街道 / 详细地址", "海游街道示例地址 1 号"],
]

const pickupSlots = [
  "市场自提：三门海鲜市场 A 区服务台 mock",
  "同城配送：城区 5 公里内冷链配送 mock",
  "快递配送：当前不生成真实运单号",
]

export default async function PickupCardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="overflow-x-hidden bg-[#F6F8FB] px-3 py-6 text-primary sm:px-4 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px] min-w-0">
        <Link
          href={`/${locale}`}
          className="label-md text-[#155EEF] hover:underline"
        >
          返回本地鲜货首页
        </Link>

        <section className="mt-4 w-full min-w-0 overflow-hidden rounded-sm border border-[#E5E7EB] bg-white shadow-sm">
          <div className="min-w-0 border-b border-[#E5E7EB] bg-[#155EEF] px-4 py-5 text-white sm:px-5">
            <p className="text-sm text-white/80">消费者权益提货入口</p>
            <h1 className="mt-2 text-[28px] font-semibold leading-[36px] tracking-normal text-white sm:text-[30px] md:text-[40px] md:leading-[48px]">
              提货卡提货
            </h1>
            <p className="mt-3 max-w-[620px] break-all text-sm leading-6 text-white/86 sm:text-md">
              仅为页面占位。不接真实卡密、兑换或支付。
            </p>
          </div>

          <div className="grid min-w-0 gap-4 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 rounded-sm border border-[#E5E7EB] bg-[#F8FAFC] p-3 sm:p-4">
              <p className="label-lg">提货信息 mock</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-secondary">
                  卡号
                  <input
                    disabled
                    placeholder="示例：THK-2026-0001"
                    className="h-11 min-w-0 rounded-sm border border-[#D1D5DB] bg-white px-3 text-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm text-secondary">
                  卡密
                  <input
                    disabled
                    placeholder="当前不接真实卡密"
                    className="h-11 min-w-0 rounded-sm border border-[#D1D5DB] bg-white px-3 text-primary"
                  />
                </label>
              </div>

              <div className="mt-4 min-w-0 rounded-sm border border-dashed border-[#93C5FD] bg-white p-3 sm:p-4">
                <p className="label-md text-[#1D4ED8]">权益预览占位</p>
                <p className="mt-2 break-words text-sm leading-6 text-secondary">
                  后续会展示卡种、可提商品/套餐、有效期、可配送市场、履约方式和提货次数。当前不读取真实卡信息。
                </p>
              </div>

              <div className="mt-4 min-w-0 rounded-sm border border-[#E5E7EB] bg-white p-3 sm:p-4">
                <p className="label-md">收货 / 自提信息占位</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {fulfillmentFields.map(([label, placeholder]) => (
                    <label key={label} className="grid gap-2 text-sm text-secondary">
                      {label}
                      <input
                        disabled
                        placeholder={placeholder}
                        className="h-10 min-w-0 rounded-sm border border-[#D1D5DB] bg-[#F8FAFC] px-3 text-primary"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-3 grid gap-2">
                  {pickupSlots.map((slot) => (
                    <p
                      key={slot}
                      className="break-words rounded-sm bg-[#F8FAFC] px-3 py-2 text-sm leading-6 text-secondary"
                    >
                      {slot}
                    </p>
                  ))}
                </div>
              </div>

              <button
                disabled
                className="mt-4 min-h-11 w-full rounded-sm bg-[#CBD5E1] px-5 py-3 label-md leading-5 text-white sm:w-auto"
              >
                验证并提交提货申请（未接入）
              </button>
            </div>

            <aside className="min-w-0 space-y-4">
              <div className="rounded-sm border border-[#E5E7EB] bg-white p-4">
                <p className="label-lg">后续流程</p>
                <div className="mt-3 grid gap-2">
                  {rights.map((item, index) => (
                    <div key={item} className="flex gap-3 text-sm text-secondary">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-[#F59E0B] bg-[#FFFBEB] p-4">
                <p className="label-lg text-[#92400E]">边界说明</p>
                <div className="mt-3 grid gap-2">
                  {boundaries.map((item) => (
                    <p key={item} className="text-sm text-[#92400E]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}
