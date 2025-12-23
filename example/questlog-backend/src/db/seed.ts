#!/usr/bin/env tsx

import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import type { InferInsertModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { loadEnvironment } from "../helpers/env";
import { getAdminDb } from "./helpers/drizzle";
import { tenantsTable } from "./schema/tenant";
import { ticketsTable } from "./schema/ticket";
import { usersTable } from "./schema/user";

// Load environment variables
loadEnvironment();

type NewTicket = InferInsertModel<typeof ticketsTable>;

// Default number of tickets to generate
const DEFAULT_TICKET_COUNT = 10;

// Default tenant configuration
const DEFAULT_TENANT = {
  slug: "tavern",
  name: "The Tavern",
};

/**
 * Generate fake ticket data using faker.js
 */
function generateFakeTicket(tenantId: number): NewTicket {
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
    tenantId,
    title,
    description,
  };
}

/**
 * Seed the tenants table with the default tenant
 */
async function seedTenants() {
  console.log("🏠 Seeding tenants...");

  const db = getAdminDb();

  // Clear existing data using TRUNCATE (bypasses RLS, respects FKs with CASCADE)
  console.log("🗑️  Clearing existing data...");
  await db.execute(
    sql`TRUNCATE TABLE tickets, users, tenants RESTART IDENTITY CASCADE`,
  );

  // Create default tenant
  const insertedTenants = await db
    .insert(tenantsTable)
    .values({
      slug: DEFAULT_TENANT.slug,
      name: DEFAULT_TENANT.name,
    })
    .returning();

  console.log(
    `✅ Created tenant: ${insertedTenants[0].name} (${insertedTenants[0].slug})`,
  );

  return insertedTenants[0];
}

/**
 * Seed the users table with a test user for the given tenant
 */
async function seedUsers(tenantId: number) {
  console.log("👤 Seeding users...");

  const db = getAdminDb();

  // Create a test user with hashed password
  const passwordHash = await bcrypt.hash("password123", 12);

  const insertedUsers = await db
    .insert(usersTable)
    .values({
      tenantId,
      email: "admin@example.com",
      username: "admin",
      passwordHash,
    })
    .returning();

  console.log(
    `✅ Created user: ${insertedUsers[0].username} (password: password123)`,
  );
}

/**
 * Seed the database with fake tickets for the given tenant
 */
async function seedTickets(count: number, tenantId: number) {
  console.log(`📝 Generating ${count} fake tickets...`);

  const db = getAdminDb();

  // Generate and insert fake tickets
  const fakeTickets = Array.from({ length: count }, () =>
    generateFakeTicket(tenantId),
  );

  console.log("💾 Inserting tickets into database...");
  const insertedTickets = await db
    .insert(ticketsTable)
    .values(fakeTickets)
    .returning();

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
  console.log(`   Tenant: ${DEFAULT_TENANT.name} (${DEFAULT_TENANT.slug})`);
  console.log(`   Tickets: ${ticketCount}`);
  console.log("");

  // Seed tenants first (clears all data)
  // Note: Using admin connection which bypasses RLS
  const tenant = await seedTenants();

  // Seed users for the tenant
  await seedUsers(tenant.id);

  // Seed tickets for the tenant
  await seedTickets(ticketCount, tenant.id);

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
