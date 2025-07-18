import type { ObjectSchema } from "../schema/schema";

export type ViewType = "object";

export type View = {
  type: ViewType;
};

export type ObjectView = {
  type: "object";
  schema: ObjectSchema<any>;
};
