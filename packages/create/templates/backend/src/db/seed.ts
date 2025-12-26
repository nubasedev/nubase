import { loadEnv } from "../helpers/env";

loadEnv();

async function seed() {
	const { faker } = await import("@faker-js/faker");
	const bcrypt = await import("bcrypt");
	const { getAdminDb } = await import("./helpers/drizzle");
	const { tickets, userWorkspaces, users, workspaces } = await import(
		"./schema"
	);
	console.log("Seeding database...");

	const db = getAdminDb();

	// Create tavern workspace
	const [workspace] = await db
		.insert(workspaces)
		.values({
			slug: "tavern",
			name: "Tavern",
		})
		.onConflictDoNothing()
		.returning();

	const workspaceId = workspace?.id ?? 1;
	console.log(`Created/found workspace: ${workspaceId}`);

	// Create admin user
	const passwordHash = await bcrypt.default.hash("password123", 10);
	const [user] = await db
		.insert(users)
		.values({
			email: "admin@example.com",
			username: "admin",
			passwordHash,
		})
		.onConflictDoNothing()
		.returning();

	if (user) {
		console.log(`Created user: ${user.email}`);

		// Link user to workspace
		await db
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

	await db.insert(tickets).values(ticketData).onConflictDoNothing();
	console.log(`Created ${ticketData.length} sample tickets`);

	console.log("Database seeded successfully!");
	console.log("\nTest credentials:");
	console.log("  Username: admin");
	console.log("  Password: password123");

	process.exit(0);
}

seed().catch((error) => {
	console.error("Seed failed:", error);
	process.exit(1);
});
