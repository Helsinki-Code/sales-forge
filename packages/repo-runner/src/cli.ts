import { readFile } from "node:fs/promises";
import { runRepositoryJob } from "./runner.js";

const input = process.argv[2];
if (!input) throw new Error("Usage: seoforge-runner <job.json>");
const result = await runRepositoryJob(JSON.parse(await readFile(input, "utf8")));
process.stdout.write(`${JSON.stringify(result)}\n`);
