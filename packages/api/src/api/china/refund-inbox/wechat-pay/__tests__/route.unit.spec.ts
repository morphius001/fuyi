import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  wechatPayRefundAbnormalNotifyVector,
  wechatPayRefundSuccessNotifyVector,
} from "../../../../../modules/china-payment-notification";
import { GET, POST } from "../route";

const oldEnv = process.env;

const makeResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res as unknown as MedusaResponse & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

const makeRequest = () =>
  ({
    text: jest.fn(async () => {
      throw new Error("provider refund route disabled skeleton must not read body");
    }),
    body: {
      rawProviderPayload: "must-not-be-read",
      workflowCommand: "must-not-be-read",
    },
    headers: {
      "wechatpay-signature": "signature_should_not_leak",
    },
  }) as unknown as MedusaRequest & { text: jest.Mock };

const enableLocalWechat = () => {
  process.env.NODE_ENV = "development";
  process.env.CHINA_REFUND_RUNTIME_ENABLED = "true";
  process.env.CHINA_REFUND_NOTIFY_ROUTE_ENABLED = "true";
  process.env.CHINA_REFUND_STATE_MUTATION_ENABLED = "false";
  process.env.CHINA_REFUND_PROVIDER = "wechat_pay";
  process.env.CHINA_REFUND_ROUTE_MODE = "provider_inbox_only";
  process.env.CHINA_REFUND_TARGET_ENV = "local";
  process.env.CHINA_REFUND_INBOX_LOCAL_INMEMORY = "true";
  process.env.CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_SIGNATURE =
    wechatPayRefundSuccessNotifyVector.expectedSignature;
  process.env.CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_CIPHERTEXT =
    wechatPayRefundSuccessNotifyVector.expectedCiphertext;
  process.env.CHINA_REFUND_WECHAT_FIXTURE_PLATFORM_SERIAL =
    "serial_fake_wechat_refund_001";
  process.env.CHINA_REFUND_WECHAT_FIXTURE_CURRENT_UNIX_SECONDS = "1770000000";
  process.env.CHINA_REFUND_WECHAT_FIXTURE_DECRYPTED_RESOURCE_JSON =
    JSON.stringify(wechatPayRefundSuccessNotifyVector.decryptedResource);
  process.env.CHINA_REFUND_WECHAT_EXPECTED_MCH_ID = "mch_fake_refund_001";
  process.env.CHINA_REFUND_WECHAT_EXPECTED_APP_ID = "wx_fake_refund_app";
  process.env.CHINA_REFUND_WECHAT_EXPECTED_OUT_TRADE_NO =
    "pay_wechat_refund_order_001";
  process.env.CHINA_REFUND_WECHAT_EXPECTED_OUT_REFUND_NO =
    "refund_req_wechat_001";
  process.env.CHINA_REFUND_WECHAT_EXPECTED_AMOUNT_VALUE = "128560";
};

const makeSignedWechatRequest = (
  vector = wechatPayRefundSuccessNotifyVector,
) =>
  ({
    text: jest.fn(async () => vector.rawNotification.rawBody),
    headers: vector.rawNotification.headers,
  }) as unknown as MedusaRequest & { text: jest.Mock };

const expectSafeBody = (body: unknown) => {
  const serialized = JSON.stringify(body);

  expect(serialized).not.toContain("must-not-be-read");
  expect(serialized).not.toContain("signature_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("workflowCommand");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("settlement");
  expect(serialized).not.toContain("commission");
  expect(serialized).not.toContain("payout");
  expect(serialized).not.toContain("fulfillment");
  expect(serialized).not.toContain("logistics");
  expect(serialized).not.toContain("refundSuccessState\":true");
};

describe("WeChat Pay refund provider inbox route disabled skeleton", () => {
  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("returns disabled by default without reading body", async () => {
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "wechat_pay",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("accepts verified local fixture into inbox-only response", async () => {
    enableLocalWechat();
    const req = makeSignedWechatRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(req.text).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "accepted",
      provider: "wechat_pay",
      mode: "provider_inbox_only",
      refundSuccessState: false,
      record: {
        provider: "wechat_pay",
        eventId: wechatPayRefundSuccessNotifyVector.eventId,
        processingStatus: "runtime_mutation_blocked",
      },
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("does not read body when local gate is enabled but fixture config is missing", async () => {
    enableLocalWechat();
    delete process.env.CHINA_REFUND_WECHAT_FIXTURE_DECRYPTED_RESOURCE_JSON;
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "wechat_pay",
      code: "WECHAT_REFUND_FIXTURE_CONFIG_MISSING",
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("returns duplicate for same verified local fixture digest", async () => {
    enableLocalWechat();
    const first = makeSignedWechatRequest();
    const second = makeSignedWechatRequest();
    const firstRes = makeResponse();
    const secondRes = makeResponse();

    await POST(first, firstRes);
    await POST(second, secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(200);
    expect(secondRes.json.mock.calls[0]?.[0]).toMatchObject({
      status: "duplicate",
      provider: "wechat_pay",
      refundSuccessState: false,
    });
    expectSafeBody(secondRes.json.mock.calls[0]?.[0]);
  });

  it("routes WeChat abnormal refund notification to manual review", async () => {
    enableLocalWechat();
    process.env.CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_CIPHERTEXT =
      wechatPayRefundAbnormalNotifyVector.expectedCiphertext;
    process.env.CHINA_REFUND_WECHAT_FIXTURE_DECRYPTED_RESOURCE_JSON =
      JSON.stringify(wechatPayRefundAbnormalNotifyVector.decryptedResource);
    const req = makeSignedWechatRequest(wechatPayRefundAbnormalNotifyVector);
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "manual_review",
      provider: "wechat_pay",
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("returns method not allowed for GET", async () => {
    const res = makeResponse();

    await GET(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "wechat_pay",
      runtime: "method_not_allowed",
      allowedMethods: ["POST"],
    });
  });
});
