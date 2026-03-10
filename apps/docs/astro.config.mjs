// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			plugins: [starlightBlog()],
			title: 'Nubase',
			tagline: 'Build business applications and internal tools at the speed of light',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/nubasedev/nubase' },
			],
			editLink: {
				baseUrl: 'https://github.com/nubasedev/nubase/edit/main/apps/docs/',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', link: '/docs/intro/' },
						{ label: 'Getting Started', link: '/docs/getting-started/' },
						{ label: 'Create a Nubase App', link: '/docs/create-nubase-app/' },
						{ label: 'Development Environment', link: '/docs/development-environment/' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'Schema', link: '/docs/schema/' },
						{ label: 'Resources', link: '/docs/resources/' },
						{ label: 'Searching & Filtering', link: '/docs/searching/' },
						{ label: 'Frontend', link: '/docs/frontend/' },
						{ label: 'Authentication', link: '/docs/authentication/' },
						{ label: 'Dashboards', link: '/docs/dashboards/' },
					],
				},
				{
					label: 'Layouts',
					items: [
						{ label: 'Layout System', link: '/docs/layouts/' },
						{ label: 'Form Layouts', link: '/docs/form-layouts/' },
						{ label: 'Table Layouts', link: '/docs/table-layouts/' },
					],
				},
				{
					label: 'Advanced',
					items: [
						{ label: 'Computed Metadata', link: '/docs/computed-metadata/' },
						{ label: 'E2E Testing', link: '/docs/e2e-testing/' },
					],
				},
				{
					label: 'Database',
					items: [
						{ label: 'Configuration', link: '/docs/configuration/' },
						{ label: 'CLI Reference', link: '/docs/cli/' },
					],
				},
				{
					label: 'Internals',
					autogenerate: { directory: 'docs/internals' },
				},
				{
					label: 'Development Findings',
					autogenerate: { directory: 'docs/development-findings' },
				},
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
