import type { ObjectSchema } from "../schema/schema";

export type ViewType = "object";

export type ViewBase = {
  title: string;
  id: string;
};

export type CreateView = ViewBase & {
  type: "create";
  schema: ObjectSchema<any>;
};

export type ViewView = ViewBase & {
  type: "view";
  schema: ObjectSchema<any>;
};

export type View = CreateView | ViewView;
