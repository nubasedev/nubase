CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA "public";

CREATE TABLE "public"."tickets" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "workspace_id" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" varchar(1000),
  "assignee_id" integer
);

CREATE TABLE "public"."user_workspaces" (
  "user_id" integer NOT NULL,
  "workspace_id" integer NOT NULL,
  "created_at" timestamp without time zone DEFAULT now()
);

CREATE TABLE "public"."users" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "email" varchar(255) NOT NULL,
  "display_name" varchar(100) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

CREATE TABLE "public"."workspaces" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "slug" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now()
);

ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_workspaces" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_pk" PRIMARY KEY ("id");

ALTER TABLE "public"."user_workspaces" ADD CONSTRAINT "user_workspaces_pk" PRIMARY KEY ("user_id", "workspace_id");

ALTER TABLE "public"."users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");

ALTER TABLE "public"."users" ADD CONSTRAINT "users_pk" PRIMARY KEY ("id");

ALTER TABLE "public"."workspaces" ADD CONSTRAINT "workspaces_pk" PRIMARY KEY ("id");

ALTER TABLE "public"."workspaces" ADD CONSTRAINT "workspaces_slug_unique" UNIQUE ("slug");

ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_assignee_fk" FOREIGN KEY ("assignee_id") REFERENCES public.users ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_workspace_fk" FOREIGN KEY ("workspace_id") REFERENCES public.workspaces ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "public"."user_workspaces" ADD CONSTRAINT "user_workspaces_user_fk" FOREIGN KEY ("user_id") REFERENCES public.users ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "public"."user_workspaces" ADD CONSTRAINT "user_workspaces_workspace_fk" FOREIGN KEY ("workspace_id") REFERENCES public.workspaces ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

CREATE POLICY "tickets_workspace_isolation" ON "public"."tickets" AS PERMISSIVE FOR ALL TO PUBLIC USING ((workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer)) WITH CHECK ((workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer));

CREATE POLICY "user_workspaces_workspace_isolation" ON "public"."user_workspaces" AS PERMISSIVE FOR ALL TO PUBLIC USING ((workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer)) WITH CHECK ((workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer));
