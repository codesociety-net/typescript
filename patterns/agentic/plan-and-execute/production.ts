// ── Plan-and-Execute with Replanning, Dependencies, Progress Tracking ──

export type StepStatus = "pending" | "blocked" | "running" | "done" | "failed" | "skipped";

export interface PlanStep {
  id: string;
  description: string;
  dependsOn: string[];
  status: StepStatus;
  result?: unknown;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  attempts: number;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: PlanStep[];
  version: number;
  createdAt: number;
}

export interface ExecutorContext {
  goal: string;
  completedSteps: Map<string, unknown>;
  plan: ExecutionPlan;
}

export type StepExecutor = (step: PlanStep, ctx: ExecutorContext) => Promise<unknown>;
export type PlannerFn = (goal: string, failedSteps?: PlanStep[]) => Promise<Omit<PlanStep, "status" | "result" | "error" | "startedAt" | "completedAt" | "attempts">[]>;
export type ProgressCallback = (step: PlanStep, plan: ExecutionPlan) => void;

export class PlanAndExecuteAgent {
  private MAX_REPLAN_ATTEMPTS = 2;

  constructor(
    private planner: PlannerFn,
    private executor: StepExecutor,
    private onProgress?: ProgressCallback
  ) {}

  async run(goal: string, signal?: AbortSignal): Promise<ExecutionPlan> {
    let plan = await this.buildPlan(goal);
    let replanCount = 0;

    while (true) {
      if (signal?.aborted) throw new Error("Execution aborted");

      const ready = this.getReadySteps(plan);
      if (ready.length === 0) break;

      const failed: PlanStep[] = [];

      for (const step of ready) {
        if (signal?.aborted) throw new Error("Execution aborted");

        step.status = "running";
        step.startedAt = Date.now();
        step.attempts++;
        this.onProgress?.(step, plan);

        try {
          const ctx: ExecutorContext = {
            goal,
            completedSteps: new Map(
              plan.steps
                .filter(s => s.status === "done")
                .map(s => [s.id, s.result])
            ),
            plan,
          };

          step.result = await this.executor(step, ctx);
          step.status = "done";
          step.completedAt = Date.now();
        } catch (e) {
          step.error = e instanceof Error ? e.message : String(e);
          step.status = "failed";
          step.completedAt = Date.now();
          failed.push(step);
        }

        this.onProgress?.(step, plan);
      }

      if (failed.length > 0 && replanCount < this.MAX_REPLAN_ATTEMPTS) {
        replanCount++;
        console.log(`Replanning (attempt ${replanCount}) due to ${failed.length} failed step(s)`);
        plan = await this.replan(plan, failed);
        continue;
      }

      if (failed.length > 0) break;
    }

    // Mark remaining blocked steps as skipped
    plan.steps
      .filter(s => s.status === "pending" || s.status === "blocked")
      .forEach(s => { s.status = "skipped"; });

    return plan;
  }

  private async buildPlan(goal: string): Promise<ExecutionPlan> {
    const rawSteps = await this.planner(goal);
    return {
      id: crypto.randomUUID(),
      goal,
      version: 1,
      createdAt: Date.now(),
      steps: rawSteps.map(s => ({
        ...s,
        status: "pending" as StepStatus,
        attempts: 0,
      })),
    };
  }

  private async replan(current: ExecutionPlan, failed: PlanStep[]): Promise<ExecutionPlan> {
    const rawSteps = await this.planner(current.goal, failed);
    const doneSlugs = new Set(current.steps.filter(s => s.status === "done").map(s => s.id));

    return {
      ...current,
      version: current.version + 1,
      steps: [
        ...current.steps.filter(s => s.status === "done"),
        ...rawSteps
          .filter(s => !doneSlugs.has(s.id))
          .map(s => ({ ...s, status: "pending" as StepStatus, attempts: 0 })),
      ],
    };
  }

  private getReadySteps(plan: ExecutionPlan): PlanStep[] {
    const done = new Set(plan.steps.filter(s => s.status === "done").map(s => s.id));
    return plan.steps.filter(s =>
      s.status === "pending" &&
      s.dependsOn.every(dep => done.has(dep))
    );
  }
}

