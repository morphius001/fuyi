export const ProductSidebar = () => {
  const marketFilters = ['三门海鲜市场', '舟山沈家门市场', '宁波路林水产市场'];
  const fulfillmentFilters = ['今日到货', '门店自提', '同城配送', '冷链可约'];
  const categoryFilters = ['鲜活水产', '冰鲜冻品', '海产干货', '水果蔬菜'];

  return (
    <aside
      className="w-full rounded-sm border bg-ui-bg-base p-4"
      data-testid="sidebar"
    >
      <div className="space-y-5" data-testid="sidebar-filters">
        <div>
          <h2 className="heading-sm text-primary">市场筛选</h2>
          <div className="mt-3 space-y-2">
            {marketFilters.map((label) => (
              <div key={label} className="rounded-sm bg-ui-bg-subtle px-3 py-2 text-sm text-secondary">
                {label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="heading-sm text-primary">履约方式</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {fulfillmentFilters.map((label) => (
              <span key={label} className="rounded-sm bg-ui-bg-subtle px-2 py-1 text-xs text-secondary">
                {label}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="heading-sm text-primary">类目</h2>
          <div className="mt-3 space-y-2">
            {categoryFilters.map((label) => (
              <div key={label} className="rounded-sm bg-ui-bg-subtle px-3 py-2 text-sm text-secondary">
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-sm border border-ui-border-base bg-ui-bg-subtle p-3 text-xs text-secondary">
          当前为本地市场筛选占位；后续接 Algolia 或 Store API 时，不改变支付、订单或库存逻辑。
        </div>
      </div>
    </aside>
  );
};
