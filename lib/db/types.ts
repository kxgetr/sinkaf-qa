import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { runs, runEvents } from "./schema";

export type DbRun = InferSelectModel<typeof runs>;
export type DbRunInsert = InferInsertModel<typeof runs>;

export type DbRunEvent = InferSelectModel<typeof runEvents>;
export type DbRunEventInsert = InferInsertModel<typeof runEvents>;
