import {
  resolveContainerKey,
  resolveFirstContainerKey,
} from "../container-access";

describe("china payment notification container access", () => {
  it("resolves a value through container.resolve when available", () => {
    const scope = {
      resolve: jest.fn().mockImplementation((key: string) =>
        key === "target" ? "resolved-value" : undefined,
      ),
    };

    expect(resolveContainerKey(scope, "target")).toBe("resolved-value");
  });

  it("falls back to direct property when resolve is unavailable", () => {
    const scope = {
      target: "property-value",
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    };

    expect(resolveContainerKey(scope, "target")).toBe("property-value");
  });

  it("resolves the first available key from a key list", () => {
    const scope = {
      fallback: "fallback-value",
    };

    expect(resolveFirstContainerKey(scope, ["missing", "fallback"])).toBe(
      "fallback-value",
    );
  });
});
