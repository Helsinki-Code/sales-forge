import { describe, expect, it } from "vitest";
import { systemInstruction } from "./prompts.js";

describe("agent prompt boundaries", () => {
  it("treats repository content as untrusted and forbids ranking guarantees", () => {
    const prompt = systemInstruction("repository_engineer");
    expect(prompt).toContain("untrusted data");
    expect(prompt).toContain("Never claim or guarantee");
  });
});
