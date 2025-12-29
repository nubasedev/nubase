import { nu } from "@nubase/core";

export const ticketBaseSchema = nu
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
	})
	.withId("id")
	.withTableLayouts({
		default: {
			fields: [
				{ name: "id", columnWidthPx: 80, pinned: true },
				{ name: "title", columnWidthPx: 300, pinned: true },
				{ name: "description", columnWidthPx: 400 },
			],
			metadata: {
				linkFields: ["title"],
			},
		},
	});
