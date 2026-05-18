ALTER TABLE "public"."users" ADD COLUMN "team_id" integer;

UPDATE "public"."users" u
SET team_id = (
  SELECT MIN(ut.team_id) FROM "public"."user_teams" ut WHERE ut.user_id = u.id
);

ALTER TABLE "public"."users" ADD CONSTRAINT "users_team_fk" FOREIGN KEY ("team_id") REFERENCES public.teams ("id") ON UPDATE NO ACTION ON DELETE SET NULL;

DROP TABLE "public"."user_teams";
