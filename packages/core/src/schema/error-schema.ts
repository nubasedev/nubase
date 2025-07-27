import { nu } from "./nu";

export const errorSchema = nu.object({
  errorCode: nu.string().withMeta({
    required: true,
  }),
  errorMessage: nu.string().withMeta({
    required: true,
  }),
});
