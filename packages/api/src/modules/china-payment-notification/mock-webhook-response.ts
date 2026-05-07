export type MockPaymentWebhookResponseStatus =
  | "disabled"
  | "accepted"
  | "duplicate"
  | "rejected";

export type MockPaymentWebhookRejectedCode =
  | "RUNTIME_DISABLED"
  | "SIGNATURE_INVALID"
  | "SIGNATURE_MISSING"
  | "PAYLOAD_INVALID"
  | "CURRENCY_UNSUPPORTED"
  | "EVENT_TYPE_UNSUPPORTED";

export type MockPaymentWebhookResponseDecision =
  | {
      status: "disabled";
      code?: "RUNTIME_DISABLED";
    }
  | {
      status: "accepted";
    }
  | {
      status: "duplicate";
    }
  | {
      status: "rejected";
      code: MockPaymentWebhookRejectedCode;
    };

export type MockPaymentWebhookResponse = {
  httpStatus: 200 | 202 | 400 | 503;
  body: {
    status: MockPaymentWebhookResponseStatus;
    mode?: "mock_inbox_only";
    code?: MockPaymentWebhookRejectedCode;
  };
};

export const mapMockPaymentWebhookResponse = (
  decision: MockPaymentWebhookResponseDecision,
): MockPaymentWebhookResponse => {
  if (decision.status === "disabled") {
    return {
      httpStatus: 503,
      body: {
        status: "disabled",
        code: decision.code ?? "RUNTIME_DISABLED",
      },
    };
  }

  if (decision.status === "accepted") {
    return {
      httpStatus: 202,
      body: {
        status: "accepted",
        mode: "mock_inbox_only",
      },
    };
  }

  if (decision.status === "duplicate") {
    return {
      httpStatus: 200,
      body: {
        status: "duplicate",
        mode: "mock_inbox_only",
      },
    };
  }

  return {
    httpStatus: 400,
    body: {
      status: "rejected",
      code: decision.code,
    },
  };
};
