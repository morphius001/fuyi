import { ProductCard } from "../ProductCard/ProductCard"
import { HttpTypes } from "@medusajs/types"
import ProductListingNoResultsView from "@/components/molecules/ProductListingNoResultsView/ProductListingNoResultsView"

export const ProductsList = ({
  products,
}: {
  products: HttpTypes.StoreProduct[]
}) => {
  if (!products.length) {
    return <ProductListingNoResultsView />
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  )
}
