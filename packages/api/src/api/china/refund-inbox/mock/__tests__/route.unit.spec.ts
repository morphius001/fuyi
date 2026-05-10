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
      throw new Error("refund inbox disabled route must not read body");
    }),
    body: {
      rawProviderPayload: "must-not-be-read",
      providerRefundRequest: "must-not-be-read",
      workflowCommand: "must-not-be-read",
    },
    headers: {
      "x-mock-refund-signature": "mock_signature_should_not_leak",
    },
  }) as unknown as MedusaRequest & { text: jest.Mock };

const expectSafeDisabledResponse = (body: unknown) => {
  const serialized = JSON.stringify(body);

  expect(serialized).not.toContain("must-not-be-read");
  expect(serialized).not.toContain("mock_signature_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("workflowCommand");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlement_adjusted");
  expect(serialized).not.toContain("commission_adjusted");
  expect(serialized).not.toContain("payout_adjusted");
  expect(serialized).not.toContain("DATABASE_URL");
  expect(serialized).not.toContain("postgres://");
  expect(serialized).not.toContain("refund.succeeded");
  expect(serialized).not.toContain("accepted");
  expect(serialized).not.toContain("duplicate");
};

describe("refund inbox mock disabled route", () => {
  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("returns disabled by default without reading request body", async () => {
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      provider: "mock_china_pay",
      runtime: "disabled",
      runtimeMutationBlocked: true,
      reason: "Refund inbox route is disabled.",
      runtimeRequested: false,
    });
    expect(req.text).not.toHaveBeenCalled();
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });

  it("stays disabled when mock local inbox env is requested", async () => {
    process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED = "true";
    process.env.CHINA_REFUND_INBOX_ROUTE_MODE = "mock_local_inbox_only";
    process.env.CHINA_REFUND_INBOX_PROVIDER = "mock_china_pay";
    process.env.CHINA_REFUND_INBOX_MOCK_SECRET = "refund_secret_should_not_leak";
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      provider: "mock_china_pay",
      runtime: "disabled",
      runtimeMutationBlocked: true,
      reason: "Refund inbox route is disabled.",
      runtimeRequested: true,
    });
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "refund_secret_should_not_leak",
    );
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });

  it("blocks production even when mock local inbox env is requested", async () => {
    process.env.NODE_ENV = "production";
    process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED = "true";
    process.env.CHINA_REFUND_INBOX_ROUTE_MODE = "mock_local_inbox_only";
    process.env.CHINA_REFUND_INBOX_MOCK_SECRET = "refund_secret_should_not_leak";
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      provider: "mock_china_pay",
      runtime: "production_blocked",
      runtimeMutationBlocked: true,
      reason: "Refund inbox route is blocked in production.",
      runtimeRequested: true,
    });
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "refund_secret_should_not_leak",
    );
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });

  it("returns method not allowed for GET without reading request body", async () => {
    const req = makeRequest();
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      runtime: "method_not_allowed",
      runtimeMutationBlocked: true,
      allowedMethods: ["POST"],
    });
    expect(req.text).not.toHaveBeenCalled();
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });
});
