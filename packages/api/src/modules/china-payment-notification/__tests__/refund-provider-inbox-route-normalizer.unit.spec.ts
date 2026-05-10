import {
  alipayRefundQueryRequiredNotifyVector,
  alipayRefundSuccessNotifyVector,
  alipayRefundTradeOnlyNotifyVector,
} from "../alipay-refund-notification-test-vectors";
import { verifyAlipayRefundNotificationContract } from "../alipay-refund-notification-verifier";
import {
  normalizeAlipayRefundProviderInboxRouteResult,
  normalizeWechatRefundProviderInboxRouteResult,
} from "../refund-provider-inbox-route-normalizer";
import {
  wechatPayRefundAbnormalNotifyVector,
  wechatPayRefundSuccessNotifyVector,
} from "../wechat-pay-refund-notification-test-vectors";
import { verifyWechatPayRefundNotificationContract } from "../wechat-pay-refund-notification-verifier";

describe("refund provider inbox route normalizer", () => {
  it("maps WeChat refund success to accepted inbox-only envelope", () => {
    const result = verifyWechatPayRefundNotificationContract({
      rawNotification: wechatPayRefundSuccessNotifyVector.rawNotification,
      currentUnixSeconds: 1770000000,
      trustedPlatformCertificates: [
        {
          serial: "serial_fake_wechat_refund_001",
          publicKeyRef: "fixture_only_public_key",
        },
      ],
      expectedSignature: wechatPayRefundSuccessNotifyVector.expectedSignature,
      expectedCiphertext: wechatPayRefundSuccessNotifyVector.expectedCiphertext,
      decryptedResource: wechatPayRefundSuccessNotifyVector.decryptedResource,
      expectedMchId: "mch_fake_refund_001",
      expectedAppId: "wx_fake_refund_app",
      expectedOutTradeNo: "pay_wechat_refund_order_001",
      expectedOutRefundNo: "refund_req_wechat_001",
      expectedAmountValue: 128560,
      expectedCurrency: "CNY",
    });

    expect(normalizeWechatRefundProviderInboxRouteResult(result)).toMatchObject({
      status: "accepted",
      envelope: {
        provider: "wechat_pay",
        eventType: "refund.succeeded",
        idempotencyKey: wechatPayRefundSuccessNotifyVector.expectedIdempotencyKey,
      },
      fixtureOnly: true,
      executable: false,
    });
  });

  it("maps WeChat abnormal refund to manual review and not success", () => {
    const result = verifyWechatPayRefundNotificationContract({
      rawNotification: wechatPayRefundAbnormalNotifyVector.rawNotification,
      currentUnixSeconds: 1770000000,
      trustedPlatformCertificates: [
        {
          serial: "serial_fake_wechat_refund_001",
          publicKeyRef: "fixture_only_public_key",
        },
      ],
      expectedSignature: wechatPayRefundAbnormalNotifyVector.expectedSignature,
      expectedCiphertext: wechatPayRefundAbnormalNotifyVector.expectedCiphertext,
      decryptedResource: wechatPayRefundAbnormalNotifyVector.decryptedResource,
      expectedMchId: "mch_fake_refund_001",
      expectedAppId: "wx_fake_refund_app",
      expectedOutTradeNo: "pay_wechat_refund_order_001",
      expectedOutRefundNo: "refund_req_wechat_001",
      expectedAmountValue: 128560,
      expectedCurrency: "CNY",
    });

    expect(normalizeWechatRefundProviderInboxRouteResult(result)).toMatchObject({
      status: "manual_review",
      envelope: {
        provider: "wechat_pay",
        eventType: "refund.failed",
      },
      fixtureOnly: true,
      executable: false,
    });
  });

  it("maps Alipay refund notify to accepted inbox-only envelope", () => {
    const result = verifyAlipayRefundNotificationContract({
      rawNotification: alipayRefundSuccessNotifyVector.rawNotification,
      expectedAppId: "app_fake_refund_001",
      expectedSellerId: "merchant_fake_refund_001",
      expectedOutTradeNo: "pay_alipay_refund_order_001",
      expectedTradeNo: "trade_alipay_refund_001",
      expectedOutRequestNo: "refund_req_alipay_001",
      expectedAmountValue: 128560,
      expectedCurrency: "CNY",
      expectedFakeSignature: alipayRefundSuccessNotifyVector.expectedFakeSignature,
      refundNotifyMode: "product_specific_refund_notify",
    });

    expect(normalizeAlipayRefundProviderInboxRouteResult(result)).toMatchObject({
      status: "accepted",
      envelope: {
        provider: "alipay",
        eventType: "refund.succeeded",
        providerRefundId: "refund_req_alipay_001",
      },
      fixtureOnly: true,
      executable: false,
    });
  });

  it("maps Alipay trade-only and query-required notifications without query API", () => {
    const tradeOnly = verifyAlipayRefundNotificationContract({
      rawNotification: alipayRefundTradeOnlyNotifyVector.rawNotification,
      expectedAppId: "app_fake_refund_001",
      expectedSellerId: "merchant_fake_refund_001",
      expectedOutTradeNo: "pay_alipay_refund_order_001",
      expectedTradeNo: "trade_alipay_refund_001",
      expectedCurrency: "CNY",
      expectedFakeSignature: alipayRefundTradeOnlyNotifyVector.expectedFakeSignature,
      refundNotifyMode: "trade_async_notify",
    });
    const queryRequired = verifyAlipayRefundNotificationContract({
      rawNotification: alipayRefundQueryRequiredNotifyVector.rawNotification,
      expectedAppId: "app_fake_refund_001",
      expectedSellerId: "merchant_fake_refund_001",
      expectedOutTradeNo: "pay_alipay_refund_order_001",
      expectedTradeNo: "trade_alipay_refund_001",
      expectedOutRequestNo: "refund_req_alipay_001",
      expectedAmountValue: 128560,
      expectedCurrency: "CNY",
      expectedFakeSignature:
        alipayRefundQueryRequiredNotifyVector.expectedFakeSignature,
      refundNotifyMode: "refund_query_follow_up",
    });

    expect(normalizeAlipayRefundProviderInboxRouteResult(tradeOnly)).toMatchObject({
      status: "processed_for_audit_only",
      fixtureOnly: true,
      executable: false,
    });
    expect(
      normalizeAlipayRefundProviderInboxRouteResult(queryRequired),
    ).toMatchObject({
      status: "query_required",
      fixtureOnly: true,
      executable: false,
    });
  });
});
