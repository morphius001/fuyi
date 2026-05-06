import { HttpTypes } from "@medusajs/types"

import { CartDropdown, MobileNavbar, Navbar } from "@/components/cells"
import { HeartIcon } from "@/icons"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { Wishlist } from "@/types/wishlist"
import { Badge } from "@/components/atoms"
import CountrySelector from "@/components/molecules/CountrySelector/CountrySelector"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"
import { NavbarSearch } from "@/components/molecules"
import { listCategories } from "@/lib/data/categories"
import { listRegions } from "@/lib/data/regions"
import { getUserWishlists } from "@/lib/data/wishlist"
import { retrieveCustomer } from "@/lib/data/customer"

export const Header = async ({ locale } : {
  locale: string
}) => {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Fuyi"
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)

  let wishlist: Wishlist = {products: []}
  if (user) {
    wishlist = await getUserWishlists({countryCode: locale})
  }

  const regions = await listRegions()

  const wishlistCount = wishlist?.products.length || 0

  const { categories, parentCategories } = (await listCategories({ query: { include_ancestors_tree: true } })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }
  return (
    <header className="border-b border-[#E5E7EB] bg-white" data-testid="header">
      <div
        className="mx-auto flex h-12 w-full max-w-[1680px] items-center gap-4 px-4 md:h-16 md:px-5 lg:h-20 lg:px-8 2xl:px-10"
        data-testid="header-top"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MobileNavbar
            parentCategories={parentCategories}
            categories={categories}
          />
          <LocalizedClientLink
            href="/"
            className="shrink-0 text-[22px] font-bold leading-none tracking-normal text-primary md:text-2xl"
            aria-label={`${siteName} 首页`}
            data-testid="header-logo-link"
          >
            {siteName}
          </LocalizedClientLink>
          <span className="hidden border-l border-[#E5E7EB] pl-3 text-sm text-secondary lg:inline">
            本地鲜货市场
          </span>
        </div>
        <div className="hidden w-full max-w-[520px] shrink lg:block" data-testid="header-search-desktop">
          <NavbarSearch className="max-w-[520px]" />
        </div>
        <div className="ml-auto hidden min-w-0 shrink-0 items-center justify-end gap-2 py-2 lg:flex lg:gap-4" data-testid="header-actions">
          <div className="hidden sm:block">
            <CountrySelector regions={regions} />
          </div>
          {isLoggedIn && <MessageButton />}
          <UserDropdown isLoggedIn={isLoggedIn} />
          {isLoggedIn && (
            <LocalizedClientLink href="/user/wishlist" className="relative" data-testid="header-wishlist-link">
              <HeartIcon size={20} />
              {Boolean(wishlistCount) && (
                <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0" data-testid="wishlist-count-badge">
                  {wishlistCount}
                </Badge>
              )}
            </LocalizedClientLink>
          )}

          <CartDropdown />
        </div>
      </div>
      <Navbar categories={categories} parentCategories={parentCategories} />
    </header>
  )
}
