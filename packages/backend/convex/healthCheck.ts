import { query } from "./_generated/server";
import { convex } from "./fluent";

export const get = convex.query()
  .handler( async () => {
    return "OK";
  })
  .public();
