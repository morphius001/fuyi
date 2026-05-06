const ProductListingNoResultsView = () => (
  <div
    className="my-10 w-full text-center"
    data-testid="product-listing-no-results-view"
  >
    <h2 className="heading-lg text-primary">暂无匹配鲜货</h2>
    <p className="mt-4 text-lg text-secondary">
      没有找到符合条件的商品。可以换个市场、档口、类目或搜索关键词再试。
    </p>
    <p className="mt-2 text-sm text-secondary">
      本页不会展示商户物料采购、配送供应商接单等 B 端能力。
    </p>
  </div>
);

export default ProductListingNoResultsView;
