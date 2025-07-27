import { nu } from "./nu";

export const errorSchema = nu.object({
  errorCode: nu.string(), // required by default
  errorMessage: nu.string(), // required by default
});
