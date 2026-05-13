# Learned Rules

- 本项目后续必须先跑通真实数据链路，再继续做可替换 UI 模板。
- 静态展示页面不能直接出现假数量、假金额、假购物车、假结算入口。
- 提货卡是消费者持卡提货凭证，不是用来购买商品的支付方式、储值卡、优惠券、满减券或折扣券。
- 市场统一配送是平台/市场能力，商家可选择是否加入；商家也可以自行配送。
- 物料供应商、配送供应商、养殖户、种植户、外地批发商、种苗供应商需要独立角色边界，不能混成普通商户默认能力。
- 手机端快速上架只保留高频字段；AI 一句话上架只能生成草稿，必须商家确认后才能进入真实发布任务。
- 后续如果出现 Next dev `__webpack_modules__[moduleId] is not a function`，优先只重启对应前端 dev server，不要乱改业务代码。
- PowerShell 调 WSL 时避免复杂 `$()` 和 here-string；必要时用简单命令或先重启服务脚本。
- Windows 浏览器访问 WSL 服务时，Admin/Vendor 的本地 API 地址优先用 `http://localhost:9000`；如果用 `http://127.0.0.1:9000` 出现 `Failed to fetch`，先检查 WSL NAT/localhost 转发，不要改登录业务代码。
- WSL 无头浏览器截图中文变方块时，先检查并安装 CJK 字体，例如 `fonts-noto-cjk`，不要误判为前端乱码。
- payment notification 的 local DB route 必须先做 preflight / disposable DB 白名单校验，再读取 raw body 或解析 payload。
- payment notification 的 `mock_prepare_command` 路径必须先经过 disabled runtime adapter，不能把 command DTO 直接视为可执行 workflow。
- payment session 与 order 的 seller / market ownership 必须在 payment state guard 层先对齐，不能等到更后面的 workflow 或 refund 阶段再补救。
- isolated preprod review query surface 应以 terminal conflict snapshot 为聚合入口；approval / audit / runtime attempt 任一 cross-reference 缺失时必须 fail-closed。
