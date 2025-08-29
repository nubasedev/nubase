---
sidebar_position: 1
---

# Introduction to Nubase

## What is Nubase?

Nubase is a highly-opinionated, batteries-included, meta-framework for building business applications and internal tools with TypeScript. Nubase is primarily a frontend framework for the web.

Nubase is not designed to be a general-purpose framework. Instead, it focuses on applications centered around dashboards and CRUD operations (Create, Read, Update, Delete).

Applicatons that are a good fit for Nubase include:
- Business applications (e.g CRM, ERP, Ticket Management)
- Internal tools (e.g Admin panels, Data management systems)

Think of Nubase as an open-source alternative to platforms like Retool and Airtable, except that you have full control over the code and data.


## Why Nubase?

Every business application and internal tool has a common set of requirements:
- Authentication and authorization.
- Dashboards.
- Searching, filtering, viewing and editing data.
- Configuration pages.
- Theming.

Too often, teams reinvent these core components for each new project. This leads to wasted development cycles, inconsistent user experiences, and a gradual drift away from modern UX and accessibility standards.

This highlights a fundamental trade-off in software engineering: flexibility versus constraint. A highly flexible system allows for tailored solutions but sacrifices development speed and consistency. A rigid, constrained system is fast and consistent but can't adapt to unique requirements, forcing compromises in the user experience.

Nubase is built on a strong conviction: With the right architecture, by deliberately choosing low-flexibility we can achieve exceptional gains in development speed, consistency, and out-of-the-box quality. Our architecture is meticulously designed to optimize for this approach.

We are explicit about this trade-off. Nubase is designed to excel at the 85% of common business application requirements. We acknowledge that this focus means the remaining 15% of highly specific or unique features will have to be adapted and there will be compromises. We believe that for the vast majority of business applications, the benefits of super fast development, guaranteed consistency, and built-in quality far outweigh the limitations of this focused approach.

## How does Nubase work?

Nubase is primary a frontend framework but you don't write any frontend code.

In Nubase, you define your application as a collection of schema and business logic, and a selected Nubase runtime will execute and render the application for you. We are currently implementing a React runtime, but we plan to also have a React-Native runtime. When that is published, the same application you developed with Nubase, should be able to be published as a mobile app without any modification.

## How does a Nubase app look like?

A Nubase app is basically a Vite app that renders a single top-level React component, the `NubaseApp` component.

It looks like:

```tsx
<NubaseApp config={config} />
```

## FAQ

### Can I integrate Nubase into an existing application?

No. With Nubase, your selected runtime (Only react is available now) will run your application for you. The runtime will be responsible for routing, authentication and everything.