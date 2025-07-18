import type { ObjectSchema } from "../schema/schema";

export type ViewType = "object";

export type ViewBase = {
  title: string;
};

export type ObjectView = ViewBase & {
  type: "object";
  schema: ObjectSchema<any>;
};

export type View = ObjectView;
