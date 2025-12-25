import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { loadEnv } from "../helpers/env";
import { adminDb } from "./helpers/drizzle";
import { tickets, userWorkspaces, users, workspaces } from "./schema";

loadEnv();

async function seed() {
	console.log("Seeding database...");

	// Create default workspace
	const [workspace] = await adminDb
		.insert(workspaces)
		.values({
			slug: "default",
			name: "Default Workspace",
		})
		.onConflictDoNothing()
		.returning();

	const workspaceId = workspace?.id ?? 1;
	console.log(`Created/found workspace: ${workspaceId}`);

	// Create test user
	const passwordHash = await bcrypt.hash("password123", 10);
	const [user] = await adminDb
		.insert(users)
		.values({
			email: "demo@example.com",
			username: "demo",
			passwordHash,
		})
		.onConflictDoNothing()
		.returning();

	if (user) {
		console.log(`Created user: ${user.email}`);

		// Link user to workspace
		await adminDb
			.insert(userWorkspaces)
			.values({
				userId: user.id,
				workspaceId,
			})
			.onConflictDoNothing();
	}

	// Create sample tickets
	const ticketData = Array.from({ length: 10 }, () => ({
		workspaceId,
		title: faker.lorem.sentence(),
		description: faker.lorem.paragraph(),
	}));

	await adminDb.insert(tickets).values(ticketData).onConflictDoNothing();
	console.log(`Created ${ticketData.length} sample tickets`);

	console.log("Database seeded successfully!");
	console.log("\nTest credentials:");
	console.log("  Email: demo@example.com");
	console.log("  Password: password123");

	process.exit(0);
}

seed().catch((error) => {
	console.error("Seed failed:", error);
	process.exit(1);
});
