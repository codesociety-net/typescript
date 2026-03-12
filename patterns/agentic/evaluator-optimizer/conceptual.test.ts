import { describe, it, expect } from "vitest";
import { MAX_ITERATIONS, refinementLoop } from "./conceptual";
import type { Optimizer, Evaluator, Feedback } from "./conceptual";

describe("Evaluator-Optimizer Agent (Conceptual)", () => {
  it("MAX_ITERATIONS is 5", () => {
    expect(MAX_ITERATIONS).toBe(5);
  });

  it("returns immediately when evaluator passes on first try", async () => {
    const optimizer: Optimizer = {
      generate: async (task) => `output for: ${task}`,
      refine: async (current, feedback) => `refined: ${current}`,
    };
    const evaluator: Evaluator = {
      check: async () => ({ isPass: true, critique: "good", score: 95 }),
    };

    const result = await refinementLoop("write code", optimizer, evaluator);
    expect(result).toBe("output for: write code");
  });

  it("refines output when evaluator fails initially then passes", async () => {
    let checkCount = 0;
    const optimizer: Optimizer = {
      generate: async (task) => "draft-1",
      refine: async (current, feedback) => `${current}-refined`,
    };
    const evaluator: Evaluator = {
      check: async (output) => {
        checkCount++;
        if (checkCount >= 2) {
          return { isPass: true, critique: "good", score: 90 };
        }
        return { isPass: false, critique: "needs work", score: 40 };
      },
    };

    const result = await refinementLoop("task", optimizer, evaluator);
    expect(result).toBe("draft-1-refined");
    expect(checkCount).toBe(2);
  });

  it("returns last output after MAX_ITERATIONS if never passes", async () => {
    let refineCount = 0;
    const optimizer: Optimizer = {
      generate: async () => "v0",
      refine: async (current) => {
        refineCount++;
        return `v${refineCount}`;
      },
    };
    const evaluator: Evaluator = {
      check: async () => ({ isPass: false, critique: "bad", score: 10 }),
    };

    const result = await refinementLoop("task", optimizer, evaluator);
    expect(refineCount).toBe(MAX_ITERATIONS);
    expect(result).toBe(`v${MAX_ITERATIONS}`);
  });

  it("passes critique from evaluator to optimizer.refine", async () => {
    const critiques: string[] = [];
    let callCount = 0;

    const optimizer: Optimizer = {
      generate: async () => "initial",
      refine: async (current, feedback) => {
        critiques.push(feedback);
        return "improved";
      },
    };
    const evaluator: Evaluator = {
      check: async () => {
        callCount++;
        if (callCount === 1) {
          return { isPass: false, critique: "too short", score: 30 };
        }
        return { isPass: true, critique: "ok", score: 90 };
      },
    };

    await refinementLoop("task", optimizer, evaluator);
    expect(critiques).toEqual(["too short"]);
  });
});
