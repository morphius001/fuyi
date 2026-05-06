import { ProductPageAccordion } from '@/components/molecules';

export const ProductDetailsShipping = () => {
  return (
    <ProductPageAccordion
      heading="配送与售后"
      defaultOpen={false}
    >
      <div className="product-details">
        <ul>
          <li>市场统一配送是市场能力，商家可自行选择是否加入；最终以结账页档口确认结果为准。</li>
          <li>档口自送、到店自提由商家维护，消费者下单时按档口分别确认。</li>
          <li>活鲜、冰鲜、冷冻商品可能按商家备货时间分批履约，跨档口订单可能分开提货或配送。</li>
          <li>签收时建议当场确认重量、规格和外观；坏损、短斤少两等售后需要保留照片或视频凭证。</li>
          <li>售后申请入口会在订单页展示，处理结果以商家规则和平台审核为准。</li>
        </ul>
      </div>
    </ProductPageAccordion>
  );
};
