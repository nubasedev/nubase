import { nu } from "@nubase/core";

/**
 * Base ticket schema - matches database structure.
 * Use ticketListSchema for list/table views that need enriched data.
 */
export const ticketSchema = nu
	.object({
		id: nu.number(),
		title: nu.string().withComputedMeta({
			label: "Title",
			description: "Enter the title of the ticket",
		}),
		description: nu.string().optional().withComputedMeta({
			label: "Description",
			description: "Enter the description of the ticket",
			renderer: "multiline",
		}),
		assigneeId: nu.number().optional().withComputedMeta({
			label: "Assignee",
			description: "Select a user to assign this ticket to",
			renderer: "lookup",
			lookupResource: "user",
		}),
	})
	.withId("id");

/**
 * Extended ticket schema for list/table views.
 * Includes joined assignee fields (name, email) from the users table.
 */
export const ticketListSchema = ticketSchema
	.extend({
		assigneeName: nu.string().optional().withComputedMeta({
			label: "Assignee Name",
		}),
		assigneeEmail: nu.string().optional().withComputedMeta({
			label: "Assignee Email",
		}),
	})
	.withTableLayouts({
		default: {
			fields: [
				{ name: "id", label: "ID", columnWidthPx: 80, pinned: true },
				{ name: "title", label: "Title", columnWidthPx: 300, pinned: true },
				{ name: "assigneeName", label: "Assignee Name", columnWidthPx: 150 },
				{ name: "assigneeEmail", label: "Assignee Email", columnWidthPx: 200 },
			],
		},
	});
