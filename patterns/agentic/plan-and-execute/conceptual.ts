export interface Step {
  id: string;
  description: string;
  status: "pending" | "running" | "done" | "failed";
  result?: string;
}

export interface Plan {
  goal: string;
  steps: Step[];
}

export type Planner = (goal: string) => Promise<Step[]>;
export type Executor = (step: Step) => Promise<string>;

export async function planAndExecute(
  goal: string,
  planner: Planner,
  executor: Executor
): Promise<Plan> {
  // Phase 1: Plan
  const rawSteps = await planner(goal);
  const plan: Plan = { goal, steps: rawSteps };

  // Phase 2: Execute each step sequentially
  for (const step of plan.steps) {
    step.status = "running";
    try {
      step.result = await executor(step);
      step.status = "done";
    } catch (e) {
      step.result = String(e);
      step.status = "failed";
      break; // halt on first failure
    }
  }

  return plan;
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Usage
  const plan = await planAndExecute(
    "Write and publish a blog post",
    async (goal) => [
      { id: "1", description: "Research the topic", status: "pending" },
      { id: "2", description: "Draft the outline", status: "pending" },
      { id: "3", description: "Write the post", status: "pending" },
      { id: "4", description: "Review and publish", status: "pending" },
    ],
    async (step) => {
      console.log(`Executing: ${step.description}`);
      return `Completed: ${step.description}`;
    }
  );
  
  console.log(plan.steps.map(s => `[${s.status}] ${s.description}`));
}
