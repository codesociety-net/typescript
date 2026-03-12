import { describe, it, expect } from "vitest";
import {
  FeedbackSchema,
  OptimizerAgent,
  EvaluatorAgent,
  refinementLoop,
} from "./production";

describe("Evaluator-Optimizer Agent (Production)", () => {
  it("FeedbackSchema validates correct feedback", () => {
    const valid = {
      isPass: true,
      critique: "Looks good",
      score: 85,
      categories: { accuracy: 90, completeness: 80 },
    };
    expect(() => FeedbackSchema.parse(valid)).not.toThrow();
  });

  it("FeedbackSchema rejects invalid score", () => {
    const invalid = {
      isPass: true,
      critique: "ok",
      score: 150, // out of range
      categories: {},
    };
    expect(() => FeedbackSchema.parse(invalid)).toThrow();
  });

  it("OptimizerAgent.generate returns a response", async () => {
    const agent = new OptimizerAgent({
      model: "test",
      temperature: 0.5,
      maxTokens: 100,
    });
    const result = await agent.generate("write a haiku");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("OptimizerAgent.refine returns a response incorporating input", async () => {
    const agent = new OptimizerAgent({
      model: "test",
      temperature: 0.5,
      maxTokens: 100,
    });
    const result = await agent.refine("my draft", "make it shorter");
    expect(typeof result).toBe("string");
  });

  it("EvaluatorAgent.check returns valid Feedback", async () => {
    const agent = new EvaluatorAgent({
      model: "test",
      rubric: "must be clear and concise",
      passThreshold: 80,
    });
    const feedback = await agent.check("some output text");
    expect(feedback.isPass).toBe(true);
    expect(feedback.score).toBeGreaterThanOrEqual(0);
    expect(feedback.score).toBeLessThanOrEqual(100);
    expect(typeof feedback.critique).toBe("string");
  });

  it("refinementLoop completes and returns structured result", async () => {
    const optimizer = new OptimizerAgent({
      model: "test",
      temperature: 0.7,
      maxTokens: 200,
    });
    const evaluator = new EvaluatorAgent({
      model: "test",
      rubric: "quality check",
      passThreshold: 80,
    });

    const result = await refinementLoop("write a poem", optimizer, evaluator, {
      maxIterations: 3,
    });

    expect(result).toHaveProperty("output");
    expect(result).toHaveProperty("iterations");
    expect(result).toHaveProperty("finalScore");
    expect(result.iterations).toBeGreaterThanOrEqual(1);
    expect(typeof result.output).toBe("string");
  });

  it("refinementLoop calls onIteration callback", async () => {
    const optimizer = new OptimizerAgent({
      model: "test",
      temperature: 0.7,
      maxTokens: 200,
    });
    const evaluator = new EvaluatorAgent({
      model: "test",
      rubric: "quality",
      passThreshold: 80,
    });

    const iterations: number[] = [];
    await refinementLoop("task", optimizer, evaluator, {
      maxIterations: 3,
      onIteration: (i) => iterations.push(i),
    });

    expect(iterations.length).toBeGreaterThanOrEqual(1);
    expect(iterations[0]).toBe(1);
  });
});
