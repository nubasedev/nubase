import { nu } from "@nubase/core";

// Test the computed metadata functionality
const testSchema = nu
  .object({
    firstName: nu.string().meta({
      label: "First Name",
      defaultValue: "John",
    }),
    lastName: nu.string().meta({
      label: "Last Name",
      defaultValue: "Doe",
    }),
  })
  .withComputed({
    lastName: {
      label: async (obj) => `Computed Last Name: ${obj.firstName}`,
    },
  });

async function testComputedMetadata() {
  console.log("=== Testing Computed Metadata ===");

  // Test with default values
  const defaultData = { firstName: "John", lastName: "Doe" };
  console.log("Testing with default data:", defaultData);

  const metadata1 = await testSchema.getAllMergedMeta(defaultData);
  console.log("Metadata for default data:", metadata1);

  // Test with changed firstName
  const changedData = { firstName: "Jane", lastName: "Doe" };
  console.log("Testing with changed data:", changedData);

  const metadata2 = await testSchema.getAllMergedMeta(changedData);
  console.log("Metadata for changed data:", metadata2);
}

testComputedMetadata().catch(console.error);
