export interface Feedback {
  isPass: boolean;
  critique: string;
  score: number;
}

export interface Optimizer {
  generate(task: string): Promise<string>;
  refine(current: string, feedback: string): Promise<string>;
}

export interface Evaluator {
  check(output: string): Promise<Feedback>;
}

export const MAX_ITERATIONS = 5;

export async function refinementLoop(
  task: string,
  optimizer: Optimizer,
  evaluator: Evaluator
): Promise<string> {
  let currentOutput = await optimizer.generate(task);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const feedback = await evaluator.check(currentOutput);

    if (feedback.isPass) return currentOutput;

    currentOutput = await optimizer.refine(
      currentOutput,
      feedback.critique
    );
  }

  return currentOutput;
}
