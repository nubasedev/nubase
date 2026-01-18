import { nu } from "@nubase/core";

export const ticketSchema = nu
	.object({
		id: nu.number(),
		title: nu.string().withMeta({
			label: "Title",
			description: "Enter the title of the ticket",
		}),
		description: nu.string().optional().withMeta({
			label: "Description",
			description: "Enter the description of the ticket",
			renderer: "multiline",
		}),
		assigneeId: nu.number().optional().withMeta({
			label: "Assignee",
			description: "Select a user to assign this ticket to",
			renderer: "lookup",
			lookupResource: "user",
		}),
	})
	.withId("id")
	.withTableLayouts({
		default: {
			fields: [
				{ name: "id", columnWidthPx: 80, pinned: true },
				{ name: "title", columnWidthPx: 300, pinned: true },
				{ name: "description", columnWidthPx: 400 },
				{ name: "assigneeId", columnWidthPx: 150 },
			],
			metadata: {
				linkFields: ["title"],
			},
		},
	});
