import { mapMockPaymentWebhookResponse } from "..";

describe("mapMockPaymentWebhookResponse", () => {
  it("maps disabled runtime to safe disabled responses", () => {
    expect(mapMockPaymentWebhookResponse({ status: "disabled" })).toEqual({
      httpStatus: 503,
      body: {
        status: "disabled",
        code: "RUNTIME_DISABLED",
      },
    });
  });

  it("maps accepted notifications to 202 inbox-only responses", () => {
    expect(mapMockPaymentWebhookResponse({ status: "accepted" })).toEqual({
      httpStatus: 202,
      body: {
        status: "accepted",
        mode: "mock_inbox_only",
      },
    });
  });

  it("maps duplicate notifications to 200 duplicate responses", () => {
    expect(mapMockPaymentWebhookResponse({ status: "duplicate" })).toEqual({
      httpStatus: 200,
      body: {
        status: "duplicate",
        mode: "mock_inbox_only",
      },
    });
  });

  it("maps rejected notifications to 400 responses with safe codes", () => {
    expect(
      mapMockPaymentWebhookResponse({
        status: "rejected",
        code: "SIGNATURE_INVALID",
      }),
    ).toEqual({
      httpStatus: 400,
      body: {
        status: "rejected",
        code: "SIGNATURE_INVALID",
      },
    });
  });

  it("maps retryable inbox failures to 503 rejected responses", () => {
    expect(
      mapMockPaymentWebhookResponse({
        status: "rejected",
        code: "INBOX_RETRYABLE",
      }),
    ).toEqual({
      httpStatus: 503,
      body: {
        status: "rejected",
        code: "INBOX_RETRYABLE",
      },
    });
  });

  it("does not include raw provider payload or secrets", () => {
    const response = mapMockPaymentWebhookResponse({
      status: "rejected",
      code: "PAYLOAD_INVALID",
    });

    expect(response.body).not.toHaveProperty("rawPayload");
    expect(response.body).not.toHaveProperty("signature");
    expect(response.body).not.toHaveProperty("secret");
    expect(response.body).not.toHaveProperty("openid");
    expect(response.body).not.toHaveProperty("unionid");
  });
});
