import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { config } from "./config";
import { executeRun } from "./runs/run-executor";
import { PlaywrightBrowserAdapter } from "./browser/playwright-browser-adapter";
import pLimit from "p-limit";

const fastify = Fastify({ logger: true });
const limit = pLimit(config.WORKER_CONCURRENCY);

const auth = (req: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
  const header = req.headers.authorization;
  if (!header || header !== `Bearer ${config.QA_WORKER_API_KEY}`) {
    reply.status(401).send({ error: "Unauthorized" });
    return;
  }
  done();
};

fastify.get("/health", async () => {
  return { status: "ok", service: "sinkaf-qa-worker" };
});

fastify.get("/health/browser", async (req, reply) => {
  const adapter = new PlaywrightBrowserAdapter();
  try {
    await adapter.open();
    await adapter.close();
    return { status: "ok", browser: "chromium" };
  } catch (error) {
    req.log.error(error);
    reply.status(503).send({ status: "error", browser: "unavailable" });
  }
});

const runSchema = z.object({
  runId: z.string(),
  url: z.string().url(),
  goal: z.string(),
  callbackUrl: z.string().url().optional(),
  authProfileId: z.string().optional()
});

fastify.post("/runs", { preHandler: auth }, async (request, reply) => {
  const body = request.body;
  const parsed = runSchema.safeParse(body);
  
  if (!parsed.success) {
    return reply.status(400).send({ error: "Invalid payload", details: parsed.error.issues });
  }

  limit(() => executeRun(parsed.data)).catch(console.error);

  reply.code(202).send({ accepted: true, runId: parsed.data.runId });
});

fastify.listen({ port: config.PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Worker listening at ${address}`);
});
