import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export const Navbar = (_props: {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div className="hidden border-b border-[#E5E7EB] bg-white lg:block" data-testid="navbar">
      <div className="mx-auto flex h-12 w-full max-w-[1680px] items-center gap-5 px-4 md:px-5 lg:px-8 2xl:px-10">
        <LocalizedClientLink
          href="/categories"
          className="flex h-full w-[240px] shrink-0 items-center bg-[#155EEF] px-4 label-lg text-white"
          data-testid="category-link-all-products"
        >
          全部类目
        </LocalizedClientLink>
        <div className="flex min-w-0 flex-1 items-center gap-5 overflow-hidden text-sm text-secondary">
          <LocalizedClientLink href="/categories" className="hover:text-[#155EEF]">
            市场频道
          </LocalizedClientLink>
          <LocalizedClientLink href="/categories" className="hover:text-[#155EEF]">
            档口推荐
          </LocalizedClientLink>
          <LocalizedClientLink href="/search" className="hover:text-[#155EEF]">
            今日到货
          </LocalizedClientLink>
          <LocalizedClientLink href="/pickup-card" className="hover:text-[#155EEF]">
            提货卡
          </LocalizedClientLink>
          <LocalizedClientLink href="/#progress" className="hover:text-[#155EEF]">
            售后保障
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
