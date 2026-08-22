import { z } from "zod";

export const structuredResultSchema = z.object({
  summary: z.object({
    pagesVisited: z.number(),
    browserActions: z.number(),
    testCasesAttempted: z.number(),
    confirmedBugs: z.number(),
    criticalBugs: z.number(),
    completionReason: z.string(),
  }),
  bugs: z.array(z.any())
});
