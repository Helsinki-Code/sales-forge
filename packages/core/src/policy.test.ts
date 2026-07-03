import { describe, expect, it } from "vitest";
import { assertApprovalTransition, mayExecuteProductionMutation } from "./policy.js";
import { redactSecrets } from "./crypto.js";

describe("production guardrails", () => {
  it("requires explicit UI confirmation and passing checks", () => {
    expect(mayExecuteProductionMutation({ explicitUiConfirmation: false, authenticatedUserId: "u1", branchProtectionPassing: true, checksPassing: true, state: "ready" })).toBe(false);
    expect(mayExecuteProductionMutation({ explicitUiConfirmation: true, authenticatedUserId: "u1", branchProtectionPassing: true, checksPassing: true, state: "ready" })).toBe(true);
  });

  it("rejects invalid state transitions", () => {
    expect(() => assertApprovalTransition("draft", "merged")).toThrow();
  });

  it("redacts common credentials", () => {
    expect(redactSecrets("api_key=abc123 token: ghp_abcdefghijklmnopqrstuvwxyz")).not.toContain("abc123");
  });
});
