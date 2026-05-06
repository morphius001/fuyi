import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink";
import footerLinks from "@/data/footerLinks";

export function Footer() {
  return (
    <footer className="hidden border-t border-[#E5E7EB] bg-white lg:block" data-testid="footer">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-8 lg:px-8 2xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div>
            <LocalizedClientLink
              href="/"
              className="text-2xl font-bold tracking-normal text-primary"
              aria-label="Fuyi 首页"
            >
              Fuyi
            </LocalizedClientLink>
            <p className="mt-3 max-w-[320px] text-sm leading-6 text-secondary">
              本地海鲜生鲜市场平台示例，面向消费者展示市场、档口、今日鲜货和履约说明。
            </p>
            <p className="mt-3 text-sm text-secondary">
              默认地区：台州城区
            </p>
          </div>

          <div data-testid="footer-customer-services">
            <h2 className="label-lg mb-3 text-primary">客户服务</h2>
            <nav className="space-y-2" aria-label="客户服务导航">
              {footerLinks.customerServices.map(({ label, path }) => (
                <LocalizedClientLink
                  key={label}
                  href={path}
                  className="block text-sm text-secondary hover:text-[#155EEF]"
                  data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {label}
                </LocalizedClientLink>
              ))}
            </nav>
          </div>

          <div data-testid="footer-about">
            <h2 className="label-lg mb-3 text-primary">关于 Fuyi</h2>
            <nav className="space-y-2" aria-label="关于 Fuyi 导航">
              {footerLinks.about.map(({ label, path }) => (
                <LocalizedClientLink
                  key={label}
                  href={path}
                  className="block text-sm text-secondary hover:text-[#155EEF]"
                  data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {label}
                </LocalizedClientLink>
              ))}
            </nav>
          </div>

          <div data-testid="footer-connect">
            <h2 className="label-lg mb-3 text-primary">联系与关注</h2>
            <nav className="space-y-2" aria-label="联系与关注导航">
              {footerLinks.connect.map(({ label, path }) => (
                <a
                  aria-label={`访问 ${label}`}
                  title={`访问 ${label}`}
                  key={label}
                  href={path}
                  className="block text-sm text-secondary hover:text-[#155EEF]"
                  target={path.startsWith("http") ? "_blank" : undefined}
                  rel={
                    path.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                  data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-[#E5E7EB] pt-5" data-testid="footer-copyright">
          <div className="space-y-2 text-center text-sm text-secondary">
            <p>© 2026 Fuyi 示例公司 版权所有</p>
            <p>公司名称、统一社会信用代码、营业执照信息占位</p>
            <p>ICP备案号占位：京ICP备00000000号-1</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
