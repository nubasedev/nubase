// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Nubase',
			tagline: 'Build business applications and internal tools at the speed of light',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/nubasedev/nubase' },
			],
			editLink: {
				baseUrl: 'https://github.com/nubasedev/nubase/edit/main/apps/docs-starlight/',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', link: '/intro/' },
						{ label: 'Getting Started', link: '/getting-started/' },
						{ label: 'Create a Nubase App', link: '/create-nubase-app/' },
						{ label: 'Development Environment', link: '/development-environment/' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'Schema', link: '/schema/' },
						{ label: 'Resources', link: '/resources/' },
						{ label: 'Frontend', link: '/frontend/' },
						{ label: 'Authentication', link: '/authentication/' },
						{ label: 'Dashboards', link: '/dashboards/' },
					],
				},
				{
					label: 'Layouts',
					items: [
						{ label: 'Layout System', link: '/layouts/' },
						{ label: 'Form Layouts', link: '/form-layouts/' },
						{ label: 'Table Layouts', link: '/table-layouts/' },
					],
				},
				{
					label: 'Advanced',
					items: [
						{ label: 'Computed Metadata', link: '/computed-metadata/' },
						{ label: 'E2E Testing', link: '/e2e-testing/' },
					],
				},
				{
					label: 'Internals',
					autogenerate: { directory: 'internals' },
				},
				{
					label: 'Development Findings',
					autogenerate: { directory: 'development-findings' },
				},
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
