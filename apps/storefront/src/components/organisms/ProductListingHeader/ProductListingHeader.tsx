export const ProductListingHeader = ({ total }: { total: number }) => {
  return (
    <div
      className="flex w-full flex-col gap-3 rounded-sm border bg-ui-bg-base p-4 md:flex-row md:items-end md:justify-between"
      data-testid="product-listing-header"
    >
      <div>
        <p className="label-md text-ui-fg-interactive">本地市场找货</p>
        <h1 className="heading-md text-primary">今日鲜货 / 档口货源</h1>
        <p className="mt-2 text-sm text-secondary">
          按市场、商家档口、鲜活/冰鲜/冷冻和自提/配送能力筛选；当前列表仍以 Store API 返回为准。
        </p>
      </div>
      <div
        className="rounded-sm bg-ui-bg-subtle px-3 py-2 text-sm text-secondary"
        data-testid="product-listing-total"
      >
        共 {total} 款可看商品
      </div>
    </div>
  );
};
