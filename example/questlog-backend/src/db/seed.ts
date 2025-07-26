#!/usr/bin/env tsx

import { faker } from "@faker-js/faker";
import type { InferInsertModel } from "drizzle-orm";
import { loadEnvironment } from "../helpers/env";
import { getDb } from "./helpers/drizzle";
import { ticketsTable } from "./schema/ticket";

// Load environment variables
loadEnvironment();

type NewTicket = InferInsertModel<typeof ticketsTable>;

// Default number of tickets to generate
const DEFAULT_TICKET_COUNT = 10;

/**
 * Generate fake ticket data using faker.js
 */
function generateFakeTicket(): NewTicket {
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
    title,
    description,
  };
}

/**
 * Seed the database with fake tickets
 */
async function seedTickets(count: number = DEFAULT_TICKET_COUNT) {
  console.log(`🌱 Starting database seed with ${count} tickets...`);

  const db = getDb();

  // Clear existing tickets before seeding
  console.log("🗑️  Clearing existing tickets...");
  await db.delete(ticketsTable);

  // Generate and insert fake tickets
  console.log("📝 Generating fake tickets...");
  const fakeTickets = Array.from({ length: count }, generateFakeTicket);

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
seedTickets(count).catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
