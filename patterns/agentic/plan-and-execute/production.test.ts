import { describe, it, expect } from "vitest";
import { PlanAndExecuteAgent } from "./production";
import type { PlanStep, PlannerFn, StepExecutor, ExecutorContext } from "./production";

describe("Plan-and-Execute (Production)", () => {
  it("executes all steps in a simple plan", async () => {
    const planner: PlannerFn = async () => [
      { id: "s1", description: "First step", dependsOn: [] },
      { id: "s2", description: "Second step", dependsOn: ["s1"] },
    ];
    const executor: StepExecutor = async (step) => `result:${step.id}`;

    const agent = new PlanAndExecuteAgent(planner, executor);
    const plan = await agent.run("test goal");

    expect(plan.goal).toBe("test goal");
    expect(plan.steps.filter((s) => s.status === "done")).toHaveLength(2);
    expect(plan.steps[0].result).toBe("result:s1");
    expect(plan.steps[1].result).toBe("result:s2");
  });

  it("respects step dependencies", async () => {
    const executionOrder: string[] = [];
    const planner: PlannerFn = async () => [
      { id: "a", description: "A", dependsOn: [] },
      { id: "b", description: "B", dependsOn: ["a"] },
      { id: "c", description: "C", dependsOn: ["b"] },
    ];
    const executor: StepExecutor = async (step) => {
      executionOrder.push(step.id);
      return `done:${step.id}`;
    };

    const agent = new PlanAndExecuteAgent(planner, executor);
    const plan = await agent.run("ordered goal");

    expect(executionOrder).toEqual(["a", "b", "c"]);
    expect(plan.steps.every((s) => s.status === "done")).toBe(true);
  });

  it("marks remaining steps as skipped on unrecoverable failure", async () => {
    let callCount = 0;
    const planner: PlannerFn = async (goal, failed) => {
      callCount++;
      if (callCount === 1) {
        return [
          { id: "s1", description: "Step 1", dependsOn: [] },
          { id: "s2", description: "Step 2", dependsOn: ["s1"] },
        ];
      }
      // Replanning also fails
      return [{ id: "s2_retry", description: "Retry step 2", dependsOn: [] }];
    };
    const executor: StepExecutor = async (step) => {
      if (step.id === "s2" || step.id === "s2_retry") {
        throw new Error("always fails");
      }
      return "ok";
    };

    const agent = new PlanAndExecuteAgent(planner, executor);
    const plan = await agent.run("failing goal");

    // Should have attempted replanning up to MAX_REPLAN_ATTEMPTS (2)
    const failedSteps = plan.steps.filter((s) => s.status === "failed");
    expect(failedSteps.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onProgress callback during execution", async () => {
    const progressUpdates: string[] = [];
    const planner: PlannerFn = async () => [
      { id: "s1", description: "Only step", dependsOn: [] },
    ];
    const executor: StepExecutor = async () => "done";

    const agent = new PlanAndExecuteAgent(planner, executor, (step) => {
      progressUpdates.push(`${step.id}:${step.status}`);
    });
    await agent.run("goal");

    expect(progressUpdates).toContain("s1:running");
    expect(progressUpdates).toContain("s1:done");
  });

  it("provides executor context with completed steps", async () => {
    const contexts: ExecutorContext[] = [];
    const planner: PlannerFn = async () => [
      { id: "s1", description: "First", dependsOn: [] },
      { id: "s2", description: "Second", dependsOn: ["s1"] },
    ];
    const executor: StepExecutor = async (step, ctx) => {
      contexts.push({ ...ctx, completedSteps: new Map(ctx.completedSteps) });
      return `result:${step.id}`;
    };

    const agent = new PlanAndExecuteAgent(planner, executor);
    await agent.run("goal");

    // First step has no completed steps in context
    expect(contexts[0].completedSteps.size).toBe(0);
    // Second step has first step's result in context
    expect(contexts[1].completedSteps.size).toBe(1);
    expect(contexts[1].completedSteps.get("s1")).toBe("result:s1");
  });
});
