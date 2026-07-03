import { describe, expect, it } from "vitest";
import { AUDIT_RULES, CWV_THRESHOLDS, SCHEMA_POLICY, SOURCE_SKILL_PARITY } from "./knowledge.js";

describe("SEO knowledge safety", () => {
  it("uses INP and excludes FID", () => {
    expect(CWV_THRESHOLDS.inpMs.good).toBe(200);
    expect(JSON.stringify(AUDIT_RULES)).not.toContain("FID");
  });
  it("does not recommend deprecated HowTo schema", () => expect(SCHEMA_POLICY.deprecated).toContain("HowTo"));
  it("preserves the source skill workflows", () => expect(SOURCE_SKILL_PARITY).toContain("competitor gap"));
});
