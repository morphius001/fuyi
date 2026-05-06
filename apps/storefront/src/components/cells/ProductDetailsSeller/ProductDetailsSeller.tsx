import { SellerInfo } from "@/components/molecules"
import { SellerProps } from "@/types/seller"

export const ProductDetailsSeller = ({ seller }: { seller?: SellerProps }) => {
  if (!seller) return null

  return (
    <div className="border rounded-sm">
      <div>
          <div className="flex justify-between">
            <SellerInfo seller={seller} showArrow bottomBorder />
          </div>
          <div className="grid gap-3 p-4 text-sm text-ui-fg-subtle sm:grid-cols-3">
            <div className="rounded-sm bg-ui-bg-subtle p-3">
              <p className="font-medium text-ui-fg-base">市场档口</p>
              <p className="mt-1">{seller.city || "本地市场"} · 档口信息待完善</p>
            </div>
            <div className="rounded-sm bg-ui-bg-subtle p-3">
              <p className="font-medium text-ui-fg-base">经营状态</p>
              <p className="mt-1">
                {seller.store_status === "ACTIVE" ? "正常营业" : "状态待确认"}
              </p>
            </div>
            <div className="rounded-sm bg-ui-bg-subtle p-3">
              <p className="font-medium text-ui-fg-base">服务能力</p>
              <p className="mt-1">商家可开启统一配送、档口自送、到店自提</p>
            </div>
          </div>
      </div>
    </div>
  )
}
