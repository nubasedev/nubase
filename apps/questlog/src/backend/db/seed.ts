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
  teamId: number | null;
}

const DEFAULT_TEAMS = [
  { name: "Engineering", description: "Builds and maintains the product." },
  { name: "Product", description: "Owns roadmap and customer requirements." },
  {
    name: "Support",
    description: "Helps customers and triages incoming issues.",
  },
];

/**
 * Generate fake ticket data using faker.js
 */
function generateFakeTicket(workspaceId: number, teamIds: number[]): NewTicket {
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

  // ~50% chance of being assigned to a team
  const teamId =
    teamIds.length > 0 && faker.datatype.boolean(0.5)
      ? faker.helpers.arrayElement(teamIds)
      : null;

  return {
    workspaceId,
    title,
    description,
    teamId,
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
  await sql`TRUNCATE TABLE tickets, teams, user_workspaces, users, workspaces RESTART IDENTITY CASCADE`.execute(
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

  return insertedUser;
}

/**
 * Seed teams for the given workspace and place the given user on the first team.
 * Returns the inserted team ids so seeded tickets can be linked to teams.
 */
async function seedTeams(workspaceId: number, userId: number) {
  console.log("👥 Seeding teams...");

  const db = getDb();

  const insertedTeams = await db
    .insertInto("teams")
    .values(
      DEFAULT_TEAMS.map((t) => ({
        workspaceId,
        name: t.name,
        description: t.description,
      })),
    )
    .returningAll()
    .execute();

  await db
    .updateTable("users")
    .set({ teamId: insertedTeams[0].id })
    .where("id", "=", userId)
    .execute();

  console.log(
    `✅ Created ${insertedTeams.length} teams and placed user on "${insertedTeams[0].name}"`,
  );

  return insertedTeams.map((t) => t.id);
}

/**
 * Seed the database with fake tickets for the given workspace
 */
async function seedTickets(
  count: number,
  workspaceId: number,
  teamIds: number[],
) {
  console.log(`📝 Generating ${count} fake tickets...`);

  const db = getDb();

  // Generate and insert fake tickets
  const fakeTickets = Array.from({ length: count }, () =>
    generateFakeTicket(workspaceId, teamIds),
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
  const user = await seedUsers(workspace.id);

  // Seed teams for the workspace and add the user to all of them
  const teamIds = await seedTeams(workspace.id, user.id);

  // Seed tickets for the workspace; ~half get a random team
  await seedTickets(ticketCount, workspace.id, teamIds);

  console.log("\n🎉 Database seeding complete!");
  process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);
let count = DEFAULT_TICKET_COUNT;
let env = "local";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--env" && args[i + 1]) {
    env = args[i + 1];
    i++;
  } else {
    const parsed = Number.parseInt(args[i], 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      count = parsed;
    }
  }
}

// Override DATABASE_URL for non-local environments
if (env === "prod" || env === "production") {
  const prodUrl = process.env.QUESTLOG_PROD_DATABASE_URL;
  if (!prodUrl) {
    console.error(
      "❌ QUESTLOG_PROD_DATABASE_URL is not set. Cannot seed production.",
    );
    process.exit(1);
  }
  process.env.DATABASE_URL = prodUrl;
  console.log(`🌍 Seeding PRODUCTION database`);
} else {
  console.log(`🏠 Seeding local database`);
}

// Run the seeding
main(count).catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
