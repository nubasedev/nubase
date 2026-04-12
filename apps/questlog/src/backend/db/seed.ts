#!/usr/bin/env tsx

import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { sql } from "kysely";
import { loadEnvironment } from "../helpers/env";
import { getDb } from "./helpers/kysely";

// Load environment variables
loadEnvironment();

// Default number of tickets to generate
const DEFAULT_TICKET_COUNT = 10;

// Default workspace configuration
const DEFAULT_WORKSPACE = {
  slug: "tavern",
  name: "The Tavern",
};

interface NewTicket {
  workspaceId: number;
  title: string;
  description: string | null;
}

/**
 * Generate fake ticket data using faker.js
 */
function generateFakeTicket(workspaceId: number): NewTicket {
  const ticketTypes = [
    "Bug Report",
    "Feature Request",
    "Support Ticket",
    "Enhancement",
    "Documentation",
    "Performance Issue",
    "Security Vulnerability",
    "User Interface",
    "API Integration",
    "Database Issue",
  ];

  const ticketType = faker.helpers.arrayElement(ticketTypes);
  const component = faker.hacker.noun();
  const action = faker.hacker.verb();

  // Generate realistic ticket titles
  const titleFormats = [
    `${ticketType}: ${faker.hacker.phrase()}`,
    `Unable to ${action} ${component} in ${faker.company.buzzNoun()}`,
    `${faker.hacker.abbreviation()} ${ticketType.toLowerCase()} with ${component}`,
    `Add ${action} functionality to ${component}`,
    `Fix ${component} ${faker.hacker.ingverb()} issue`,
    `Improve ${component} performance in ${faker.company.buzzNoun()}`,
    `Update ${component} to support ${faker.hacker.noun()}`,
  ];

  const title = faker.helpers.arrayElement(titleFormats);

  // Generate detailed descriptions (some tickets may not have descriptions)
  const description = faker.datatype.boolean(0.8)
    ? faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 }), "\n\n")
    : null;

  return {
    workspaceId,
    title,
    description,
  };
}

/**
 * Seed the workspaces table with the default workspace
 */
async function seedWorkspaces() {
  console.log("🏠 Seeding workspaces...");

  const db = getDb();

  // Clear existing data using TRUNCATE (respects FKs with CASCADE)
  console.log("🗑️  Clearing existing data...");
  await sql`TRUNCATE TABLE tickets, user_workspaces, users, workspaces RESTART IDENTITY CASCADE`.execute(
    db,
  );

  // Create default workspace
  const insertedWorkspace = await db
    .insertInto("workspaces")
    .values({
      slug: DEFAULT_WORKSPACE.slug,
      name: DEFAULT_WORKSPACE.name,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  console.log(
    `✅ Created workspace: ${insertedWorkspace.name} (${insertedWorkspace.slug})`,
  );

  return insertedWorkspace;
}

/**
 * Seed the users table with a test user and link to the given workspace
 */
async function seedUsers(workspaceId: number) {
  console.log("👤 Seeding users...");

  const db = getDb();

  // Create a test user with hashed password (root-level, no workspaceId)
  const passwordHash = await bcrypt.hash("password123", 12);

  const insertedUser = await db
    .insertInto("users")
    .values({
      email: "admin@example.com",
      displayName: "Admin User",
      passwordHash,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Link user to workspace via user_workspaces table
  await db
    .insertInto("userWorkspaces")
    .values({
      userId: insertedUser.id,
      workspaceId,
    })
    .execute();

  console.log(`✅ Created user: ${insertedUser.email} (password: password123)`);
}

/**
 * Seed the database with fake tickets for the given workspace
 */
async function seedTickets(count: number, workspaceId: number) {
  console.log(`📝 Generating ${count} fake tickets...`);

  const db = getDb();

  // Generate and insert fake tickets
  const fakeTickets = Array.from({ length: count }, () =>
    generateFakeTicket(workspaceId),
  );

  console.log("💾 Inserting tickets into database...");
  const insertedTickets = await db
    .insertInto("tickets")
    .values(fakeTickets)
    .returningAll()
    .execute();

  console.log(`✅ Successfully seeded ${insertedTickets.length} tickets!`);

  // Show some examples
  console.log("\n📋 Sample tickets created:");
  insertedTickets.slice(0, 3).forEach((ticket, index) => {
    console.log(`${index + 1}. ${ticket.title}`);
    if (ticket.description) {
      const shortDesc =
        ticket.description.length > 100
          ? `${ticket.description.substring(0, 100)}...`
          : ticket.description;
      console.log(`   ${shortDesc}`);
    }
    console.log("");
  });
}

/**
 * Main seeding function
 */
async function main(ticketCount: number = DEFAULT_TICKET_COUNT) {
  console.log(`🌱 Starting database seed...`);
  console.log(
    `   Workspace: ${DEFAULT_WORKSPACE.name} (${DEFAULT_WORKSPACE.slug})`,
  );
  console.log(`   Tickets: ${ticketCount}`);
  console.log("");

  // Seed workspaces first (clears all data)
  const workspace = await seedWorkspaces();

  // Seed users for the workspace
  await seedUsers(workspace.id);

  // Seed tickets for the workspace
  await seedTickets(ticketCount, workspace.id);

  console.log("\n🎉 Database seeding complete!");
  process.exit(0);
}

// Handle command line arguments
const count = process.argv[2]
  ? parseInt(process.argv[2], 10)
  : DEFAULT_TICKET_COUNT;

if (Number.isNaN(count) || count <= 0) {
  console.error("❌ Please provide a valid number of tickets to generate");
  console.error("Usage: tsx src/db/seed.ts [count]");
  process.exit(1);
}

// Run the seeding
main(count).catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
