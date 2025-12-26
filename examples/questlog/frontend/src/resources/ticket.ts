import { createResource, showToast } from "@nubase/frontend";
import { TrashIcon } from "lucide-react";
import { apiEndpoints } from "questlog-schema";

export const ticketResource = createResource("ticket")
  .withApiEndpoints(apiEndpoints)
  .withActions({
    delete: {
      label: "Delete",
      icon: TrashIcon,
      variant: "destructive" as const,
      onExecute: async ({ selectedIds, context }) => {
        if (!selectedIds || selectedIds.length === 0) {
          showToast("No tickets selected for deletion", "error");
          return;
        }

        const ticketCount = selectedIds.length;
        const ticketLabel = ticketCount === 1 ? "ticket" : "tickets";

        // Show confirmation dialog
        const confirmed = await new Promise<boolean>((resolve) => {
          context.dialog.openDialog({
            title: "Delete Tickets",
            content: `Are you sure you want to delete ${ticketCount} ${ticketLabel}? This action cannot be undone.`,
            confirmText: "Delete",
            confirmVariant: "destructive",
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });

        if (!confirmed) {
          return;
        }

        try {
          // Delete all selected tickets in parallel
          await Promise.all(
            selectedIds.map((id) =>
              context.http.deleteTicket({
                params: { id: Number(id) },
              }),
            ),
          );

          showToast(
            `${ticketCount} ${ticketLabel} deleted successfully`,
            "default",
          );

          // Query invalidation is now handled automatically by ResourceSearchViewRenderer
        } catch (error) {
          console.error("Error deleting tickets:", error);
          showToast(`Failed to delete ${ticketLabel}`, "error");
        }
      },
    },
  })
  .withViews({
    create: {
      type: "resource-create",
      id: "create-ticket",
      title: "Create Ticket",
      schemaPost: (api) => api.postTicket.requestBody,
      breadcrumbs: [
        { label: "Tickets", to: "/r/ticket/search" },
        "Create Ticket",
      ],
      onSubmit: async ({ data, context }) => {
        return context.http.postTicket({ data });
      },
    },
    view: {
      type: "resource-view",
      id: "view-ticket",
      title: "View Ticket",
      schemaGet: (api) => api.getTicket.responseBody.omit("id"),
      schemaParams: (api) => api.getTicket.requestParams,
      breadcrumbs: ({ context, data }) => [
        { label: "Tickets", to: "/r/ticket/search" },
        {
          label: data?.title || `Ticket #${context.params?.id || "Unknown"}`,
        },
      ],
      onLoad: async ({ context }) => {
        return context.http.getTicket({
          params: { id: context.params.id },
        });
      },
      onPatch: async ({ data, context }) => {
        return context.http.patchTicket({
          params: { id: context.params.id },
          data: data,
        });
      },
    },
    search: {
      type: "resource-search",
      id: "search-tickets",
      title: "Search Tickets",
      schemaGet: (api) => api.getTickets.responseBody,
      breadcrumbs: () => [{ label: "Tickets", to: "/r/ticket/search" }],
      tableActions: ["delete"],
      rowActions: ["delete"],
      onLoad: async ({ context }) => {
        return context.http.getTickets({
          params: {},
        });
      },
    },
  });
