import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

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
      providerRefundQuery: "must-not-be-read",
    },
    headers: {
      sign: "sign_should_not_leak",
    },
  }) as unknown as MedusaRequest & { text: jest.Mock };

const enableLocalAlipay = () => {
  process.env.NODE_ENV = "development";
  process.env.CHINA_REFUND_RUNTIME_ENABLED = "true";
  process.env.CHINA_REFUND_NOTIFY_ROUTE_ENABLED = "true";
  process.env.CHINA_REFUND_STATE_MUTATION_ENABLED = "false";
  process.env.CHINA_REFUND_PROVIDER = "alipay";
  process.env.CHINA_REFUND_ROUTE_MODE = "provider_inbox_only";
  process.env.CHINA_REFUND_TARGET_ENV = "local";
  process.env.CHINA_REFUND_INBOX_LOCAL_INMEMORY = "true";
};

const expectSafeBody = (body: unknown) => {
  const serialized = JSON.stringify(body);

  expect(serialized).not.toContain("must-not-be-read");
  expect(serialized).not.toContain("sign_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowCommand");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("settlement");
  expect(serialized).not.toContain("commission");
  expect(serialized).not.toContain("payout");
  expect(serialized).not.toContain("fulfillment");
  expect(serialized).not.toContain("logistics");
  expect(serialized).not.toContain("refundSuccessState\":true");
};

describe("Alipay refund provider inbox route disabled skeleton", () => {
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
      provider: "alipay",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("stays disabled even when local shadow flags are enabled", async () => {
    enableLocalAlipay();
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "alipay",
      code: "REFUND_PROVIDER_ROUTE_DISABLED",
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
      provider: "alipay",
      runtime: "method_not_allowed",
      allowedMethods: ["POST"],
    });
  });
});
