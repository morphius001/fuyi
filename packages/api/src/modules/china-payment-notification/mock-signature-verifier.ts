import { createHash, timingSafeEqual } from "crypto";

import {
  ChinaPaymentNotificationSignatureResult,
  VerifyMockPaymentSignatureInput,
} from "./types";

export const buildMockPaymentSignature = (
  rawBody: string,
  secret: string,
): string => {
  const digest = createHash("sha256")
    .update(`${rawBody}.${secret}`)
    .digest("hex");

  return `sha256=${digest}`;
};

export const verifyMockPaymentSignature = ({
  rawBody,
  headers,
  secret,
  receivedAt = new Date().toISOString(),
}: VerifyMockPaymentSignatureInput): ChinaPaymentNotificationSignatureResult => {
  if (!headers.signature) {
    return {
      status: "missing",
      algorithm: "sha256",
      keyId: headers.keyId,
      verifiedAt: receivedAt,
      failureCode: "MOCK_SIGNATURE_MISSING",
      failureMessage: "Mock payment signature header is missing.",
    };
  }

  const expected = buildMockPaymentSignature(rawBody, secret);
  const provided = headers.signature;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  const matches =
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer);

  if (!matches) {
    return {
      status: "invalid",
      algorithm: "sha256",
      keyId: headers.keyId,
      verifiedAt: receivedAt,
      failureCode: "MOCK_SIGNATURE_INVALID",
      failureMessage: "Mock payment signature did not match.",
    };
  }

  return {
    status: "verified",
    algorithm: "sha256",
    keyId: headers.keyId,
    verifiedAt: receivedAt,
  };
};
