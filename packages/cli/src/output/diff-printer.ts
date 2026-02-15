import chalk from "chalk";
import type { SchemaDiff } from "@nubase/pg";

export function printDiff(diff: SchemaDiff): void {
  if (!diff.hasDifferences) {
    console.log(chalk.green("No differences found."));
    return;
  }

  printObjectSet("Tables", diff.tables);
  printObjectSet("Enums", diff.enums);
  printObjectSet("Sequences", diff.sequences);
  printObjectSet("Views", diff.views);
  printObjectSet("Materialized Views", diff.materializedViews);
  printObjectSet("Functions", diff.functions);
  printObjectSet("Triggers", diff.triggers);
  printObjectSet("Extensions", diff.extensions);
  printObjectSet("Domains", diff.domains);
  printObjectSet("Collations", diff.collations);
  printObjectSet("Policies", diff.policies);
  printObjectSet("Privileges", diff.privileges);

  // Print table-level details for modified tables
  for (const [name, tableDiff] of Object.entries(diff.tables.modified)) {
    console.log(chalk.yellow(`\n  Table ${chalk.bold(name)} changes:`));

    for (const col of Object.keys(tableDiff.columns.added)) {
      console.log(chalk.green(`    + column ${col}`));
    }
    for (const col of Object.keys(tableDiff.columns.removed)) {
      console.log(chalk.red(`    - column ${col}`));
    }
    for (const [col, mod] of Object.entries(tableDiff.columns.modified)) {
      console.log(
        chalk.yellow(
          `    ~ column ${col} (${mod.changedProperties.join(", ")})`,
        ),
      );
    }

    printObjectSet("    Constraints", tableDiff.constraints, "    ");
    printObjectSet("    Indexes", tableDiff.indexes, "    ");

    if (tableDiff.rlsChanged) {
      console.log(chalk.yellow("    ~ RLS settings changed"));
    }
  }
}

function printObjectSet(
  label: string,
  set: { added: Record<string, unknown>; removed: Record<string, unknown>; modified: Record<string, unknown> },
  indent = "",
): void {
  const addedKeys = Object.keys(set.added);
  const removedKeys = Object.keys(set.removed);
  const modifiedKeys = Object.keys(set.modified);

  if (addedKeys.length === 0 && removedKeys.length === 0 && modifiedKeys.length === 0) {
    return;
  }

  console.log(`\n${indent}${chalk.bold(label)}:`);

  for (const key of addedKeys) {
    console.log(`${indent}  ${chalk.green(`+ ${key}`)}`);
  }
  for (const key of removedKeys) {
    console.log(`${indent}  ${chalk.red(`- ${key}`)}`);
  }
  for (const key of modifiedKeys) {
    console.log(`${indent}  ${chalk.yellow(`~ ${key}`)}`);
  }
}
