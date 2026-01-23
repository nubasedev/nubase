import { describe, expect, it } from "vitest";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - Layout System", () => {
  it("should create an object schema with form layouts", () => {
    const productSchema = nu
      .object({
        name: nu.string().withComputedMeta({ label: "Product Name" }),
        price: nu.number().withComputedMeta({ label: "Price" }),
        inStock: nu.boolean().withComputedMeta({ label: "In Stock" }),
        description: nu.string().withComputedMeta({ label: "Description" }),
      })
      .withFormLayouts({
        default: {
          type: "form",
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
        },
        compact: {
          type: "form",
          groups: [
            {
              label: "Basic Info",
              fields: [
                { name: "name", fieldWidth: 8 },
                { name: "price", fieldWidth: 4 },
              ],
            },
            {
              label: "Details",
              fields: [
                { name: "inStock", fieldWidth: 3 },
                { name: "description", fieldWidth: 9 },
              ],
            },
          ],
        },
      });

    expect(productSchema).toBeDefined();
    expect(productSchema._layouts).toBeDefined();
    expect(Object.keys(productSchema._layouts)).toEqual(["default", "compact"]);
  });

  it("should retrieve form layouts by name", () => {
    const schema = nu
      .object({
        field1: nu.string(),
        field2: nu.number(),
      })
      .withFormLayouts({
        layout1: {
          type: "form",
          groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
        },
        layout2: {
          type: "grid",
          groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
        },
      });

    const layout1 = schema.getLayout("layout1");
    const layout2 = schema.getLayout("layout2");
    const nonExistent = schema.getLayout("nonexistent");

    expect(layout1).toBeDefined();
    expect(layout1?.type).toBe("form");
    expect(layout2).toBeDefined();
    expect(layout2?.type).toBe("grid");
    expect(nonExistent).toBeUndefined();
  });

  it("should check if form layouts exist", () => {
    const schema = nu
      .object({
        field1: nu.string(),
      })
      .withFormLayouts({
        myLayout: {
          type: "form",
          groups: [{ fields: [{ name: "field1" }] }],
        },
      });

    expect(schema.hasLayout("myLayout")).toBe(true);
    expect(schema.hasLayout("nonexistent")).toBe(false);
  });

  it("should get all form layout names", () => {
    const schema = nu
      .object({
        field1: nu.string(),
        field2: nu.number(),
      })
      .withFormLayouts({
        default: {
          type: "form",
          groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
        },
        compact: {
          type: "grid",
          groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
        },
        detailed: {
          type: "accordion",
          groups: [{ fields: [{ name: "field1" }, { name: "field2" }] }],
        },
      });

    const layoutNames = schema.getLayoutNames();
    expect(layoutNames).toEqual(["default", "compact", "detailed"]);
  });

  it("should ensure type safety for field names in form layouts", () => {
    const schema = nu.object({
      validField1: nu.string(),
      validField2: nu.number(),
    });

    // This should compile successfully with valid field names
    const validLayout = schema.withFormLayouts({
      validLayout: {
        type: "form",
        groups: [
          {
            fields: [
              { name: "validField1", fieldWidth: 6 },
              { name: "validField2", fieldWidth: 6 },
            ],
          },
        ],
      },
    });

    expect(validLayout).toBeDefined();
    expect(validLayout.hasLayout("validLayout")).toBe(true);

    const layout = validLayout.getLayout("validLayout");
    expect(layout).toBeDefined();
    if (layout) {
      expect(layout.groups[0]?.fields).toHaveLength(2);
      expect(layout.groups[0]?.fields[0]?.name).toBe("validField1");
      expect(layout.groups[0]?.fields[1]?.name).toBe("validField2");
    }
  });

  it("should support complex form layout configurations", () => {
    const schema = nu
      .object({
        title: nu.string(),
        subtitle: nu.string(),
        content: nu.string(),
        published: nu.boolean(),
        tags: nu.string(), // In a real implementation, this might be an array schema
      })
      .withFormLayouts({
        editor: {
          type: "form",
          className: "editor-layout",
          config: {
            columns: 12,
            gap: "1rem",
          },
          groups: [
            {
              label: "Header",
              description: "Main title and subtitle",
              className: "header-group",
              collapsible: false,
              fields: [
                { name: "title", fieldWidth: 12, className: "title-field" },
                {
                  name: "subtitle",
                  fieldWidth: 12,
                  className: "subtitle-field",
                },
              ],
            },
            {
              label: "Content",
              description: "Main article content",
              className: "content-group",
              collapsible: true,
              defaultCollapsed: false,
              fields: [{ name: "content", fieldWidth: 12 }],
            },
            {
              label: "Meta",
              className: "meta-group",
              fields: [
                { name: "published", fieldWidth: 4 },
                { name: "tags", fieldWidth: 8 },
              ],
            },
          ],
        },
      });

    const layout = schema.getLayout("editor");
    expect(layout).toBeDefined();
    expect(layout?.type).toBe("form");
    expect(layout?.className).toBe("editor-layout");
    expect(layout?.config?.columns).toBe(12);
    expect(layout?.config?.gap).toBe("1rem");
    expect(layout?.groups).toHaveLength(3);

    const headerGroup = layout?.groups[0];
    expect(headerGroup?.label).toBe("Header");
    expect(headerGroup?.description).toBe("Main title and subtitle");
    expect(headerGroup?.className).toBe("header-group");
    expect(headerGroup?.collapsible).toBe(false);
    expect(headerGroup?.fields).toHaveLength(2);

    const contentGroup = layout?.groups[1];
    expect(contentGroup?.collapsible).toBe(true);
    expect(contentGroup?.defaultCollapsed).toBe(false);

    const titleField = headerGroup?.fields[0];
    expect(titleField?.name).toBe("title");
    expect(titleField?.fieldWidth).toBe(12);
    expect(titleField?.className).toBe("title-field");
  });

  it("should support field hiding in form layouts", () => {
    const schema = nu
      .object({
        publicField: nu.string(),
        internalField: nu.string(),
        debugField: nu.number(),
      })
      .withFormLayouts({
        public: {
          type: "form",
          groups: [
            {
              label: "Public Fields",
              fields: [
                { name: "publicField", fieldWidth: 12 },
                { name: "internalField", fieldWidth: 12, hidden: true },
                { name: "debugField", fieldWidth: 12, hidden: true },
              ],
            },
          ],
        },
        debug: {
          type: "form",
          groups: [
            {
              label: "All Fields",
              fields: [
                { name: "publicField", fieldWidth: 4 },
                { name: "internalField", fieldWidth: 4 },
                { name: "debugField", fieldWidth: 4 },
              ],
            },
          ],
        },
      });

    const publicLayout = schema.getLayout("public");
    const debugLayout = schema.getLayout("debug");

    expect(publicLayout).toBeDefined();
    expect(debugLayout).toBeDefined();

    if (publicLayout) {
      const fields = publicLayout.groups[0]?.fields;
      expect(fields?.[0]?.hidden).toBeUndefined();
      expect(fields?.[1]?.hidden).toBe(true);
      expect(fields?.[2]?.hidden).toBe(true);
    }

    if (debugLayout) {
      const fields = debugLayout.groups[0]?.fields;
      expect(fields?.[0]?.hidden).toBeUndefined();
      expect(fields?.[1]?.hidden).toBeUndefined();
      expect(fields?.[2]?.hidden).toBeUndefined();
    }
  });

  describe("Table Layouts", () => {
    it("should create an object schema with table layouts", () => {
      const ticketSchema = nu
        .object({
          id: nu.number().withComputedMeta({ label: "ID" }),
          title: nu.string().withComputedMeta({ label: "Title" }),
          status: nu.string().withComputedMeta({ label: "Status" }),
          priority: nu.string().withComputedMeta({ label: "Priority" }),
          assignee: nu.string().withComputedMeta({ label: "Assignee" }),
          createdAt: nu.string().withComputedMeta({ label: "Created" }),
        })
        .withTableLayouts({
          default: {
            fields: [
              { name: "id", columnWidthPx: 80 },
              { name: "title", columnWidthPx: 200 },
              { name: "status", columnWidthPx: 120 },
              { name: "priority", columnWidthPx: 120 },
              { name: "assignee", columnWidthPx: 150 },
              { name: "createdAt", columnWidthPx: 100 },
            ],
            metadata: {
              linkFields: ["title"],
            },
          },
          compact: {
            fields: [
              { name: "id", columnWidthPx: 100 },
              { name: "title", columnWidthPx: 300 },
              { name: "status", columnWidthPx: 250 },
            ],
            metadata: {
              linkFields: ["id", "title"],
            },
          },
        });

      expect(ticketSchema).toBeDefined();
      expect(ticketSchema._layouts).toBeDefined();
      expect(Object.keys(ticketSchema._layouts)).toEqual([
        "default",
        "compact",
      ]);

      const defaultLayout = ticketSchema.getLayout("default");
      expect(defaultLayout).toBeDefined();
      expect(defaultLayout?.type).toBe("table");
      if (defaultLayout?.type === "table") {
        expect(defaultLayout.fields).toHaveLength(6);
      }
      expect(defaultLayout?.metadata?.linkFields).toEqual(["title"]);

      const compactLayout = ticketSchema.getLayout("compact");
      expect(compactLayout).toBeDefined();
      expect(compactLayout?.type).toBe("table");
      if (compactLayout?.type === "table") {
        expect(compactLayout.fields).toHaveLength(3);
      }
      expect(compactLayout?.metadata?.linkFields).toEqual(["id", "title"]);
    });

    it("should support table layouts without linkFields", () => {
      const schema = nu
        .object({
          name: nu.string(),
          value: nu.number(),
          active: nu.boolean(),
        })
        .withTableLayouts({
          simple: {
            fields: [
              { name: "name", columnWidthPx: 250 },
              { name: "value", columnWidthPx: 200 },
              { name: "active", columnWidthPx: 100 },
            ],
          },
        });

      const layout = schema.getLayout("simple");
      expect(layout).toBeDefined();
      expect(layout?.type).toBe("table");
      expect(layout?.metadata?.linkFields).toBeUndefined();
    });

    it("should support table layouts with custom metadata", () => {
      const schema = nu
        .object({
          col1: nu.string(),
          col2: nu.string(),
        })
        .withTableLayouts({
          custom: {
            fields: [
              { name: "col1", columnWidthPx: 300 },
              { name: "col2", columnWidthPx: 300 },
            ],
            metadata: {
              linkFields: ["col1"],
              sortable: true,
              paginated: true,
              pageSize: 25,
            },
          },
        });

      const layout = schema.getLayout("custom");
      expect(layout).toBeDefined();
      expect(layout?.type).toBe("table");
      expect(layout?.metadata?.linkFields).toEqual(["col1"]);
      expect(layout?.metadata?.sortable).toBe(true);
      expect(layout?.metadata?.paginated).toBe(true);
      expect(layout?.metadata?.pageSize).toBe(25);
    });

    it("should type-check linkFields to ensure only valid fields are allowed", () => {
      const schema = nu.object({
        validField1: nu.string(),
        validField2: nu.number(),
      });

      // This should compile successfully with valid field names
      const validLayout = schema.withTableLayouts({
        validTable: {
          fields: [
            { name: "validField1", columnWidthPx: 300 },
            { name: "validField2", columnWidthPx: 300 },
          ],
          metadata: {
            linkFields: ["validField1", "validField2"],
          },
        },
      });

      expect(validLayout).toBeDefined();
      expect(validLayout.hasLayout("validTable")).toBe(true);

      const layout = validLayout.getLayout("validTable");
      expect(layout).toBeDefined();
      expect(layout?.metadata?.linkFields).toEqual([
        "validField1",
        "validField2",
      ]);
    });

    it("should support mixing form and table layouts", () => {
      const schema = nu
        .object({
          id: nu.number(),
          name: nu.string(),
          description: nu.string(),
        })
        .withFormLayouts({
          editForm: {
            type: "form",
            groups: [
              {
                label: "Details",
                fields: [
                  { name: "name", fieldWidth: 12 },
                  { name: "description", fieldWidth: 12 },
                ],
              },
            ],
          },
        })
        .withTableLayouts({
          listView: {
            fields: [
              { name: "id", columnWidthPx: 120 },
              { name: "name", columnWidthPx: 300 },
              { name: "description", columnWidthPx: 400 },
            ],
            metadata: {
              linkFields: ["name"],
            },
          },
        });

      expect(schema.getLayoutNames()).toContain("editForm");
      expect(schema.getLayoutNames()).toContain("listView");

      const formLayout = schema.getLayout("editForm");
      expect(formLayout?.type).toBe("form");

      const tableLayout = schema.getLayout("listView");
      expect(tableLayout?.type).toBe("table");
      expect(tableLayout?.metadata?.linkFields).toEqual(["name"]);
    });

    it("should support table field visibility control", () => {
      const schema = nu
        .object({
          id: nu.number(),
          internalCode: nu.string(),
          publicName: nu.string(),
        })
        .withTableLayouts({
          public: {
            fields: [
              { name: "id", columnWidthPx: 120 },
              { name: "publicName", columnWidthPx: 300 },
              { name: "internalCode", columnWidthPx: 200, hidden: true },
            ],
          },
          admin: {
            fields: [
              { name: "id", columnWidthPx: 120 },
              { name: "internalCode", columnWidthPx: 200 },
              { name: "publicName", columnWidthPx: 250 },
            ],
          },
        });

      const publicLayout = schema.getLayout("public");
      const adminLayout = schema.getLayout("admin");

      // Table layouts have fields directly, not nested in groups
      if (publicLayout?.type === "table") {
        const publicFields = publicLayout.fields;
        expect(
          publicFields.find((f) => f.name === "internalCode")?.hidden,
        ).toBe(true);
      }

      if (adminLayout?.type === "table") {
        const adminFields = adminLayout.fields;
        expect(
          adminFields.find((f) => f.name === "internalCode")?.hidden,
        ).toBeUndefined();
      }
    });
  });
});
