import { loadEnv } from "../helpers/env";

loadEnv();

async function seed() {
  const { faker } = await import("@faker-js/faker");
  const bcrypt = await import("bcryptjs");
  const { sql } = await import("kysely");
  const { getDb } = await import("./helpers/kysely");
  console.log("Seeding database...");

  const db = getDb();

  // Clear existing data using TRUNCATE (respects FKs with CASCADE)
  await sql`TRUNCATE TABLE tickets, user_workspaces, users, workspaces RESTART IDENTITY CASCADE`.execute(db);

  // Create tavern workspace
  const workspace = await db
    .insertInto("workspaces")
    .values({
      slug: "tavern",
      name: "Tavern",
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  console.log(`Created workspace: ${workspace.id}`);

  // Create admin user
  const passwordHash = await bcrypt.default.hash("password123", 10);
  const user = await db
    .insertInto("users")
    .values({
      email: "admin@example.com",
      displayName: "Admin User",
      passwordHash,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  console.log(`Created user: ${user.email}`);

  // Link user to workspace
  await db
    .insertInto("userWorkspaces")
    .values({
      userId: user.id,
      workspaceId: workspace.id,
    })
    .execute();

  // Create sample tickets
  const ticketData = Array.from({ length: 10 }, () => ({
    workspaceId: workspace.id,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
  }));

  await db.insertInto("tickets").values(ticketData).execute();
  console.log(`Created ${ticketData.length} sample tickets`);

  console.log("Database seeded successfully!");
  console.log("\nTest credentials:");
  console.log("  Email: admin@example.com");
  console.log("  Password: password123");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
