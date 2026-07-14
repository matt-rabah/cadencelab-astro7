import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({
  url: "http://localhost:4001/graphql",
  token: "79c07460d61d4534d4e576c7bf8eb9917ed00cae",
  queries,
});
export default client;
