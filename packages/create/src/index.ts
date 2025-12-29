#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { program } from "commander";
import fse from "fs-extra";
import prompts from "prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectOptions {
	name: string;
	dbName: string;
	dbUser: string;
	dbPassword: string;
	devPort: number;
	testPort: number;
	backendPort: number;
	frontendPort: number;
	testBackendPort: number;
	testFrontendPort: number;
	nubaseTag: string;
}

const TEMPLATE_DIR = path.join(__dirname, "..", "templates");

function toPascalCase(str: string): string {
	return str
		.split(/[-_\s]+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
}

function toCamelCase(str: string): string {
	const pascal = toPascalCase(str);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase();
}

function replaceInContent(
	content: string,
	options: ProjectOptions,
): string {
	const kebabName = toKebabCase(options.name);
	const pascalName = toPascalCase(options.name);
	const camelName = toCamelCase(options.name);

	// Determine the @nubase/* package version string
	// For "latest", use "*" (any version). For other tags like "dev", use the tag name directly.
	const nubaseVersion = options.nubaseTag === "latest" ? "*" : options.nubaseTag;

	return content
		.replace(/__PROJECT_NAME__/g, kebabName)
		.replace(/__PROJECT_NAME_PASCAL__/g, pascalName)
		.replace(/__PROJECT_NAME_CAMEL__/g, camelName)
		.replace(/__DB_NAME__/g, options.dbName)
		.replace(/__DB_USER__/g, options.dbUser)
		.replace(/__DB_PASSWORD__/g, options.dbPassword)
		.replace(/__DEV_PORT__/g, String(options.devPort))
		.replace(/__TEST_PORT__/g, String(options.testPort))
		.replace(/__BACKEND_PORT__/g, String(options.backendPort))
		.replace(/__FRONTEND_PORT__/g, String(options.frontendPort))
		.replace(/__TEST_BACKEND_PORT__/g, String(options.testBackendPort))
		.replace(/__TEST_FRONTEND_PORT__/g, String(options.testFrontendPort))
		.replace(/"@nubase\/core": "\*"/g, `"@nubase/core": "${nubaseVersion}"`)
		.replace(/"@nubase\/frontend": "\*"/g, `"@nubase/frontend": "${nubaseVersion}"`)
		.replace(/"@nubase\/backend": "\*"/g, `"@nubase/backend": "${nubaseVersion}"`)
		.replace(/"@nubase\/create": "\*"/g, `"@nubase/create": "${nubaseVersion}"`);
}

function copyTemplateDir(
	src: string,
	dest: string,
	options: ProjectOptions,
): void {
	fse.ensureDirSync(dest);
	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		let destName = replaceInContent(entry.name, options);
		// Handle .template extension
		if (destName.endsWith(".template")) {
			destName = destName.slice(0, -9);
		}
		const destPath = path.join(dest, destName);

		if (entry.isDirectory()) {
			copyTemplateDir(srcPath, destPath, options);
		} else {
			const content = fs.readFileSync(srcPath, "utf-8");
			const processedContent = replaceInContent(content, options);
			fs.writeFileSync(destPath, processedContent, "utf-8");
		}
	}
}

async function main() {
	program
		.name("@nubase/create")
		.description("Create a new Nubase application")
		.argument("[project-name]", "Name of the project")
		.option("--db-name <name>", "Database name")
		.option("--db-user <user>", "Database user")
		.option("--db-password <password>", "Database password")
		.option("--dev-port <port>", "Development database port", "5434")
		.option("--test-port <port>", "Test database port", "5435")
		.option("--backend-port <port>", "Backend server port", "3001")
		.option("--frontend-port <port>", "Frontend dev server port", "3002")
		.option("--test-backend-port <port>", "Test backend server port", "4001")
		.option("--test-frontend-port <port>", "Test frontend dev server port", "4002")
		.option("--skip-install", "Skip npm install")
		.option("--tag <tag>", "npm tag for @nubase/* packages (latest, dev)", "latest")
		.parse();

	const args = program.args;
	const opts = program.opts();

	console.log(chalk.bold.cyan("\n  Welcome to Nubase!\n"));

	let projectName = args[0];

	if (!projectName) {
		const response = await prompts({
			type: "text",
			name: "projectName",
			message: "What is your project name?",
			initial: "my-app",
			validate: (value) =>
				/^[a-z0-9-]+$/.test(value)
					? true
					: "Project name must be lowercase with hyphens only",
		});

		if (!response.projectName) {
			console.log(chalk.red("\nProject name is required."));
			process.exit(1);
		}

		projectName = response.projectName;
	}

	const dbName = opts.dbName || toKebabCase(projectName).replace(/-/g, "_");
	const dbUser = opts.dbUser || dbName;
	const dbPassword = opts.dbPassword || dbName;

	const options: ProjectOptions = {
		name: projectName,
		dbName,
		dbUser,
		dbPassword,
		devPort: Number.parseInt(opts.devPort, 10),
		testPort: Number.parseInt(opts.testPort, 10),
		backendPort: Number.parseInt(opts.backendPort, 10),
		frontendPort: Number.parseInt(opts.frontendPort, 10),
		testBackendPort: Number.parseInt(opts.testBackendPort, 10),
		testFrontendPort: Number.parseInt(opts.testFrontendPort, 10),
		nubaseTag: opts.tag,
	};

	const targetDir = path.join(process.cwd(), projectName);

	if (fs.existsSync(targetDir)) {
		const response = await prompts({
			type: "confirm",
			name: "overwrite",
			message: `Directory ${projectName} already exists. Overwrite?`,
			initial: false,
		});

		if (!response.overwrite) {
			console.log(chalk.yellow("\nOperation cancelled."));
			process.exit(0);
		}

		fse.removeSync(targetDir);
	}

	console.log(chalk.blue(`\nCreating project in ${chalk.bold(targetDir)}...\n`));

	// Copy templates
	const templates = ["root", "schema", "backend", "frontend"];
	for (const template of templates) {
		const templatePath = path.join(TEMPLATE_DIR, template);
		if (!fs.existsSync(templatePath)) {
			console.log(chalk.yellow(`Template ${template} not found, skipping...`));
			continue;
		}

		if (template === "root") {
			copyTemplateDir(templatePath, targetDir, options);
		} else {
			const destPath = path.join(targetDir, template);
			copyTemplateDir(templatePath, destPath, options);
		}

		console.log(chalk.green(`  ✓ Created ${template}`));
	}

	// Install dependencies
	if (!opts.skipInstall) {
		console.log(chalk.blue("\nInstalling dependencies...\n"));
		try {
			execSync("npm install", {
				cwd: targetDir,
				stdio: "inherit",
			});
			console.log(chalk.green("\n  ✓ Dependencies installed"));
		} catch {
			console.log(
				chalk.yellow("\n  ⚠ Failed to install dependencies. Run npm install manually."),
			);
		}
	}

	// Print next steps
	console.log(chalk.bold.green("\n  Success! Your Nubase project is ready.\n"));
	console.log(chalk.bold("  Next steps:\n"));
	console.log(chalk.cyan(`    cd ${projectName}`));
	console.log(chalk.cyan("    npm run db:up          # Start PostgreSQL"));
	console.log(chalk.cyan("    npm run db:seed        # Seed the database"));
	console.log(chalk.cyan("    npm run dev            # Start development\n"));
	console.log(chalk.dim("  Database connection:"));
	console.log(chalk.dim(`    Host: localhost:${options.devPort}`));
	console.log(chalk.dim(`    Database: ${options.dbName}`));
	console.log(chalk.dim(`    User: ${options.dbUser}`));
	console.log(chalk.dim(`    Password: ${options.dbPassword}\n`));
}

main().catch((error) => {
	console.error(chalk.red("Error:"), error.message);
	process.exit(1);
});
