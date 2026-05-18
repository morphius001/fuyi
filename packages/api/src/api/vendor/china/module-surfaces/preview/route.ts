import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { resolveChinaVendorUnitModuleAccessForRoute } from "../../unit-permissions/guard";

const readQueryString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const moduleSurfacePreviewByKey: Record<
  string,
  {
    title: string;
    cards: Array<{
      label: string;
      value: string;
      note: string;
    }>;
  }
> = {
  aiQuickListing: {
    title: "AI 草稿上架预览",
    cards: [
      {
        label: "草稿生成",
        value: "仅预览",
        note: "AI 只生成待确认草稿，不自动发布真实商品。",
      },
      {
        label: "人工确认",
        value: "必须保留",
        note: "后续正式上架仍需商户确认，不绕过商品审核或库存规则。",
      },
    ],
  },
  deliverySuppliers: {
    title: "配送供应商工作台预览",
    cards: [
      {
        label: "服务单",
        value: "只读占位",
        note: "不创建配送服务单，不派单，不改变物流或履约状态。",
      },
      {
        label: "覆盖范围",
        value: "待配置",
        note: "仅展示未来配置入口，不影响 checkout shipping options。",
      },
    ],
  },
  expressPrint: {
    title: "电子面单预览",
    cards: [
      {
        label: "待打印",
        value: "只读 0 单",
        note: "不生成真实运单号，不调用快递或云打印接口。",
      },
      {
        label: "打印模板",
        value: "本地占位",
        note: "仅展示未来打印参数，不改变订单或履约状态。",
      },
    ],
  },
  financeReadOnly: {
    title: "财务结算只读预览",
    cards: [
      {
        label: "账单摘要",
        value: "只读占位",
        note: "不生成结算单，不改佣金，不发起打款。",
      },
      {
        label: "风险边界",
        value: "高风险串行",
        note: "真实结算、佣金、打款和对账必须走独立高风险任务。",
      },
    ],
  },
  frozenGoods: {
    title: "冻品商户经营预览",
    cards: [
      {
        label: "冻品商品",
        value: "只读列表",
        note: "展示冻品经营入口，不创建商品、不改库存、不改价格。",
      },
      {
        label: "冷链提示",
        value: "展示占位",
        note: "不改变履约、配送承诺或结算规则。",
      },
    ],
  },
  fruitsVegetables: {
    title: "果蔬商户经营预览",
    cards: [
      {
        label: "果蔬商品",
        value: "只读列表",
        note: "展示果蔬经营入口，不创建商品、不改库存、不改价格。",
      },
      {
        label: "履约提示",
        value: "展示占位",
        note: "不改变配送承诺、订单履约或结算规则。",
      },
    ],
  },
  livestream: {
    title: "直播工作台预览",
    cards: [
      {
        label: "直播间",
        value: "未接入",
        note: "不接真实推流、IM、支付或推荐位。",
      },
    ],
  },
  marketMaterials: {
    title: "市场物料工作台预览",
    cards: [
      {
        label: "物料采购",
        value: "只读草稿",
        note: "不创建物料订单，不改变库存、应付或结算。",
      },
    ],
  },
  pickupCard: {
    title: "提货卡工作台预览",
    cards: [
      {
        label: "待处理提货",
        value: "只读 0 单",
        note: "不核销提货卡，不改变订单、库存或履约状态。",
      },
      {
        label: "卡券说明",
        value: "凭证展示",
        note: "提货卡是提货凭证，不作为支付、储值或优惠券处理。",
      },
    ],
  },
  remoteWholesalers: {
    title: "外地批发商对接预览",
    cards: [
      {
        label: "批发到货",
        value: "只读计划",
        note: "不创建采购单，不确认到货，不改变应付或库存。",
      },
    ],
  },
  seafoodTrade: {
    title: "海鲜档口经营预览",
    cards: [
      {
        label: "今日鲜货",
        value: "只读入口",
        note: "不发布商品、不改价格、不扣减库存。",
      },
      {
        label: "订单处理",
        value: "查看占位",
        note: "不确认收款、不发货、不触发售后或结算。",
      },
    ],
  },
  seedlingWholesale: {
    title: "种苗批发工作台预览",
    cards: [
      {
        label: "种苗需求",
        value: "只读草稿",
        note: "不创建采购需求，不确认报价，不改变合作关系。",
      },
    ],
  },
  storeDecoration: {
    title: "店铺装修工作台预览",
    cards: [
      {
        label: "档口主页",
        value: "只读预览",
        note: "不上传图片，不发布公告，不改变消费者端店铺展示。",
      },
      {
        label: "资料维护",
        value: "待接入",
        note: "仅显示未来配置入口，不改变商户资质、账号或 RBAC 权限。",
      },
    ],
  },
  upstreamSupply: {
    title: "上游货源对接预览",
    cards: [
      {
        label: "采购需求",
        value: "只读占位",
        note: "不发布真实找货需求，不生成采购单或应付记录。",
      },
      {
        label: "报价对接",
        value: "待接入",
        note: "不确认供应商报价，不建立真实合作关系。",
      },
    ],
  },
};

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const moduleKey = readQueryString(req.query.module_key);

  if (!moduleKey) {
    return res.status(400).json({
      error: "module_key is required.",
    });
  }

  const unitPermissionAccess = await resolveChinaVendorUnitModuleAccessForRoute(
    {
      moduleKey,
      req,
    },
  );

  if (!unitPermissionAccess.allowed) {
    return res.status(unitPermissionAccess.statusCode).json({
      unitPermissionAccess,
    });
  }

  const preview = moduleSurfacePreviewByKey[moduleKey] ?? {
    title: "模块工作台预览",
    cards: [
      {
        label: "状态",
        value: "只读占位",
        note: "仅展示模块入口，不执行真实业务动作。",
      },
    ],
  };

  return res.json({
    unitPermissionAccess,
    moduleSurface: {
      mode: "vendor_china_module_surface_preview",
      moduleKey,
      title: preview.title,
      cards: preview.cards,
      runtimeEnabled: false,
      note: "This preview is read-only. It does not create orders, print waybills, start live streaming, mutate fulfillment, change settlement, or grant RBAC permissions.",
    },
  });
}
