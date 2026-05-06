export const marketHeroImage = "/images/local-market/seafood-market-hero.png"

export const markets = [
  "三门海鲜市场",
  "舟山沈家门市场",
  "宁波路林水产市场",
  "温岭松门水产市场",
]

export type MarketSwitch = {
  name: string
  area: string
  open: string
  delivery: string
  fresh: string
}

export const marketSwitches: MarketSwitch[] = [
  {
    name: "三门海鲜市场",
    area: "台州 / 海鲜",
    open: "06:30-18:30",
    delivery: "5公里同城",
    fresh: "68款",
  },
  {
    name: "舟山沈家门市场",
    area: "舟山 / 干鲜",
    open: "05:30-17:30",
    delivery: "冷链次日",
    fresh: "42款",
  },
  {
    name: "宁波路林水产市场",
    area: "宁波 / 配菜",
    open: "06:00-19:00",
    delivery: "城区配送",
    fresh: "36款",
  },
]

export const hotSearches = [
  "梭子蟹",
  "冰鲜黄鱼",
  "花蛤",
  "三门档口",
  "活虾现货",
  "今日到货",
]

export type MarketCategory = {
  name: string
  desc: string
  count: string
}

export const marketCategories: MarketCategory[] = [
  {
    name: "鲜活水产",
    desc: "鱼虾蟹贝",
    count: "48款",
  },
  {
    name: "冰鲜冻品",
    desc: "带鱼黄鱼冻虾",
    count: "36款",
  },
  {
    name: "海产干货",
    desc: "虾皮淡菜鱼干",
    count: "22款",
  },
  {
    name: "水果蔬菜",
    desc: "本地时令配菜",
    count: "18款",
  },
  {
    name: "今日到货",
    desc: "新到鲜货清单",
    count: "128款",
  },
]

export const quickNeeds = [
  "家庭晚餐 3-5人",
  "海鲜礼盒搭配",
  "明早市场自提",
  "同城冷链配送",
]

export const portalStats = [
  ["34家", "认证档口"],
  ["128款", "今日鲜货"],
  ["4类", "市场鲜货"],
] as const

export const notices = [
  "三门海鲜市场 06:30 开市，鲜活区上午补货",
  "今日冷链配送时段：10:00 / 15:00",
  "台州城区自提预约时段持续开放",
]

export type MarketTool = {
  title: string
  text: string
}

export const tools: MarketTool[] = [
  {
    title: "买家服务",
    text: "售前咨询、售后规则和订单帮助",
  },
  {
    title: "档口认证",
    text: "查看主体、档口号、经营类目与营业状态",
  },
  {
    title: "售后规则",
    text: "坏损、少件、错发处理说明",
  },
]

export type Stall = {
  handle: string
  name: string
  market: string
  booth: string
  categories: string
  status: string
  fulfillment: string
  score: string
  badge: string
  supply: string
  repeatRate: string
  verification: string
  live: boolean
}

export const stalls: Stall[] = [
  {
    handle: "a-hai-xian-huo-dang",
    name: "阿海鲜活档",
    market: "三门海鲜市场",
    booth: "A区 18号",
    categories: "梭子蟹、皮皮虾、蛏子",
    status: "营业中",
    fulfillment: "市场自提 / 5公里配送",
    score: "4.9",
    badge: "市场认证档口",
    supply: "今日上新 18款",
    repeatRate: "近7日回头客 42%",
    verification: "营业执照 / 档口号已展示",
    live: true,
  },
  {
    handle: "wan-kou-bing-xian-hang",
    name: "湾口冰鲜行",
    market: "三门海鲜市场",
    booth: "B区 06号",
    categories: "带鱼、鲳鱼、黄鱼",
    status: "接单中",
    fulfillment: "冷链配送 / 次日达",
    score: "4.8",
    badge: "检测报告展示",
    supply: "冰鲜现货 26款",
    repeatRate: "冷链准时率 96%",
    verification: "检测报告 / 冷库资质展示",
    live: false,
  },
  {
    handle: "hai-wei-gan-huo-pu",
    name: "海味干货铺",
    market: "舟山沈家门市场",
    booth: "干货区 12号",
    categories: "虾皮、淡菜干、鱼干",
    status: "可预订",
    fulfillment: "快递配送 / 门店自提",
    score: "4.7",
    badge: "食品经营许可展示",
    supply: "干货现货 15款",
    repeatRate: "复购榜单稳定",
    verification: "食品经营许可展示",
    live: false,
  },
  {
    handle: "lao-lin-ben-di-cai-tan",
    name: "老林本地菜摊",
    market: "宁波路林水产市场",
    booth: "配菜区 03号",
    categories: "生姜、葱蒜、时令蔬菜",
    status: "营业中",
    fulfillment: "市场自提 / 同城配送",
    score: "4.6",
    badge: "档口认证展示",
    supply: "配菜现货 12款",
    repeatRate: "本地配送覆盖",
    verification: "摊位信息 / 联系方式展示",
    live: false,
  },
]

export type FreshProduct = {
  handle: string
  name: string
  spec: string
  price: string
  tag: string
  stock: string
  seller: string
  delivery: string
  market: string
  freshness: string
}

export const freshProducts: FreshProduct[] = [
  {
    handle: "xian-huo-suo-zi-xie",
    name: "鲜活梭子蟹",
    spec: "公母混装 · 3-5两/只 · 1斤起",
    price: "¥68.00/斤",
    tag: "鲜活",
    stock: "今日到货 36筐",
    seller: "阿海鲜活档",
    delivery: "自提最快30分钟",
    market: "三门海鲜市场",
    freshness: "鲜活暂养",
  },
  {
    handle: "dong-hai-xiao-huang-yu",
    name: "东海小黄鱼",
    spec: "冰鲜统货 · 8-10条/斤 · 2斤起",
    price: "¥39.80/斤",
    tag: "冰鲜",
    stock: "上午新到",
    seller: "湾口冰鲜行",
    delivery: "冷链配送",
    market: "三门海鲜市场",
    freshness: "冰鲜当日分拣",
  },
  {
    handle: "hua-ge-jing-yang-zhuang",
    name: "花蛤净养装",
    spec: "净养吐沙 · 2斤/袋 · 1袋起",
    price: "¥22.90/份",
    tag: "鲜活",
    stock: "库存紧张",
    seller: "阿海鲜活档",
    delivery: "市场自提 / 本地配送",
    market: "三门海鲜市场",
    freshness: "净养吐沙",
  },
  {
    handle: "dan-cai-gan-li-dai",
    name: "淡菜干礼袋",
    spec: "海产干货 · 250g/袋 · 2袋起",
    price: "¥45.00/袋",
    tag: "干货",
    stock: "现货",
    seller: "海味干货铺",
    delivery: "快递配送",
    market: "舟山沈家门市场",
    freshness: "常温干货",
  },
  {
    handle: "huo-ming-xia",
    name: "活明虾",
    spec: "鲜活统货 · 20-25只/斤 · 1斤起",
    price: "¥58.00/斤",
    tag: "鲜活",
    stock: "午市补货",
    seller: "阿海鲜活档",
    delivery: "同城配送",
    market: "三门海鲜市场",
    freshness: "鲜活暂养",
  },
  {
    handle: "leng-dong-xia-ren",
    name: "冷冻虾仁",
    spec: "冷冻分装 · 500g/袋 · 1袋起",
    price: "¥49.90/袋",
    tag: "冷冻",
    stock: "冷库现货",
    seller: "湾口冰鲜行",
    delivery: "冷链配送",
    market: "三门海鲜市场",
    freshness: "冷冻锁鲜",
  },
]

export const sellerHandlesByName = Object.fromEntries(
  stalls.map((stall) => [stall.name, stall.handle])
) as Record<string, string>

export const getFreshProductByHandle = (handle: string) =>
  freshProducts.find((product) => product.handle === handle)

export const priceBoard = [
  ["梭子蟹", "¥68-82/斤", "鲜活", "三门 A区"],
  ["东海小黄鱼", "¥36-42/斤", "冰鲜", "三门 B区"],
  ["花蛤", "¥10-13/斤", "净养", "鲜活区"],
  ["明虾", "¥58-66/斤", "活鲜", "A区 18号"],
  ["淡菜干", "¥42-48/袋", "干货", "沈家门"],
] as const

export type FindingRoute = {
  title: string
  text: string
  href: string
}

export const findingRoutes: FindingRoute[] = [
  {
    title: "市场频道",
    text: "营业时间、服务范围、市场公告",
    href: "categories",
  },
  {
    title: "档口频道",
    text: "档口号、主营、认证和评分",
    href: "categories",
  },
  {
    title: "今日鲜货",
    text: "今日价、库存、鲜度和履约",
    href: "search",
  },
  {
    title: "资质说明",
    text: "主体、档口号、经营类目",
    href: "categories",
  },
]

export const guarantees = [
  ["市场认证", "市场主体、经营场所和档口信息"],
  ["档口认证", "档口号、主营类目、营业状态"],
  ["检测报告", "食品经营许可、检测报告展示"],
  ["售后保障", "坏损、少件、错发处理说明"],
] as const

export const productTagStyles: Record<string, string> = {
  鲜活: "bg-[#E6F7F2] text-[#0F8F6B]",
  冰鲜: "bg-[#EFF6FF] text-[#1D4ED8]",
  冷冻: "bg-[#EFF6FF] text-[#1D4ED8]",
  干货: "bg-[#FEF3C7] text-[#B45309]",
}
