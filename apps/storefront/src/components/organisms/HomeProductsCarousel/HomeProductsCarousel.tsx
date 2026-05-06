import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"

type CarouselProduct = Product | HttpTypes.StoreProduct

const isDisplayableProduct = (product: CarouselProduct) =>
  Boolean(product?.id && product?.handle && product?.title && product?.thumbnail)

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
}) => {
  const {
    response: { products },
  } = await listProducts({
    countryCode: locale,
    queryParams: {
      limit: home ? 4 : undefined,
      order: "created_at",
      handle: home
        ? undefined
        : sellerProducts.map((product) => product.handle),
    },
    forceCache: !home,
  })

  const displayableProducts = (sellerProducts.length ? sellerProducts : products)
    .filter(isDisplayableProduct)
    .slice(0, home ? 4 : undefined)

  if (!displayableProducts.length) {
    return (
      <div className="w-full rounded-sm border bg-component-secondary px-4 py-8 text-center">
        <p className="label-lg text-primary">暂无可展示商品</p>
        <p className="label-md mt-2 text-secondary">商品资料完善后会在这里展示。</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full">
      <Carousel
        align="start"
        items={displayableProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      />
    </div>
  )
}
