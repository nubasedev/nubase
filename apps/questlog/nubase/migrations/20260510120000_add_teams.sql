CREATE TABLE "public"."teams" (
  "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  "workspace_id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" varchar(1000)
);

CREATE TABLE "public"."user_teams" (
  "user_id" integer NOT NULL,
  "team_id" integer NOT NULL,
  "created_at" timestamp without time zone DEFAULT now()
);

ALTER TABLE "public"."tickets" ADD COLUMN "team_id" integer;

ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."user_teams" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_pk" PRIMARY KEY ("id");

ALTER TABLE "public"."user_teams" ADD CONSTRAINT "user_teams_pk" PRIMARY KEY ("user_id", "team_id");

ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_workspace_fk" FOREIGN KEY ("workspace_id") REFERENCES public.workspaces ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "public"."user_teams" ADD CONSTRAINT "user_teams_user_fk" FOREIGN KEY ("user_id") REFERENCES public.users ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "public"."user_teams" ADD CONSTRAINT "user_teams_team_fk" FOREIGN KEY ("team_id") REFERENCES public.teams ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_team_fk" FOREIGN KEY ("team_id") REFERENCES public.teams ("id") ON UPDATE NO ACTION ON DELETE SET NULL;

CREATE POLICY "teams_workspace_isolation" ON "public"."teams" AS PERMISSIVE FOR ALL TO PUBLIC USING ((workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer)) WITH CHECK ((workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer));

CREATE POLICY "user_teams_workspace_isolation" ON "public"."user_teams" AS PERMISSIVE FOR ALL TO PUBLIC USING ((team_id IN (SELECT id FROM public.teams WHERE workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer))) WITH CHECK ((team_id IN (SELECT id FROM public.teams WHERE workspace_id = (NULLIF(current_setting('app.current_workspace_id'::text, true), ''::text))::integer)));
