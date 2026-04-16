import { describe, expect, it } from "vitest";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - Layout System", () => {
  describe("withFormLayout", () => {
    it("attaches a form layout to the schema", () => {
      const productSchema = nu
        .object({
          name: nu.string().withComputedMeta({ label: "Product Name" }),
          price: nu.number().withComputedMeta({ label: "Price" }),
          inStock: nu.boolean().withComputedMeta({ label: "In Stock" }),
          description: nu.string().withComputedMeta({ label: "Description" }),
        })
        .withFormLayout({
          groups: [
            {
              label: "Product Details",
              fields: [
                { name: "name", fieldWidth: 12 },
                { name: "price", fieldWidth: 6 },
                { name: "inStock", fieldWidth: 6 },
                { name: "description", fieldWidth: 12 },
              ],
            },
          ],
        });

      const layout = productSchema.getFormLayout();
      expect(layout).toBeDefined();
      expect(layout?.type).toBe("form");
      expect(layout?.groups).toHaveLength(1);
      expect(layout?.groups[0]?.label).toBe("Product Details");
      expect(layout?.groups[0]?.fields).toHaveLength(4);
    });

    it("fills in type: 'form' automatically — users don't write it", () => {
      const schema = nu.object({ a: nu.string() }).withFormLayout({
        groups: [{ fields: [{ name: "a" }] }],
      });

      expect(schema.getFormLayout()?.type).toBe("form");
    });

    it("returns undefined if no form layout is attached", () => {
      const schema = nu.object({ a: nu.string() });
      expect(schema.getFormLayout()).toBeUndefined();
    });

    it("replaces a previously attached form layout", () => {
      const schema = nu
        .object({ a: nu.string(), b: nu.number() })
        .withFormLayout({ groups: [{ fields: [{ name: "a" }] }] })
        .withFormLayout({ groups: [{ fields: [{ name: "b" }] }] });

      const layout = schema.getFormLayout();
      expect(layout?.groups[0]?.fields).toHaveLength(1);
      expect(layout?.groups[0]?.fields[0]?.name).toBe("b");
    });

    it("preserves className / config / metadata on the layout", () => {
      const schema = nu.object({ a: nu.string() }).withFormLayout({
        className: "my-form",
        config: { gap: "1rem" },
        metadata: { experimental: true },
        groups: [{ fields: [{ name: "a" }] }],
      });

      const layout = schema.getFormLayout();
      expect(layout?.className).toBe("my-form");
      expect(layout?.config?.gap).toBe("1rem");
      expect(layout?.metadata?.experimental).toBe(true);
    });
  });

  describe("withTableLayout", () => {
    it("attaches a table layout with fields, widths, and pinning", () => {
      const ticketSchema = nu
        .object({
          id: nu.number(),
          title: nu.string(),
          status: nu.string(),
        })
        .withTableLayout({
          fields: [
            { name: "id", label: "ID", columnWidthPx: 80, pinned: true },
            { name: "title", label: "Title", columnWidthPx: 300 },
            { name: "status", label: "Status", columnWidthPx: 150 },
          ],
        });

      const layout = ticketSchema.getTableLayout();
      expect(layout).toBeDefined();
      expect(layout?.type).toBe("table");
      expect(layout?.fields).toHaveLength(3);
      expect(layout?.fields[0]?.pinned).toBe(true);
    });

    it("fills in type: 'table' automatically", () => {
      const schema = nu
        .object({ a: nu.string() })
        .withTableLayout({ fields: [{ name: "a" }] });

      expect(schema.getTableLayout()?.type).toBe("table");
    });

    it("returns undefined if no table layout is attached", () => {
      const schema = nu.object({ a: nu.string() });
      expect(schema.getTableLayout()).toBeUndefined();
    });

    it("preserves table metadata like patchable + linkFields", () => {
      const schema = nu
        .object({ id: nu.number(), title: nu.string() })
        .withTableLayout({
          fields: [{ name: "id" }, { name: "title", editable: true }],
          metadata: { patchable: true, linkFields: ["title"] },
        });

      const layout = schema.getTableLayout();
      expect(layout?.metadata?.patchable).toBe(true);
      expect(layout?.metadata?.linkFields).toEqual(["title"]);
    });
  });

  describe("form + table layouts coexist", () => {
    it("a schema can have both a form layout and a table layout", () => {
      const schema = nu
        .object({ id: nu.number(), title: nu.string() })
        .withFormLayout({ groups: [{ fields: [{ name: "title" }] }] })
        .withTableLayout({ fields: [{ name: "id" }, { name: "title" }] });

      expect(schema.getFormLayout()).toBeDefined();
      expect(schema.getTableLayout()).toBeDefined();
    });
  });

  describe("type-level safety on layout fields", () => {
    it("type-checks field names against the shape (compile-time check)", () => {
      // This test just exercises a valid usage — the real check is that
      // misspelled field names would fail to compile.
      const schema = nu
        .object({ name: nu.string(), age: nu.number() })
        .withFormLayout({
          groups: [{ fields: [{ name: "name" }, { name: "age" }] }],
        });

      expect(schema.getFormLayout()?.groups[0]?.fields).toHaveLength(2);
    });
  });
});
