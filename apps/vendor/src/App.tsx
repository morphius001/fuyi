import { useEffect, useState } from "react";

import "./styles.css";

import {
  type DashboardPage,
  type ListItem,
  type Metric,
  type PageId,
  aiChannelHints,
  aiDraftPreview,
  aiDraftWarnings,
  aiStructuredDraftRows,
  credentialCards,
  decorationPreviewChecklist,
  deliveryNotes,
  fastListingCategories,
  fastListingFields,
  focusModules,
  homeMetrics,
  liveDecorationStatus,
  marketCards,
  marketSummary,
  menuItems,
  moduleCards,
  pageMap,
  photoPlaceholders,
  productGroups,
  productSpecTemplates,
  quickSpecFields,
  quickEntries,
  responsibilityRows,
  riskItems,
  shopAnnouncements,
  shopDecorationHero,
  storeTasks,
  supplierRoleAccessMatrix,
  supplySummary,
  todayFreshItems,
} from "./china/data/vendorMockData";

const getRowsForStatus = (page: DashboardPage, statusKey: string) => {
  if (statusKey === "all") {
    return page.rows;
  }

  if (statusKey === "empty") {
    return [];
  }

  return page.rows.filter((row) => row.status === statusKey);
};

type ChinaCapabilityStatus =
  | "enabled_baseline"
  | "read_only_baseline"
  | "disabled_until_backend"
  | "design_only"
  | "high_risk_serial";

type ChinaCapability = {
  key: string;
  label: string;
  description: string;
  status: ChinaCapabilityStatus;
  owner: string;
  risk: "low" | "medium" | "high";
};

type ChinaCapabilityGroup = {
  key: string;
  label: string;
  capabilities: ChinaCapability[];
};

type VendorCapabilityResponse = {
  capabilities: {
    mode: string;
    source: string;
    note: string;
    groups: ChinaCapabilityGroup[];
  };
};

type CapabilityState =
  | { status: "loading" }
  | { status: "ready"; data: VendorCapabilityResponse["capabilities"] }
  | { status: "error"; message: string };

const capabilityStatusLabels: Record<ChinaCapabilityStatus, string> = {
  enabled_baseline: "已开通基础版",
  read_only_baseline: "只读基础版",
  disabled_until_backend: "待后台开通",
  design_only: "设计占位",
  high_risk_serial: "高风险串行",
};

const importantVendorCapabilityKeys = new Set([
  "mobile_quick_listing",
  "ai_listing_draft",
  "shop_decoration",
  "market_delivery_options",
  "delivery_supplier_orders",
  "waybill_printing",
  "materials_procurement",
  "source_supplier_connection",
  "seedling_wholesale",
  "regional_wholesaler_connection",
]);

const getBackendUrl = () =>
  (import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "http://127.0.0.1:9000").replace(
    /\/$/,
    ""
  );

const vendorPublishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY;

function App() {
  const [activePageId, setActivePageId] = useState<PageId>("home");
  const [activeStatuses, setActiveStatuses] = useState<Record<string, string>>({});
  const activePage =
    activePageId === "home" ? undefined : pageMap.get(activePageId);

  return (
    <div className="vendor-shell">
      <aside className="sidebar" aria-label="商家后台导航">
        <div className="brand">
          <div className="brand-mark">富</div>
          <div>
            <p className="brand-name">富屹商家工作台</p>
            <p className="brand-subtitle">中国大陆商家经营后台</p>
          </div>
        </div>

        <nav className="nav-list">
          {menuItems.map((item, index) => {
            const previous = menuItems[index - 1];
            const showGroup = !previous || previous.group !== item.group;

            return (
              <div key={item.id}>
                {showGroup ? <p className="nav-group">{item.group}</p> : null}
                <button
                  className={`nav-item ${activePageId === item.id ? "active" : ""}`}
                  onClick={() => setActivePageId(item.id)}
                  type="button"
                >
                  <span>{item.label}</span>
                  <small>{item.id === "home" ? "概览" : "占位"}</small>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <strong>Mock 模式</strong>
          <span>当前不连接真实订单、支付、结算、物流或权限接口。</span>
        </div>
      </aside>

      <main className="main-panel">
        <section className="mobile-priority-actions" aria-label="移动端优先操作">
          <div>
            <span>今日优先</span>
            <strong>快速上架 / AI 草稿</strong>
            <p>手机端先处理鲜货上架、AI 草稿确认和关键待办。</p>
          </div>
          <div className="mobile-action-grid">
            <button type="button" onClick={() => setActivePageId("mobileListing")}>
              手机快速上架
            </button>
            <button type="button" onClick={() => setActivePageId("aiListingDraft")}>
              AI 草稿上架
            </button>
            <button type="button" onClick={() => setActivePageId("shopDecoration")}>
              店铺装修
            </button>
            <button type="button" onClick={() => setActivePageId("orders")}>
              待发货 36
            </button>
            <button type="button" onClick={() => setActivePageId("afterSales")}>
              售后待处理 7
            </button>
          </div>
        </section>

        <header className="topbar">
          <div>
            <p className="eyebrow">Asia/Shanghai · zh-CN · CNY</p>
            <h1>{activePage?.title ?? "店铺首页"}</h1>
          </div>
          <div className="topbar-status" aria-label="顶部状态栏">
            <span>当前市场：三门海鲜市场（示例，可切换）</span>
            <span>档口：A 区 18 号</span>
            <span>关联市场：2 个</span>
            <span>商户类型：海鲜档口 / 平台开通</span>
            <span>经营状态：正常</span>
            <span>数据时间：2026-05-03 11:30</span>
          </div>
        </header>

        {activePage ? (
          <ManagementPage
            activeStatus={activeStatuses[activePage.id] ?? "all"}
            onStatusChange={(status) =>
              setActiveStatuses((current) => ({
                ...current,
                [activePage.id]: status,
              }))
            }
            page={activePage}
          />
        ) : (
          <HomePage onNavigate={setActivePageId} />
        )}
      </main>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [capabilityState, setCapabilityState] = useState<CapabilityState>(() =>
    vendorPublishableKey
      ? { status: "loading" }
      : {
          status: "error",
          message: "缺少 VITE_MEDUSA_PUBLISHABLE_KEY，暂时显示本地静态矩阵。",
        }
  );

  useEffect(() => {
    const controller = new AbortController();

    if (!vendorPublishableKey) {
      return () => controller.abort();
    }

    fetch(`${getBackendUrl()}/store/china/vendor-capabilities`, {
      credentials: "include",
      headers: {
        "x-publishable-api-key": vendorPublishableKey,
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`能力 API 返回 ${response.status}`);
        }

        return (await response.json()) as VendorCapabilityResponse;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setCapabilityState({
            status: "ready",
            data: data.capabilities,
          });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setCapabilityState({
          status: "error",
          message:
            error instanceof Error
              ? `${error.message}，暂时显示本地静态矩阵。`
              : "能力 API 读取失败，暂时显示本地静态矩阵。",
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="page-stack">
      <section className="mock-notice" aria-label="数据源说明">
        <strong>静态 mock 工作台</strong>
        <span>
          默认示例为三门海鲜市场；平台支持多市场切换、商户类型和业务模块开通。所有金额为 CNY，均为前端静态占位。
        </span>
      </section>

      <section className="boundary-grid" aria-label="市场与角色边界">
        {marketCards.map(([title, value, detail]) => (
          <article className="boundary-card" key={title}>
            <span>{title}</span>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="market-rule-grid" aria-label="当前市场规则摘要">
        {marketSummary.map(([title, detail]) => (
          <article className="market-rule-card" key={title}>
            <strong>{title}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="decoration-home-card" aria-label="店铺装修快捷维护">
        <div className="decoration-home-copy">
          <p className="eyebrow">店铺装修 · 档口主页预览</p>
          <h2>{shopDecorationHero.shopName}</h2>
          <p>
            维护头图、公告、今日鲜货、商品分组、资质、配送说明和直播状态；当前仅为静态
            mock 草稿，不保存、不上传、不发布。
          </p>
        </div>
        <div className="decoration-home-actions">
          <span>{shopDecorationHero.market}</span>
          <span>{shopDecorationHero.booth}</span>
          <button type="button" onClick={() => onNavigate("shopDecoration")}>
            进入装修工作台
          </button>
        </div>
      </section>

      <section className="metric-grid" aria-label="首页经营指标">
        {homeMetrics.map((metric) => (
          <MetricCard metric={metric} key={metric.label} />
        ))}
      </section>

      <section className="module-grid" aria-label="平台开通模块">
        {moduleCards.map(([title, status, detail]) => (
          <article className="module-card" key={title}>
            <div>
              <strong>{title}</strong>
              <span>{status}</span>
            </div>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <CapabilityContractPanel state={capabilityState} />

      <section className="module-grid" aria-label="供应方角色开通矩阵">
        {supplierRoleAccessMatrix.map(([role, status, detail]) => (
          <article className="module-card role-boundary-card" key={role}>
            <div>
              <strong>{role}</strong>
              <span>{status}</span>
            </div>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="supply-grid" aria-label="上游供给摘要">
        {supplySummary.map(([title, value, detail]) => (
          <article className="supply-card" key={title}>
            <span>{title}</span>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="home-layout">
        <Panel title="店铺待办" description="按商家日常经营优先级展示">
          <CompactList items={storeTasks} onNavigate={onNavigate} />
        </Panel>

        <Panel title="经营风险" description="仅做风险提示占位，不改变业务状态">
          <CompactList items={riskItems} onNavigate={onNavigate} />
        </Panel>
      </section>

      <section className="quick-grid" aria-label="快捷入口">
        {quickEntries.map((entry) => (
          <button
            className="quick-card"
            key={entry.label}
            onClick={() => onNavigate(entry.target)}
            type="button"
          >
            <strong>{entry.label}</strong>
            <span>{entry.detail}</span>
          </button>
        ))}
      </section>

      <section className="home-layout wide-left">
        <Panel title="近期重点模块" description="帮助商家把运营动作拆到责任模块">
          <div className="focus-list">
            {focusModules.map(([title, module, detail]) => (
              <article className="focus-item" key={title}>
                <span>{module}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="业务入口与职责说明" description="静态职责表，便于后续接权限和真实 API">
          <div className="table-wrap compact">
            <table>
              <thead>
                <tr>
                  <th>入口</th>
                  <th>职责</th>
                  <th>负责人</th>
                </tr>
              </thead>
              <tbody>
                {responsibilityRows.map(([entry, duty, owner]) => (
                  <tr key={entry}>
                    <td>{entry}</td>
                    <td>{duty}</td>
                    <td>{owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function CapabilityContractPanel({ state }: { state: CapabilityState }) {
  if (state.status === "loading") {
    return (
      <section className="readonly-state" aria-label="后端能力契约加载中">
        <strong>后端能力契约</strong>
        <p>正在读取 Vendor capability view，不改变真实权限或业务状态。</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="mock-notice" aria-label="后端能力契约回退">
        <strong>后端能力契约未连接</strong>
        <span>{state.message}</span>
      </section>
    );
  }

  const capabilities = state.data.groups
    .flatMap((group) =>
      group.capabilities.map((capability) => ({
        ...capability,
        groupLabel: group.label,
      }))
    )
    .filter((capability) => importantVendorCapabilityKeys.has(capability.key));

  return (
    <section className="capability-panel" aria-label="后端能力契约">
      <div className="panel-header">
        <div>
          <h2>后端能力契约</h2>
          <p>
            读取 `/store/china/vendor-capabilities`；这里只展示开通边界，不改变权限、接单、履约、库存或结算。
          </p>
        </div>
        <span className="capability-source">
          {state.data.source} · {state.data.mode}
        </span>
      </div>
      <div className="capability-grid">
        {capabilities.map((capability) => (
          <article className="capability-card" key={capability.key}>
            <div>
              <strong>{capability.label}</strong>
              <span className={`capability-status ${capability.status}`}>
                {capabilityStatusLabels[capability.status]}
              </span>
            </div>
            <p>{capability.description}</p>
            <small>
              {capability.groupLabel} · owner: {capability.owner} · risk:{" "}
              {capability.risk}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}

function ManagementPage({
  activeStatus,
  onStatusChange,
  page,
}: {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  page: DashboardPage;
}) {
  const rows = getRowsForStatus(page, activeStatus);

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">{page.owner} · 商家后台基础版</p>
          <h2>{page.title}</h2>
          <p>{page.description}</p>
        </div>
        <div className="page-actions">
          <button className="ghost-button" disabled type="button">
            {page.secondaryAction}
          </button>
          <button className="primary-button" disabled type="button">
            {page.primaryAction}
          </button>
        </div>
      </section>

      <section className="mock-notice" aria-label={`${page.title}只读说明`}>
        <strong>只读占位</strong>
        <span>
          当前页面使用 mock 静态数据。筛选和操作按钮不触发发货、退款、结算、库存扣减或权限变更。
        </span>
      </section>

      <section className="mini-metric-grid" aria-label={`${page.title}关键指标`}>
        {page.stats.map((metric) => (
          <MetricCard metric={metric} key={metric.label} />
        ))}
      </section>

      {page.id === "mobileListing" ? <MobileListingSkeleton /> : null}
      {page.id === "aiListingDraft" ? <AiListingDraftSkeleton /> : null}
      {page.id === "shopDecoration" ? <ShopDecorationSkeleton /> : null}

      <section className="filter-panel" aria-label={`${page.title}筛选区`}>
        {page.filters.map((label) => (
          <label className="filter-field" key={label}>
            <span>{label}</span>
            <input placeholder={`请输入${label}`} type="text" />
          </label>
        ))}
        <div className="filter-actions">
          <button className="ghost-button" disabled type="button">
            重置
          </button>
          <button className="primary-button" disabled type="button">
            筛选
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="tabs" role="tablist" aria-label={`${page.title}状态`}>
          {page.statuses.map((status) => (
            <button
              aria-selected={activeStatus === status.key}
              className={activeStatus === status.key ? "active" : ""}
              key={status.key}
              onClick={() => onStatusChange(status.key)}
              role="tab"
              type="button"
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {page.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.id}>
                    {page.columns.map((column) => (
                      <td key={column.key}>{row.cells[column.key]}</td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <button className="table-action" disabled type="button">
                          查看占位
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="empty-cell" colSpan={page.columns.length + 1}>
                    <EmptyState
                      description={page.emptyDescription}
                      title={page.emptyTitle}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="readonly-state">
        <strong>后续接入说明</strong>
        <p>{page.todo}</p>
      </section>
    </div>
  );
}

function ShopDecorationSkeleton() {
  return (
    <section className="shop-decoration-workspace" aria-label="店铺装修基础壳">
      <div className="shop-decoration-main">
        <section className="shop-hero-editor" aria-label="店铺头图与预览">
          <div className="hero-art">
            <div className="hero-art-pattern" aria-hidden="true" />
            <div className="hero-art-copy">
              <span>{shopDecorationHero.market}</span>
              <h2>{shopDecorationHero.headline}</h2>
              <p>{shopDecorationHero.subline}</p>
            </div>
            <strong>{shopDecorationHero.status}</strong>
          </div>
          <div className="hero-editor-fields">
            <div>
              <span>店铺名称</span>
              <strong>{shopDecorationHero.shopName}</strong>
            </div>
            <div>
              <span>市场 / 档口</span>
              <strong>
                {shopDecorationHero.market} · {shopDecorationHero.booth}
              </strong>
            </div>
            <div>
              <span>头图素材</span>
              <strong>占位图，不上传真实图片</strong>
            </div>
          </div>
        </section>

        <Panel title="公告维护" description="展示给消费者的店铺公告占位">
          <div className="announcement-list">
            {shopAnnouncements.map(([title, detail]) => (
              <article className="announcement-item" key={title}>
                <span>{title}</span>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="今日鲜货" description="用于店铺主页首屏和直播选品的 mock 商品区">
          <div className="fresh-grid">
            {todayFreshItems.map(([name, price, stock, note]) => (
              <article className="fresh-card" key={name}>
                <span>{note}</span>
                <strong>{name}</strong>
                <p>{price}</p>
                <small>{stock}</small>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="商品分组" description="按本地生鲜市场运营方式组织商品入口">
          <div className="group-grid">
            {productGroups.map(([title, items, detail]) => (
              <article className="group-card" key={title}>
                <strong>{title}</strong>
                <span>{items}</span>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <aside className="shop-decoration-side" aria-label="装修侧栏信息">
        <Panel title="消费者预览入口" description="只展示预览路径，不发布真实店铺页面">
          <div className="shop-preview-phone">
            <div className="preview-phone-top">
              <span>店铺主页预览</span>
              <strong>Mock</strong>
            </div>
            <div className="preview-phone-hero">
              <span>{shopDecorationHero.booth}</span>
              <strong>{shopDecorationHero.shopName}</strong>
              <p>{shopDecorationHero.headline}</p>
            </div>
            <div className="preview-phone-row">
              <span>公告</span>
              <p>{shopAnnouncements[0][1]}</p>
            </div>
            <div className="preview-phone-row live">
              <span>直播</span>
              <p>正在直播占位 · 不接真实推流</p>
            </div>
            <button className="primary-button" disabled type="button">
              打开消费者预览占位
            </button>
          </div>
        </Panel>

        <Panel title="资质展示" description="资质只做展示壳，不上传文件">
          <div className="credential-list">
            {credentialCards.map(([title, status, detail]) => (
              <article className="credential-item" key={title}>
                <div>
                  <strong>{title}</strong>
                  <p>{detail}</p>
                </div>
                <span>{status}</span>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="配送 / 自提说明" description="按市场规则展示，当前不改变履约配置">
          <div className="delivery-note-list">
            {deliveryNotes.map(([title, detail]) => (
              <article className="delivery-note-item" key={title}>
                <strong>{title}</strong>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="直播状态" description="保留店铺/档口直播状态，不接真实直播服务">
          <div className="live-status-list">
            {liveDecorationStatus.map(([title, value, detail]) => (
              <article className="live-status-item" key={title}>
                <span>{title}</span>
                <strong>{value}</strong>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </Panel>

        <section className="readonly-state">
          <strong>预览校验清单</strong>
          <ul className="preview-checklist">
            {decorationPreviewChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </aside>
    </section>
  );
}

function MobileListingSkeleton() {
  return (
    <section className="listing-workspace" aria-label="手机快速上架骨架">
      <div className="phone-preview" aria-label="手机端快速上架预览">
        <div className="phone-topbar">
          <span>手机快速上架</span>
          <strong>草稿模式</strong>
        </div>
        <div className="photo-grid">
          {photoPlaceholders.map((label) => (
            <button className="photo-tile" disabled key={label} type="button">
              <span>+</span>
              {label}
            </button>
          ))}
        </div>
        <div className="mobile-form">
          {fastListingFields.map(([label, placeholder]) => (
            <label className="mobile-field" key={label}>
              <span>{label}</span>
              <input placeholder={placeholder} type="text" />
            </label>
          ))}
        </div>
        <div className="unit-preview">
          <div className="unit-preview-header">
            <strong>单位拆分预览</strong>
            <span>只读 mock</span>
          </div>
          {quickSpecFields.map(([label, value, detail]) => (
            <div className="unit-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{detail}</p>
            </div>
          ))}
        </div>
        <div className="sticky-submit">
          <button className="ghost-button" disabled type="button">
            保存草稿占位
          </button>
          <button className="primary-button" disabled type="button">
            查看发布占位
          </button>
        </div>
      </div>

      <div className="listing-side">
        <Panel
          description="商家手机端只放高频动作，电脑端完整商品编辑后续仍保留。"
          title="简化步骤"
        >
          <ol className="step-list">
            <li>选择常用品类或常卖模板</li>
            <li>补商品图、规格、今日价和库存</li>
            <li>选择自提或同城配送；供应商接单需平台另行开通角色</li>
            <li>商家确认后才允许进入后续真实发布任务</li>
          </ol>
        </Panel>

        <Panel
          description="规格由后台模板驱动，价格和库存只是模板里的独立字段。"
          title="常用规格模板"
        >
          <div className="spec-template-list">
            {productSpecTemplates.map(([title, fields, example]) => (
              <article className="spec-template-card" key={title}>
                <div>
                  <strong>{title}</strong>
                  <span>{fields}</span>
                </div>
                <p>{example}</p>
              </article>
            ))}
          </div>
        </Panel>

        <div className="category-grid">
          {fastListingCategories.map(([title, examples, detail]) => (
            <article className="category-card" key={title}>
              <strong>{title}</strong>
              <span>{examples}</span>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiListingDraftSkeleton() {
  return (
    <section className="listing-workspace" aria-label="AI 一句话上架草稿骨架">
      <div className="ai-input-panel">
        <div className="ai-panel-header">
          <div>
            <p className="eyebrow">AI 草稿 · 不自动发布</p>
            <h2>一句话生成上架草稿</h2>
          </div>
          <span>Mock</span>
        </div>
        <label className="ai-prompt-box">
          <span>商家输入</span>
          <textarea
            defaultValue="今天梭子蟹公母混装，3到5两一只，68到82一斤，1斤起，剩36筐，建议自提。"
            rows={5}
          />
        </label>
        <div className="ai-actions">
          <button className="ghost-button" disabled type="button">
            从微信导入占位
          </button>
          <button className="primary-button" disabled type="button">
            生成草稿占位
          </button>
        </div>
        <div className="readonly-state">
          <strong>安全边界</strong>
          <p>
            当前不会调用真实 AI、微信、IM、图片识别、库存、订单或发布接口；生成内容只能作为商家确认前的草稿预览。
          </p>
        </div>
      </div>

      <div className="draft-preview-panel">
        <div className="panel-header">
          <div>
            <h2>草稿预览</h2>
            <p>示例字段用于后续 API 契约讨论，不写入真实商品。</p>
          </div>
        </div>
        <div className="draft-grid">
          {aiDraftPreview.map(([label, value]) => (
            <div className="draft-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="structured-draft">
          <div className="structured-draft-header">
            <strong>结构化字段预览</strong>
            <span>后端字段契约占位</span>
          </div>
          <div className="structured-draft-grid">
            {aiStructuredDraftRows.map(([label, value]) => (
              <div className="structured-draft-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="confirm-box">
          <label>
            <input disabled type="checkbox" />
            <span>商家已核对商品、价格、库存、图片和履约方式</span>
          </label>
          <button className="primary-button" disabled type="button">
            商家确认后发布占位
          </button>
        </div>
        <div className="draft-warning-list">
          {aiDraftWarnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
        <div className="channel-grid">
          {aiChannelHints.map(([title, detail]) => (
            <article className="channel-card" key={title}>
              <strong>{title}</strong>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className={`metric-card tone-${metric.tone}`}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      <p>{metric.helper}</p>
    </article>
  );
}

function Panel({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function CompactList({
  items,
  onNavigate,
}: {
  items: ListItem[];
  onNavigate: (page: PageId) => void;
}) {
  return (
    <div className="task-list">
      {items.map((item) => (
        <div className="task-row" key={item.title}>
          <div>
            <span className={`status-dot tone-${item.tone ?? "slate"}`}>
              {item.meta}
            </span>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
          </div>
          {item.target ? (
            <button
              className="table-action"
              onClick={() => onNavigate(item.target!)}
              type="button"
            >
              进入
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">空</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="ghost-button" disabled type="button">
        清空筛选占位
      </button>
    </div>
  );
}

export default App;
