import { describe, it, expect } from "vitest";
import { planAndExecute } from "./conceptual";
import type { Step, Planner, Executor } from "./conceptual";

describe("Plan-and-Execute (Conceptual)", () => {
  it("creates a plan and executes all steps successfully", async () => {
    const planner: Planner = async (goal) => [
      { id: "1", description: "Step A", status: "pending" },
      { id: "2", description: "Step B", status: "pending" },
    ];
    const executor: Executor = async (step) => `done: ${step.description}`;

    const plan = await planAndExecute("Build something", planner, executor);

    expect(plan.goal).toBe("Build something");
    expect(plan.steps).toHaveLength(2);
    expect(plan.steps[0].status).toBe("done");
    expect(plan.steps[0].result).toBe("done: Step A");
    expect(plan.steps[1].status).toBe("done");
    expect(plan.steps[1].result).toBe("done: Step B");
  });

  it("halts on first step failure", async () => {
    const planner: Planner = async () => [
      { id: "1", description: "Step A", status: "pending" },
      { id: "2", description: "Step B", status: "pending" },
      { id: "3", description: "Step C", status: "pending" },
    ];
    const executor: Executor = async (step) => {
      if (step.id === "2") throw new Error("step 2 failed");
      return `done: ${step.description}`;
    };

    const plan = await planAndExecute("goal", planner, executor);

    expect(plan.steps[0].status).toBe("done");
    expect(plan.steps[1].status).toBe("failed");
    expect(plan.steps[1].result).toContain("step 2 failed");
    // Step 3 should remain pending (never executed)
    expect(plan.steps[2].status).toBe("pending");
  });

  it("passes the step object to the executor with running status", async () => {
    const statusDuringExecution: string[] = [];
    const planner: Planner = async () => [
      { id: "a", description: "Do X", status: "pending" },
    ];
    const executor: Executor = async (step) => {
      // Capture the status at the moment the executor runs
      statusDuringExecution.push(step.status);
      return "ok";
    };

    await planAndExecute("goal", planner, executor);
    expect(statusDuringExecution).toHaveLength(1);
    expect(statusDuringExecution[0]).toBe("running");
  });

  it("passes the goal to the planner", async () => {
    let receivedGoal = "";
    const planner: Planner = async (goal) => {
      receivedGoal = goal;
      return [];
    };
    const executor: Executor = async () => "ok";

    await planAndExecute("deploy app", planner, executor);
    expect(receivedGoal).toBe("deploy app");
  });

  it("handles empty plan gracefully", async () => {
    const planner: Planner = async () => [];
    const executor: Executor = async () => "ok";

    const plan = await planAndExecute("empty goal", planner, executor);
    expect(plan.steps).toHaveLength(0);
    expect(plan.goal).toBe("empty goal");
  });
});
