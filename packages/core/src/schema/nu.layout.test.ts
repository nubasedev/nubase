import { describe, expect, it } from "vitest";
import { nu } from "./nu";

describe("nubase Schema Library (nu) - Layout System", () => {
  it("should create an object schema with form layouts", () => {
    const productSchema = nu
      .object({
        name: nu.string().withMeta({ label: "Product Name" }),
        price: nu.number().withMeta({ label: "Price" }),
        inStock: nu.boolean().withMeta({ label: "In Stock" }),
        description: nu.string().withMeta({ label: "Description" }),
      })
      .withFormLayouts({
        default: {
          type: "form",
          groups: [
            {
              label: "Product Details",
              fields: [
                { name: "name", size: 12 },
                { name: "price", size: 6 },
                { name: "inStock", size: 6 },
                { name: "description", size: 12 },
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
                { name: "name", size: 8 },
                { name: "price", size: 4 },
              ],
            },
            {
              label: "Details",
              fields: [
                { name: "inStock", size: 3 },
                { name: "description", size: 9 },
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
              { name: "validField1", size: 6 },
              { name: "validField2", size: 6 },
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
                { name: "title", size: 12, className: "title-field" },
                { name: "subtitle", size: 12, className: "subtitle-field" },
              ],
            },
            {
              label: "Content",
              description: "Main article content",
              className: "content-group",
              collapsible: true,
              defaultCollapsed: false,
              fields: [{ name: "content", size: 12 }],
            },
            {
              label: "Meta",
              className: "meta-group",
              fields: [
                { name: "published", size: 4 },
                { name: "tags", size: 8 },
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
    expect(titleField?.size).toBe(12);
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
                { name: "publicField", size: 12 },
                { name: "internalField", size: 12, hidden: true },
                { name: "debugField", size: 12, hidden: true },
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
                { name: "publicField", size: 4 },
                { name: "internalField", size: 4 },
                { name: "debugField", size: 4 },
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
          id: nu.number().withMeta({ label: "ID" }),
          title: nu.string().withMeta({ label: "Title" }),
          status: nu.string().withMeta({ label: "Status" }),
          priority: nu.string().withMeta({ label: "Priority" }),
          assignee: nu.string().withMeta({ label: "Assignee" }),
          createdAt: nu.string().withMeta({ label: "Created" }),
        })
        .withTableLayouts({
          default: {
            fields: [
              { name: "id", size: 10 },
              { name: "title", size: 30 },
              { name: "status", size: 15 },
              { name: "priority", size: 15 },
              { name: "assignee", size: 20 },
              { name: "createdAt", size: 10 },
            ],
            metadata: {
              linkFields: ["title"],
            },
          },
          compact: {
            fields: [
              { name: "id", size: 15 },
              { name: "title", size: 50 },
              { name: "status", size: 35 },
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
      expect(defaultLayout?.groups).toHaveLength(1);
      expect(defaultLayout?.groups[0]?.fields).toHaveLength(6);
      expect(defaultLayout?.metadata?.linkFields).toEqual(["title"]);

      const compactLayout = ticketSchema.getLayout("compact");
      expect(compactLayout).toBeDefined();
      expect(compactLayout?.type).toBe("table");
      expect(compactLayout?.groups[0]?.fields).toHaveLength(3);
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
              { name: "name", size: 40 },
              { name: "value", size: 30 },
              { name: "active", size: 30 },
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
              { name: "col1", size: 50 },
              { name: "col2", size: 50 },
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
            { name: "validField1", size: 50 },
            { name: "validField2", size: 50 },
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
                  { name: "name", size: 12 },
                  { name: "description", size: 12 },
                ],
              },
            ],
          },
        })
        .withTableLayouts({
          listView: {
            fields: [
              { name: "id", size: 20 },
              { name: "name", size: 50 },
              { name: "description", size: 30 },
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
              { name: "id", size: 30 },
              { name: "publicName", size: 70 },
              { name: "internalCode", size: 0, hidden: true },
            ],
          },
          admin: {
            fields: [
              { name: "id", size: 20 },
              { name: "internalCode", size: 40 },
              { name: "publicName", size: 40 },
            ],
          },
        });

      const publicLayout = schema.getLayout("public");
      const adminLayout = schema.getLayout("admin");

      const publicFields = publicLayout?.groups[0]?.fields;
      expect(publicFields?.find((f) => f.name === "internalCode")?.hidden).toBe(
        true,
      );

      const adminFields = adminLayout?.groups[0]?.fields;
      expect(
        adminFields?.find((f) => f.name === "internalCode")?.hidden,
      ).toBeUndefined();
    });
  });
});
