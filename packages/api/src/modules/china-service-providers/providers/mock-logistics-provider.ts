import {
  CancelShipmentInput,
  CancelShipmentResult,
  CreateShipmentInput,
  CreateShipmentResult,
  LogisticsProvider,
  TrackingEvent,
  TrackingInput,
} from "../types";
import {
  maskMainlandMobile,
  nowIso,
  providerError,
  stableMockId,
} from "../utils";

type ShipmentRecord = CreateShipmentResult & {
  orderId: string;
  fulfillmentId: string;
  recipientAddressDigest: string;
  maskedMobile: string;
  canceled: boolean;
};

export class MockLogisticsProvider implements LogisticsProvider {
  private readonly shipmentsById = new Map<string, ShipmentRecord>();
  private readonly shipmentsByTrackingNo = new Map<string, ShipmentRecord>();
  private readonly createResultsByIdempotencyKey = new Map<
    string,
    CreateShipmentResult
  >();
  private readonly cancelResultsByIdempotencyKey = new Map<
    string,
    CancelShipmentResult
  >();

  async createShipment(
    input: CreateShipmentInput,
  ): Promise<CreateShipmentResult> {
    const replayed = this.createResultsByIdempotencyKey.get(
      input.idempotencyKey,
    );

    if (replayed) {
      return { ...replayed, replayed: true };
    }

    if (input.simulateFailure) {
      throw providerError(
        "PROVIDER_UNAVAILABLE",
        "Mock logistics provider simulated shipment creation failure.",
        true,
      );
    }

    const shipmentId = stableMockId("mock_ship", [
      input.fulfillmentId,
      input.idempotencyKey,
    ]);
    const trackingNo = stableMockId(input.carrierCode.toLowerCase(), [
      input.orderId,
      input.fulfillmentId,
    ])
      .replace("_", "")
      .slice(0, 18);
    const result: CreateShipmentResult = {
      shipmentId,
      trackingNo,
      carrierCode: input.carrierCode,
      labelObjectKey: `mock-logistics/labels/${shipmentId}.pdf`,
      replayed: false,
    };
    const record: ShipmentRecord = {
      ...result,
      orderId: input.orderId,
      fulfillmentId: input.fulfillmentId,
      recipientAddressDigest: input.recipientAddressDigest,
      maskedMobile: maskMainlandMobile(input.recipientMobile),
      canceled: false,
    };

    this.shipmentsById.set(shipmentId, record);
    this.shipmentsByTrackingNo.set(trackingNo, record);
    this.createResultsByIdempotencyKey.set(input.idempotencyKey, result);

    return result;
  }

  async getTracking(
    input: TrackingInput,
  ): Promise<{ events: TrackingEvent[] }> {
    const shipment = this.shipmentsByTrackingNo.get(input.trackingNo);

    if (!shipment) {
      throw providerError(
        "NOT_FOUND",
        "Mock shipment tracking number does not exist.",
        false,
        {
          trackingNo: input.trackingNo,
        },
      );
    }

    if (shipment.canceled) {
      return {
        events: [
          {
            status: "canceled",
            occurredAt: nowIso(),
            description: "Shipment canceled in mock logistics provider.",
          },
        ],
      };
    }

    return {
      events: [
        {
          status: "created",
          occurredAt: nowIso(),
          description: `${shipment.carrierCode} mock shipment created.`,
        },
        {
          status: "picked_up",
          occurredAt: nowIso(),
          description: "Package picked up by mock carrier.",
        },
        {
          status: "in_transit",
          occurredAt: nowIso(),
          description: "Package is in transit through mock sorting center.",
        },
        {
          status: "delivered",
          occurredAt: nowIso(),
          description: "Package delivered by mock carrier.",
          proofObjectKey: `mock-logistics/proofs/${shipment.shipmentId}.jpg`,
        },
      ],
    };
  }

  async cancelShipment(
    input: CancelShipmentInput,
  ): Promise<CancelShipmentResult> {
    const replayed = this.cancelResultsByIdempotencyKey.get(
      input.idempotencyKey,
    );

    if (replayed) {
      return { ...replayed, replayed: true };
    }

    const shipment = this.shipmentsById.get(input.shipmentId);

    if (!shipment) {
      throw providerError("NOT_FOUND", "Mock shipment does not exist.", false, {
        shipmentId: input.shipmentId,
      });
    }

    if (shipment.canceled) {
      const result: CancelShipmentResult = {
        canceled: false,
        replayed: false,
        reason: providerError(
          "CANCELED",
          "Mock shipment was already canceled.",
          false,
        ),
      };
      this.cancelResultsByIdempotencyKey.set(input.idempotencyKey, result);
      return result;
    }

    shipment.canceled = true;
    const result: CancelShipmentResult = {
      canceled: true,
      replayed: false,
    };
    this.cancelResultsByIdempotencyKey.set(input.idempotencyKey, result);

    return result;
  }
}
