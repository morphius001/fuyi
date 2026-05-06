import { SkeletonProductCard } from "@/components/organisms/ProductCard/SkeletonProductCard"
import { PRODUCT_LIMIT } from "@/const"

const ProductListingLoadingView = () => (
  <div className="w-full" data-testid="product-listing-loading-view">
    <p className="mb-4 text-sm text-secondary">正在加载市场鲜货和档口商品...</p>
    <div className="flex flex-wrap gap-4">
    {Array.from({ length: PRODUCT_LIMIT }).map((_, idx) => (
      <SkeletonProductCard key={idx} />
    ))}
    </div>
  </div>
)

export default ProductListingLoadingView
