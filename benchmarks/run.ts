import { Bench } from "tinybench";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const patternsDir = path.join(__dirname, "..", "patterns");
const resultsPath = path.join(__dirname, "results.json");

interface BenchmarkResult {
  opsPerSec: number;
  avgTimeNs: number;
  samples: number;
}

interface Results {
  metadata: {
    timestamp: string;
    runtime: string;
    compiler: string;
    os: string;
  };
  patterns: Record<string, Record<string, BenchmarkResult>>;
}

async function discoverPatterns(): Promise<
  { category: string; slug: string; variant: string; filePath: string }[]
> {
  const entries: {
    category: string;
    slug: string;
    variant: string;
    filePath: string;
  }[] = [];

  const categories = fs
    .readdirSync(patternsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const cat of categories) {
    const catDir = path.join(patternsDir, cat.name);
    const patterns = fs
      .readdirSync(catDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const pat of patterns) {
      const patDir = path.join(catDir, pat.name);
      const files = fs
        .readdirSync(patDir)
        .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

      for (const file of files) {
        entries.push({
          category: cat.name,
          slug: pat.name,
          variant: file.replace(".ts", ""),
          filePath: path.join(patDir, file),
        });
      }
    }
  }

  return entries;
}

/**
 * Test-invoke a function to check if it works without arguments.
 * Returns true if the call succeeds (sync or async) without throwing.
 */
async function canCallWithoutArgs(fn: Function): Promise<boolean> {
  try {
    const isConstructor = fn.prototype && fn.prototype.constructor === fn;
    const result = isConstructor
      ? new (fn as new () => unknown)()
      : (fn as () => unknown)();
    // Await if it returns a promise
    if (result && typeof (result as Promise<unknown>).then === "function") {
      await result;
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const patterns = await discoverPatterns();
  const results: Results = {
    metadata: {
      timestamp: new Date().toISOString(),
      runtime: `Node.js ${process.version}`,
      compiler: "TypeScript 5.6",
      os: process.platform,
    },
    patterns: {},
  };

  console.log(`Found ${patterns.length} implementations to benchmark\n`);

  for (const entry of patterns) {
    const key = entry.slug;
    if (!results.patterns[key]) results.patterns[key] = {};

    try {
      const mod = await import(pathToFileURL(entry.filePath).href);
      const exportedFns = Object.entries(mod).filter(
        ([, v]) => typeof v === "function"
      );

      if (exportedFns.length === 0) {
        console.log(`  - ${key}/${entry.variant} — no exported functions`);
        continue;
      }

      // Find a function that can be called without arguments
      let benchFn: Function | null = null;
      let benchName = "";
      for (const [name, fn] of exportedFns) {
        if (await canCallWithoutArgs(fn as Function)) {
          benchFn = fn as Function;
          benchName = name;
          break;
        }
      }

      if (!benchFn) {
        console.log(
          `  - ${key}/${entry.variant} — all exports require arguments`
        );
        continue;
      }

      const isConstructor =
        benchFn.prototype && benchFn.prototype.constructor === benchFn;

      const bench = new Bench({ time: 1000 });
      bench.add(`${key}/${entry.variant}`, () => {
        if (isConstructor) {
          new (benchFn as new () => unknown)();
        } else {
          (benchFn as () => unknown)();
        }
      });

      await bench.run();
      const task = bench.tasks[0];

      if (task?.result) {
        results.patterns[key][entry.variant] = {
          opsPerSec: Math.round(task.result.hz),
          avgTimeNs: Math.round(task.result.mean * 1_000_000),
          samples: task.result.samples.length,
        };
        console.log(
          `  ✓ ${key}/${entry.variant} — ${Math.round(task.result.hz).toLocaleString()} ops/sec`
        );
      }
    } catch (err) {
      console.log(
        `  ✗ ${key}/${entry.variant} — ${err instanceof Error ? err.message : err}`
      );
    }
  }

  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2) + "\n");
  console.log(`\nResults written to ${resultsPath}`);
}

main();
