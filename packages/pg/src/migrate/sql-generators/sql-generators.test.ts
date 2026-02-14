import { describe, expect, it } from "vitest";
import type { SchemaDiff, TableDiff } from "../../types/diff";
import type {
  PgCollation,
  PgColumn,
  PgConstraint,
  PgDomain,
  PgEnum,
  PgExtension,
  PgFunction,
  PgMaterializedView,
  PgPrivilege,
  PgRlsPolicy,
  PgSequence,
  PgTable,
  PgTrigger,
  PgView,
} from "../../types/schema";
import { generateCollationStatements } from "./collations";
import { generateColumnStatements } from "./columns";
import { generateConstraintStatements } from "./constraints";
import { generateDomainStatements } from "./domains";
import { generateEnumStatements } from "./enums";
import { generateExtensionStatements } from "./extensions";
import { generateFunctionStatements } from "./functions";
import { generateIndexStatements } from "./indexes";
import { generatePolicyStatements } from "./policies";
import { generatePrivilegeStatements } from "./privileges";
import { generateSequenceStatements } from "./sequences";
import { generateTableStatements } from "./tables";
import { generateTriggerStatements } from "./triggers";
import { generateViewStatements } from "./views";

// ── Helpers ──

function emptyDiff(): SchemaDiff {
  const emptySet = <T>() => ({
    added: {} as Record<string, T>,
    removed: {} as Record<string, T>,
    modified: {} as Record<string, { from: T; to: T }>,
  });
  return {
    hasDifferences: true,
    tables: { added: {}, removed: {}, modified: {} },
    enums: emptySet<PgEnum>(),
    sequences: emptySet<PgSequence>(),
    views: emptySet<PgView>(),
    materializedViews: emptySet<PgMaterializedView>(),
    functions: emptySet<PgFunction>(),
    triggers: emptySet<PgTrigger>(),
    extensions: emptySet<PgExtension>(),
    domains: emptySet<PgDomain>(),
    collations: emptySet<PgCollation>(),
    policies: emptySet<PgRlsPolicy>(),
    privileges: emptySet<PgPrivilege>(),
  };
}

function col(overrides: Partial<PgColumn> = {}): PgColumn {
  return {
    name: "id",
    dataType: "integer",
    udtName: "int4",
    isNullable: false,
    defaultValue: null,
    isIdentity: false,
    identityGeneration: null,
    characterMaxLength: null,
    numericPrecision: 32,
    numericScale: 0,
    ordinalPosition: 1,
    comment: null,
    ...overrides,
  };
}

function table(overrides: Partial<PgTable> = {}): PgTable {
  return {
    schema: "public",
    name: "users",
    columns: {
      id: col({ name: "id", ordinalPosition: 1 }),
    },
    constraints: {},
    indexes: {},
    rlsEnabled: false,
    rlsForced: false,
    comment: null,
    ...overrides,
  };
}

function tableDiff(overrides: Partial<TableDiff> = {}): TableDiff {
  const t = table();
  return {
    from: t,
    to: t,
    columns: { added: {}, removed: {}, modified: {} },
    constraints: { added: {}, removed: {}, modified: {} },
    indexes: { added: {}, removed: {}, modified: {} },
    rlsChanged: false,
    ...overrides,
  };
}

// ── Tables ──

describe("generateTableStatements", () => {
  it("generates CREATE TABLE with columns", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      columns: {
        id: col({ name: "id", ordinalPosition: 1 }),
        name: col({
          name: "name",
          dataType: "text",
          udtName: "text",
          isNullable: true,
          ordinalPosition: 2,
        }),
      },
    });

    const stmts = generateTableStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain("CREATE TABLE");
    expect(stmts[0].sql).toContain('"id" integer NOT NULL');
    expect(stmts[0].sql).toContain('"name" text');
    expect(stmts[0].isDestructive).toBe(false);
    expect(stmts[0].priority).toBe(130);
  });

  it("handles USER-DEFINED types (enums)", () => {
    const diff = emptyDiff();
    diff.tables.added["public.tickets"] = table({
      name: "tickets",
      columns: {
        status: col({
          name: "status",
          dataType: "USER-DEFINED",
          udtName: "ticket_status",
          ordinalPosition: 1,
        }),
      },
    });

    const stmts = generateTableStatements(diff);
    expect(stmts[0].sql).toContain('"status" ticket_status NOT NULL');
    expect(stmts[0].sql).not.toContain("USER-DEFINED");
  });

  it("handles ARRAY types", () => {
    const diff = emptyDiff();
    diff.tables.added["public.data"] = table({
      name: "data",
      columns: {
        tags: col({
          name: "tags",
          dataType: "ARRAY",
          udtName: "_text",
          isNullable: true,
          ordinalPosition: 1,
        }),
      },
    });

    const stmts = generateTableStatements(diff);
    expect(stmts[0].sql).toContain('"tags" text[]');
  });

  it("handles character varying with max length", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      columns: {
        email: col({
          name: "email",
          dataType: "character varying",
          udtName: "varchar",
          characterMaxLength: 255,
          ordinalPosition: 1,
        }),
      },
    });

    const stmts = generateTableStatements(diff);
    expect(stmts[0].sql).toContain('"email" varchar(255) NOT NULL');
  });

  it("handles identity columns", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      columns: {
        id: col({
          name: "id",
          isIdentity: true,
          identityGeneration: "ALWAYS",
          ordinalPosition: 1,
        }),
      },
    });

    const stmts = generateTableStatements(diff);
    expect(stmts[0].sql).toContain("GENERATED ALWAYS AS IDENTITY");
  });

  it("generates DROP TABLE as destructive", () => {
    const diff = emptyDiff();
    diff.tables.removed["public.users"] = table();

    const stmts = generateTableStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe('DROP TABLE "public"."users";');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("generates RLS statements for new tables", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      rlsEnabled: true,
      rlsForced: true,
    });

    const stmts = generateTableStatements(diff);
    expect(stmts).toHaveLength(3); // CREATE + ENABLE + FORCE
    expect(stmts[1].sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(stmts[2].sql).toContain("FORCE ROW LEVEL SECURITY");
  });

  it("generates RLS change statements for modified tables", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      from: table({ rlsEnabled: false }),
      to: table({ rlsEnabled: true }),
      rlsChanged: true,
    });

    const stmts = generateTableStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain("ENABLE ROW LEVEL SECURITY");
  });
});

// ── Columns ──

describe("generateColumnStatements", () => {
  it("generates ADD COLUMN", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      columns: {
        added: {
          email: col({
            name: "email",
            dataType: "text",
            udtName: "text",
            isNullable: true,
          }),
        },
        removed: {},
        modified: {},
      },
    });

    const stmts = generateColumnStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe(
      'ALTER TABLE "public"."users" ADD COLUMN "email" text;',
    );
    expect(stmts[0].priority).toBe(140);
  });

  it("generates ADD COLUMN with USER-DEFINED type", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      columns: {
        added: {
          status: col({
            name: "status",
            dataType: "USER-DEFINED",
            udtName: "user_status",
            isNullable: false,
            defaultValue: "'active'::user_status",
          }),
        },
        removed: {},
        modified: {},
      },
    });

    const stmts = generateColumnStatements(diff);
    expect(stmts[0].sql).toContain("user_status NOT NULL DEFAULT");
    expect(stmts[0].sql).not.toContain("USER-DEFINED");
  });

  it("generates DROP COLUMN as destructive", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      columns: {
        added: {},
        removed: {
          email: col({ name: "email", dataType: "text", udtName: "text" }),
        },
        modified: {},
      },
    });

    const stmts = generateColumnStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe(
      'ALTER TABLE "public"."users" DROP COLUMN "email";',
    );
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("generates ALTER COLUMN TYPE", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      columns: {
        added: {},
        removed: {},
        modified: {
          age: {
            from: col({ name: "age", dataType: "integer", udtName: "int4" }),
            to: col({ name: "age", dataType: "bigint", udtName: "int8" }),
            changedProperties: ["dataType"],
          },
        },
      },
    });

    const stmts = generateColumnStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain("ALTER COLUMN");
    expect(stmts[0].sql).toContain("TYPE bigint");
  });

  it("generates SET/DROP NOT NULL", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      columns: {
        added: {},
        removed: {},
        modified: {
          name: {
            from: col({ name: "name", isNullable: false }),
            to: col({ name: "name", isNullable: true }),
            changedProperties: ["isNullable"],
          },
        },
      },
    });

    const stmts = generateColumnStatements(diff);
    expect(stmts[0].sql).toContain("DROP NOT NULL");
  });

  it("generates SET DEFAULT / DROP DEFAULT", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      columns: {
        added: {},
        removed: {},
        modified: {
          score: {
            from: col({ name: "score", defaultValue: null }),
            to: col({ name: "score", defaultValue: "0" }),
            changedProperties: ["defaultValue"],
          },
        },
      },
    });

    const stmts = generateColumnStatements(diff);
    expect(stmts[0].sql).toContain("SET DEFAULT 0");
  });

  it("generates identity column changes", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      columns: {
        added: {},
        removed: {},
        modified: {
          id: {
            from: col({ name: "id", isIdentity: false }),
            to: col({
              name: "id",
              isIdentity: true,
              identityGeneration: "ALWAYS",
            }),
            changedProperties: ["isIdentity"],
          },
        },
      },
    });

    const stmts = generateColumnStatements(diff);
    expect(stmts[0].sql).toContain("ADD GENERATED ALWAYS AS IDENTITY");
  });
});

// ── Constraints ──

describe("generateConstraintStatements", () => {
  it("generates ADD PRIMARY KEY constraint", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      constraints: {
        added: {
          users_pkey: {
            schema: "public",
            name: "users_pkey",
            tableName: "users",
            type: "PRIMARY KEY",
            columns: ["id"],
            referencedTable: null,
            referencedColumns: null,
            onUpdate: null,
            onDelete: null,
            checkExpression: null,
            isDeferrable: false,
            isDeferred: false,
          } satisfies PgConstraint,
        },
        removed: {},
        modified: {},
      },
    });

    const stmts = generateConstraintStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain('ADD CONSTRAINT "users_pkey" PRIMARY KEY');
    expect(stmts[0].priority).toBe(140); // PK gets early priority
  });

  it("generates ADD FOREIGN KEY constraint", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.posts"] = tableDiff({
      from: table({ name: "posts" }),
      to: table({ name: "posts" }),
      constraints: {
        added: {
          posts_user_fk: {
            schema: "public",
            name: "posts_user_fk",
            tableName: "posts",
            type: "FOREIGN KEY",
            columns: ["user_id"],
            referencedTable: "public.users",
            referencedColumns: ["id"],
            onUpdate: "NO ACTION",
            onDelete: "CASCADE",
            checkExpression: null,
            isDeferrable: false,
            isDeferred: false,
          } satisfies PgConstraint,
        },
        removed: {},
        modified: {},
      },
    });

    const stmts = generateConstraintStatements(diff);
    expect(stmts[0].sql).toContain("FOREIGN KEY");
    expect(stmts[0].sql).toContain("REFERENCES public.users");
    expect(stmts[0].sql).toContain("ON DELETE CASCADE");
    expect(stmts[0].sql).toContain("ON UPDATE NO ACTION");
    expect(stmts[0].priority).toBe(150); // FK gets later priority
  });

  it("generates ADD CHECK constraint", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      constraints: {
        added: {
          users_age_check: {
            schema: "public",
            name: "users_age_check",
            tableName: "users",
            type: "CHECK",
            columns: [],
            referencedTable: null,
            referencedColumns: null,
            onUpdate: null,
            onDelete: null,
            checkExpression: "CHECK ((age >= 0))",
            isDeferrable: false,
            isDeferred: false,
          } satisfies PgConstraint,
        },
        removed: {},
        modified: {},
      },
    });

    const stmts = generateConstraintStatements(diff);
    expect(stmts[0].sql).toContain(
      'ADD CONSTRAINT "users_age_check" CHECK ((age >= 0))',
    );
  });

  it("generates DROP CONSTRAINT as destructive", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      constraints: {
        added: {},
        removed: {
          users_email_key: {
            schema: "public",
            name: "users_email_key",
            tableName: "users",
            type: "UNIQUE",
            columns: ["email"],
            referencedTable: null,
            referencedColumns: null,
            onUpdate: null,
            onDelete: null,
            checkExpression: null,
            isDeferrable: false,
            isDeferred: false,
          } satisfies PgConstraint,
        },
        modified: {},
      },
    });

    const stmts = generateConstraintStatements(diff);
    expect(stmts[0].sql).toContain('DROP CONSTRAINT "users_email_key"');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("handles deferrable constraints", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      constraints: {
        added: {
          users_pkey: {
            schema: "public",
            name: "users_pkey",
            tableName: "users",
            type: "PRIMARY KEY",
            columns: ["id"],
            referencedTable: null,
            referencedColumns: null,
            onUpdate: null,
            onDelete: null,
            checkExpression: null,
            isDeferrable: true,
            isDeferred: true,
          } satisfies PgConstraint,
        },
        removed: {},
        modified: {},
      },
    });

    const stmts = generateConstraintStatements(diff);
    expect(stmts[0].sql).toContain("DEFERRABLE");
    expect(stmts[0].sql).toContain("INITIALLY DEFERRED");
  });

  it("generates constraints for new tables", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      constraints: {
        users_pkey: {
          schema: "public",
          name: "users_pkey",
          tableName: "users",
          type: "PRIMARY KEY",
          columns: ["id"],
          referencedTable: null,
          referencedColumns: null,
          onUpdate: null,
          onDelete: null,
          checkExpression: null,
          isDeferrable: false,
          isDeferred: false,
        },
      },
    });

    const stmts = generateConstraintStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain("ADD CONSTRAINT");
    expect(stmts[0].description).toContain("new table");
  });
});

// ── Indexes ──

describe("generateIndexStatements", () => {
  it("generates CREATE INDEX for new tables", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      indexes: {
        idx_users_name: {
          schema: "public",
          name: "idx_users_name",
          tableName: "users",
          columns: ["name"],
          isUnique: false,
          method: "btree",
          whereClause: null,
          definition:
            "CREATE INDEX idx_users_name ON public.users USING btree (name)",
          isPrimaryKey: false,
        },
      },
    });

    const stmts = generateIndexStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain("CREATE INDEX idx_users_name");
  });

  it("skips primary key indexes", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      indexes: {
        users_pkey: {
          schema: "public",
          name: "users_pkey",
          tableName: "users",
          columns: ["id"],
          isUnique: true,
          method: "btree",
          whereClause: null,
          definition:
            "CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)",
          isPrimaryKey: true,
        },
      },
    });

    const stmts = generateIndexStatements(diff);
    expect(stmts).toHaveLength(0);
  });

  it("skips indexes that back constraints on new tables", () => {
    const diff = emptyDiff();
    diff.tables.added["public.users"] = table({
      constraints: {
        users_email_key: {
          schema: "public",
          name: "users_email_key",
          tableName: "users",
          type: "UNIQUE",
          columns: ["email"],
          referencedTable: null,
          referencedColumns: null,
          onUpdate: null,
          onDelete: null,
          checkExpression: null,
          isDeferrable: false,
          isDeferred: false,
        },
      },
      indexes: {
        users_email_key: {
          schema: "public",
          name: "users_email_key",
          tableName: "users",
          columns: ["email"],
          isUnique: true,
          method: "btree",
          whereClause: null,
          definition:
            "CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)",
          isPrimaryKey: false,
        },
      },
    });

    const stmts = generateIndexStatements(diff);
    expect(stmts).toHaveLength(0);
  });

  it("generates DROP INDEX as destructive for modified tables", () => {
    const diff = emptyDiff();
    diff.tables.modified["public.users"] = tableDiff({
      indexes: {
        added: {},
        removed: {
          idx_users_name: {
            schema: "public",
            name: "idx_users_name",
            tableName: "users",
            columns: ["name"],
            isUnique: false,
            method: "btree",
            whereClause: null,
            definition:
              "CREATE INDEX idx_users_name ON public.users USING btree (name)",
            isPrimaryKey: false,
          },
        },
        modified: {},
      },
    });

    const stmts = generateIndexStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe('DROP INDEX "public"."idx_users_name";');
    expect(stmts[0].isDestructive).toBe(true);
  });
});

// ── Enums ──

describe("generateEnumStatements", () => {
  it("generates CREATE TYPE AS ENUM", () => {
    const diff = emptyDiff();
    diff.enums.added["public.status"] = {
      schema: "public",
      name: "status",
      values: ["draft", "active", "archived"],
      comment: null,
    };

    const stmts = generateEnumStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe(
      `CREATE TYPE "public"."status" AS ENUM ('draft', 'active', 'archived');`,
    );
    expect(stmts[0].priority).toBe(110);
  });

  it("generates DROP TYPE as destructive", () => {
    const diff = emptyDiff();
    diff.enums.removed["public.status"] = {
      schema: "public",
      name: "status",
      values: ["draft", "active"],
      comment: null,
    };

    const stmts = generateEnumStatements(diff);
    expect(stmts[0].sql).toBe('DROP TYPE "public"."status";');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("generates ALTER TYPE ADD VALUE for simple additions", () => {
    const diff = emptyDiff();
    diff.enums.modified["public.status"] = {
      from: {
        schema: "public",
        name: "status",
        values: ["draft"],
        comment: null,
      },
      to: {
        schema: "public",
        name: "status",
        values: ["draft", "active"],
        comment: null,
      },
    };

    const stmts = generateEnumStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe(
      `ALTER TYPE "public"."status" ADD VALUE 'active';`,
    );
  });

  it("uses rename trick when values are removed", () => {
    const diff = emptyDiff();
    diff.enums.modified["public.status"] = {
      from: {
        schema: "public",
        name: "status",
        values: ["draft", "active", "archived"],
        comment: null,
      },
      to: {
        schema: "public",
        name: "status",
        values: ["draft", "active"],
        comment: null,
      },
    };

    const stmts = generateEnumStatements(diff);
    expect(stmts).toHaveLength(3);
    expect(stmts[0].sql).toContain("RENAME TO");
    expect(stmts[0].sql).toContain("status_old");
    expect(stmts[1].sql).toContain("CREATE TYPE");
    expect(stmts[2].sql).toContain("DROP TYPE");
    expect(stmts[2].sql).toContain("status_old");
  });

  it("escapes single quotes in enum values", () => {
    const diff = emptyDiff();
    diff.enums.added["public.labels"] = {
      schema: "public",
      name: "labels",
      values: ["it's", "ok"],
      comment: null,
    };

    const stmts = generateEnumStatements(diff);
    expect(stmts[0].sql).toContain("'it''s'");
  });
});

// ── Sequences ──

describe("generateSequenceStatements", () => {
  it("generates CREATE SEQUENCE", () => {
    const diff = emptyDiff();
    diff.sequences.added["public.my_seq"] = {
      schema: "public",
      name: "my_seq",
      dataType: "bigint",
      startValue: "100",
      increment: "5",
      minValue: "1",
      maxValue: "9999",
      cacheSize: "1",
      isCyclic: false,
      ownedBy: null,
    };

    const stmts = generateSequenceStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain('CREATE SEQUENCE "public"."my_seq"');
    expect(stmts[0].sql).toContain("INCREMENT BY 5");
    expect(stmts[0].sql).toContain("START WITH 100");
    expect(stmts[0].sql).toContain("NO CYCLE");
    expect(stmts[0].priority).toBe(120);
  });

  it("generates OWNED BY when set", () => {
    const diff = emptyDiff();
    diff.sequences.added["public.users_id_seq"] = {
      schema: "public",
      name: "users_id_seq",
      dataType: "integer",
      startValue: "1",
      increment: "1",
      minValue: "1",
      maxValue: "2147483647",
      cacheSize: "1",
      isCyclic: false,
      ownedBy: "public.users.id",
    };

    const stmts = generateSequenceStatements(diff);
    expect(stmts).toHaveLength(2);
    expect(stmts[1].sql).toContain("OWNED BY public.users.id");
    expect(stmts[1].priority).toBe(210);
  });

  it("generates DROP SEQUENCE as destructive", () => {
    const diff = emptyDiff();
    diff.sequences.removed["public.my_seq"] = {
      schema: "public",
      name: "my_seq",
      dataType: "bigint",
      startValue: "1",
      increment: "1",
      minValue: "1",
      maxValue: "9999",
      cacheSize: "1",
      isCyclic: false,
      ownedBy: null,
    };

    const stmts = generateSequenceStatements(diff);
    expect(stmts[0].sql).toBe('DROP SEQUENCE "public"."my_seq";');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("generates ALTER SEQUENCE for modifications", () => {
    const seq = {
      schema: "public",
      name: "my_seq",
      dataType: "bigint",
      startValue: "1",
      increment: "1",
      minValue: "1",
      maxValue: "9999",
      cacheSize: "1",
      isCyclic: false,
      ownedBy: null,
    } satisfies PgSequence;

    const diff = emptyDiff();
    diff.sequences.modified["public.my_seq"] = {
      from: seq,
      to: { ...seq, increment: "10", isCyclic: true },
    };

    const stmts = generateSequenceStatements(diff);
    expect(stmts[0].sql).toContain("ALTER SEQUENCE");
    expect(stmts[0].sql).toContain("INCREMENT BY 10");
    expect(stmts[0].sql).toContain(" CYCLE");
  });
});

// ── Views ──

describe("generateViewStatements", () => {
  it("generates CREATE VIEW", () => {
    const diff = emptyDiff();
    diff.views.added["public.active_users"] = {
      schema: "public",
      name: "active_users",
      definition: "SELECT id, name FROM users WHERE is_active;",
      columns: ["id", "name"],
      comment: null,
    };

    const stmts = generateViewStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain('CREATE VIEW "public"."active_users"');
    expect(stmts[0].sql).toContain("SELECT id, name FROM users");
  });

  it("generates DROP VIEW as destructive", () => {
    const diff = emptyDiff();
    diff.views.removed["public.active_users"] = {
      schema: "public",
      name: "active_users",
      definition: "SELECT 1;",
      columns: [],
      comment: null,
    };

    const stmts = generateViewStatements(diff);
    expect(stmts[0].sql).toBe('DROP VIEW "public"."active_users";');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("generates CREATE OR REPLACE VIEW for modifications", () => {
    const v = {
      schema: "public",
      name: "active_users",
      definition: "SELECT id FROM users;",
      columns: ["id"],
      comment: null,
    } satisfies PgView;

    const diff = emptyDiff();
    diff.views.modified["public.active_users"] = {
      from: v,
      to: { ...v, definition: "SELECT id, name FROM users;" },
    };

    const stmts = generateViewStatements(diff);
    expect(stmts[0].sql).toContain("CREATE OR REPLACE VIEW");
  });

  it("generates CREATE/DROP MATERIALIZED VIEW", () => {
    const diff = emptyDiff();
    diff.materializedViews.added["public.mat_v"] = {
      schema: "public",
      name: "mat_v",
      definition: "SELECT 1 AS x",
      columns: ["x"],
      indexes: {},
      comment: null,
    };

    const stmts = generateViewStatements(diff);
    expect(stmts[0].sql).toContain("CREATE MATERIALIZED VIEW");
  });

  it("drops and recreates materialized views on modification", () => {
    const mv = {
      schema: "public",
      name: "mat_v",
      definition: "SELECT 1 AS x",
      columns: ["x"],
      indexes: {},
      comment: null,
    } satisfies PgMaterializedView;

    const diff = emptyDiff();
    diff.materializedViews.modified["public.mat_v"] = {
      from: mv,
      to: { ...mv, definition: "SELECT 2 AS x" },
    };

    const stmts = generateViewStatements(diff);
    expect(stmts).toHaveLength(2);
    expect(stmts[0].sql).toContain("DROP MATERIALIZED VIEW");
    expect(stmts[0].isDestructive).toBe(true);
    expect(stmts[1].sql).toContain("CREATE MATERIALIZED VIEW");
  });
});

// ── Functions ──

describe("generateFunctionStatements", () => {
  const fn: PgFunction = {
    schema: "public",
    name: "add_numbers",
    arguments: "a integer, b integer",
    returnType: "integer",
    language: "sql",
    definition:
      "CREATE OR REPLACE FUNCTION public.add_numbers(a integer, b integer) RETURNS integer LANGUAGE sql AS $$ SELECT a + b $$",
    volatility: "IMMUTABLE",
    securityDefiner: false,
    isProcedure: false,
    comment: null,
  };

  it("generates CREATE FUNCTION from definition", () => {
    const diff = emptyDiff();
    diff.functions.added["public.add_numbers(a integer, b integer)"] = fn;

    const stmts = generateFunctionStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain("CREATE OR REPLACE FUNCTION");
    expect(stmts[0].priority).toBe(180);
  });

  it("generates DROP FUNCTION with arguments", () => {
    const diff = emptyDiff();
    diff.functions.removed["public.add_numbers(a integer, b integer)"] = fn;

    const stmts = generateFunctionStatements(diff);
    expect(stmts[0].sql).toBe(
      'DROP FUNCTION "public"."add_numbers"(a integer, b integer);',
    );
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("uses DROP PROCEDURE for procedures", () => {
    const proc = { ...fn, isProcedure: true };
    const diff = emptyDiff();
    diff.functions.removed["public.add_numbers(a integer, b integer)"] = proc;

    const stmts = generateFunctionStatements(diff);
    expect(stmts[0].sql).toContain("DROP PROCEDURE");
  });
});

// ── Triggers ──

describe("generateTriggerStatements", () => {
  const trigger: PgTrigger = {
    schema: "public",
    name: "trg_updated",
    tableName: "users",
    definition:
      "CREATE TRIGGER trg_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at()",
    timing: "BEFORE",
    events: ["UPDATE"],
    functionName: "set_updated_at",
    level: "ROW",
    comment: null,
  };

  it("generates CREATE TRIGGER from definition", () => {
    const diff = emptyDiff();
    diff.triggers.added["public.trg_updated"] = trigger;

    const stmts = generateTriggerStatements(diff);
    expect(stmts[0].sql).toContain("CREATE TRIGGER trg_updated");
    expect(stmts[0].priority).toBe(190);
  });

  it("generates DROP TRIGGER as destructive", () => {
    const diff = emptyDiff();
    diff.triggers.removed["public.trg_updated"] = trigger;

    const stmts = generateTriggerStatements(diff);
    expect(stmts[0].sql).toBe(
      'DROP TRIGGER "trg_updated" ON "public"."users";',
    );
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("drops and recreates on modification", () => {
    const diff = emptyDiff();
    diff.triggers.modified["public.trg_updated"] = {
      from: trigger,
      to: { ...trigger, timing: "AFTER" },
    };

    const stmts = generateTriggerStatements(diff);
    expect(stmts).toHaveLength(2);
    expect(stmts[0].sql).toContain("DROP TRIGGER");
    expect(stmts[1].sql).toContain("CREATE TRIGGER");
  });
});

// ── Extensions ──

describe("generateExtensionStatements", () => {
  it("generates CREATE EXTENSION IF NOT EXISTS", () => {
    const diff = emptyDiff();
    diff.extensions.added.pgcrypto = {
      name: "pgcrypto",
      schema: "public",
      version: "1.3",
      comment: null,
    };

    const stmts = generateExtensionStatements(diff);
    expect(stmts[0].sql).toBe(
      'CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA "public";',
    );
    expect(stmts[0].priority).toBe(100);
  });

  it("generates DROP EXTENSION IF EXISTS as destructive", () => {
    const diff = emptyDiff();
    diff.extensions.removed.pgcrypto = {
      name: "pgcrypto",
      schema: "public",
      version: "1.3",
      comment: null,
    };

    const stmts = generateExtensionStatements(diff);
    expect(stmts[0].sql).toBe('DROP EXTENSION IF EXISTS "pgcrypto";');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("generates ALTER EXTENSION UPDATE for modifications", () => {
    const ext = {
      name: "pgcrypto",
      schema: "public",
      version: "1.3",
      comment: null,
    } satisfies PgExtension;

    const diff = emptyDiff();
    diff.extensions.modified.pgcrypto = {
      from: ext,
      to: { ...ext, version: "1.4" },
    };

    const stmts = generateExtensionStatements(diff);
    expect(stmts[0].sql).toBe(`ALTER EXTENSION "pgcrypto" UPDATE TO '1.4';`);
  });
});

// ── Domains ──

describe("generateDomainStatements", () => {
  it("generates CREATE DOMAIN with check constraint", () => {
    const diff = emptyDiff();
    diff.domains.added["public.positive_int"] = {
      schema: "public",
      name: "positive_int",
      dataType: "integer",
      defaultValue: "0",
      isNullable: true,
      checkConstraints: [
        { name: "positive_int_check", expression: "CHECK ((VALUE >= 0))" },
      ],
      comment: null,
    };

    const stmts = generateDomainStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain("CREATE DOMAIN");
    expect(stmts[0].sql).toContain("AS integer");
    expect(stmts[0].sql).toContain("DEFAULT 0");
    expect(stmts[0].sql).toContain("CHECK ((VALUE >= 0))");
  });

  it("generates DROP DOMAIN as destructive", () => {
    const diff = emptyDiff();
    diff.domains.removed["public.positive_int"] = {
      schema: "public",
      name: "positive_int",
      dataType: "integer",
      defaultValue: null,
      isNullable: true,
      checkConstraints: [],
      comment: null,
    };

    const stmts = generateDomainStatements(diff);
    expect(stmts[0].sql).toBe('DROP DOMAIN "public"."positive_int";');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("generates ALTER DOMAIN SET/DROP DEFAULT", () => {
    const domain = {
      schema: "public",
      name: "positive_int",
      dataType: "integer",
      defaultValue: null,
      isNullable: true,
      checkConstraints: [],
      comment: null,
    } satisfies PgDomain;

    const diff = emptyDiff();
    diff.domains.modified["public.positive_int"] = {
      from: domain,
      to: { ...domain, defaultValue: "42" },
    };

    const stmts = generateDomainStatements(diff);
    expect(stmts[0].sql).toContain("SET DEFAULT 42");
  });

  it("generates ALTER DOMAIN for nullability changes", () => {
    const domain = {
      schema: "public",
      name: "positive_int",
      dataType: "integer",
      defaultValue: null,
      isNullable: true,
      checkConstraints: [],
      comment: null,
    } satisfies PgDomain;

    const diff = emptyDiff();
    diff.domains.modified["public.positive_int"] = {
      from: domain,
      to: { ...domain, isNullable: false },
    };

    const stmts = generateDomainStatements(diff);
    expect(stmts[0].sql).toContain("SET NOT NULL");
  });

  it("generates ADD/DROP constraint for check changes", () => {
    const domain = {
      schema: "public",
      name: "positive_int",
      dataType: "integer",
      defaultValue: null,
      isNullable: true,
      checkConstraints: [
        { name: "old_check", expression: "CHECK ((VALUE > 0))" },
      ],
      comment: null,
    } satisfies PgDomain;

    const diff = emptyDiff();
    diff.domains.modified["public.positive_int"] = {
      from: domain,
      to: {
        ...domain,
        checkConstraints: [
          { name: "new_check", expression: "CHECK ((VALUE >= 0))" },
        ],
      },
    };

    const stmts = generateDomainStatements(diff);
    const dropCheck = stmts.find((s) => s.sql.includes("DROP CONSTRAINT"));
    const addCheck = stmts.find((s) => s.sql.includes("ADD CONSTRAINT"));
    expect(dropCheck?.sql).toContain('"old_check"');
    expect(dropCheck?.isDestructive).toBe(true);
    expect(addCheck?.sql).toContain('"new_check"');
  });
});

// ── Collations ──

describe("generateCollationStatements", () => {
  it("generates CREATE COLLATION", () => {
    const diff = emptyDiff();
    diff.collations.added["public.my_collation"] = {
      schema: "public",
      name: "my_collation",
      lcCollate: "en_US.UTF-8",
      lcCtype: "en_US.UTF-8",
      provider: "libc",
      comment: null,
    };

    const stmts = generateCollationStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe(
      `CREATE COLLATION "public"."my_collation" (LOCALE = 'en_US.UTF-8', PROVIDER = libc);`,
    );
    expect(stmts[0].priority).toBe(112);
  });

  it("generates DROP COLLATION as destructive", () => {
    const diff = emptyDiff();
    diff.collations.removed["public.my_collation"] = {
      schema: "public",
      name: "my_collation",
      lcCollate: "en_US.UTF-8",
      lcCtype: "en_US.UTF-8",
      provider: "libc",
      comment: null,
    };

    const stmts = generateCollationStatements(diff);
    expect(stmts[0].sql).toBe('DROP COLLATION "public"."my_collation";');
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("drops and recreates on modification", () => {
    const coll = {
      schema: "public",
      name: "my_collation",
      lcCollate: "en_US.UTF-8",
      lcCtype: "en_US.UTF-8",
      provider: "libc",
      comment: null,
    } satisfies PgCollation;

    const diff = emptyDiff();
    diff.collations.modified["public.my_collation"] = {
      from: coll,
      to: { ...coll, lcCollate: "de_DE.UTF-8", lcCtype: "de_DE.UTF-8" },
    };

    const stmts = generateCollationStatements(diff);
    expect(stmts).toHaveLength(2);
    expect(stmts[0].sql).toContain("DROP COLLATION");
    expect(stmts[0].isDestructive).toBe(true);
    expect(stmts[1].sql).toContain("CREATE COLLATION");
    expect(stmts[1].sql).toContain("de_DE.UTF-8");
  });
});

// ── Policies ──

describe("generatePolicyStatements", () => {
  const policy: PgRlsPolicy = {
    schema: "public",
    name: "users_select_policy",
    tableName: "users",
    permissive: true,
    roles: ["authenticated"],
    command: "SELECT",
    usingExpression: "auth.uid() = id",
    withCheckExpression: null,
  };

  it("generates CREATE POLICY", () => {
    const diff = emptyDiff();
    diff.policies.added["public.users_select_policy"] = policy;

    const stmts = generatePolicyStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toContain(
      'CREATE POLICY "users_select_policy" ON "public"."users"',
    );
    expect(stmts[0].sql).toContain("AS PERMISSIVE");
    expect(stmts[0].sql).toContain("FOR SELECT");
    expect(stmts[0].sql).toContain("TO authenticated");
    expect(stmts[0].sql).toContain("USING (auth.uid() = id)");
    expect(stmts[0].priority).toBe(200);
  });

  it("generates RESTRICTIVE policy", () => {
    const diff = emptyDiff();
    diff.policies.added["public.p"] = { ...policy, permissive: false };

    const stmts = generatePolicyStatements(diff);
    expect(stmts[0].sql).toContain("AS RESTRICTIVE");
  });

  it("generates WITH CHECK expression", () => {
    const diff = emptyDiff();
    diff.policies.added["public.p"] = {
      ...policy,
      command: "INSERT",
      withCheckExpression: "auth.uid() = user_id",
    };

    const stmts = generatePolicyStatements(diff);
    expect(stmts[0].sql).toContain("WITH CHECK (auth.uid() = user_id)");
  });

  it("generates DROP POLICY as destructive", () => {
    const diff = emptyDiff();
    diff.policies.removed["public.users_select_policy"] = policy;

    const stmts = generatePolicyStatements(diff);
    expect(stmts[0].sql).toBe(
      'DROP POLICY "users_select_policy" ON "public"."users";',
    );
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("drops and recreates on modification", () => {
    const diff = emptyDiff();
    diff.policies.modified["public.users_select_policy"] = {
      from: policy,
      to: { ...policy, roles: ["admin", "moderator"] },
    };

    const stmts = generatePolicyStatements(diff);
    expect(stmts).toHaveLength(2);
    expect(stmts[0].sql).toContain("DROP POLICY");
    expect(stmts[1].sql).toContain("TO admin, moderator");
  });
});

// ── Privileges ──

describe("generatePrivilegeStatements", () => {
  it("generates GRANT statement", () => {
    const diff = emptyDiff();
    diff.privileges.added["public.users.app_user"] = {
      objectType: "TABLE",
      objectName: '"public"."users"',
      grantee: "app_user",
      privileges: ["SELECT", "INSERT"],
      withGrantOption: false,
    };

    const stmts = generatePrivilegeStatements(diff);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].sql).toBe(
      'GRANT SELECT, INSERT ON TABLE "public"."users" TO "app_user";',
    );
    expect(stmts[0].priority).toBe(250);
  });

  it("generates GRANT with WITH GRANT OPTION", () => {
    const diff = emptyDiff();
    diff.privileges.added["public.users.admin"] = {
      objectType: "TABLE",
      objectName: '"public"."users"',
      grantee: "admin",
      privileges: ["ALL"],
      withGrantOption: true,
    };

    const stmts = generatePrivilegeStatements(diff);
    expect(stmts[0].sql).toContain("WITH GRANT OPTION");
  });

  it("generates REVOKE as destructive", () => {
    const diff = emptyDiff();
    diff.privileges.removed["public.users.app_user"] = {
      objectType: "TABLE",
      objectName: '"public"."users"',
      grantee: "app_user",
      privileges: ["SELECT"],
      withGrantOption: false,
    };

    const stmts = generatePrivilegeStatements(diff);
    expect(stmts[0].sql).toBe(
      'REVOKE SELECT ON TABLE "public"."users" FROM "app_user";',
    );
    expect(stmts[0].isDestructive).toBe(true);
  });

  it("revokes old and grants new on modification", () => {
    const priv = {
      objectType: "TABLE",
      objectName: '"public"."users"',
      grantee: "app_user",
      privileges: ["SELECT"],
      withGrantOption: false,
    } satisfies PgPrivilege;

    const diff = emptyDiff();
    diff.privileges.modified["public.users.app_user"] = {
      from: priv,
      to: { ...priv, privileges: ["SELECT", "UPDATE"] },
    };

    const stmts = generatePrivilegeStatements(diff);
    expect(stmts).toHaveLength(2);
    expect(stmts[0].sql).toContain("REVOKE SELECT");
    expect(stmts[1].sql).toContain("GRANT SELECT, UPDATE");
  });
});
