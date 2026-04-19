// inngest/index.ts
import { inngest } from "./client";
import { fetchNewsNightly } from "./functions/fetch-news";

export { inngest };
export const functions = [fetchNewsNightly];
