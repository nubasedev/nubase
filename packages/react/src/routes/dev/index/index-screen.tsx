import { Link } from "@tanstack/react-router";

interface DevToolCardProps {
  title: string;
  description: string;
  href: string;
}

function DevToolCard({ title, description, href }: DevToolCardProps) {
  return (
    <Link
      to={href}
      className="block p-6 border border-outline rounded-lg bg-surface hover:bg-surfaceVariant transition-colors"
    >
      <h3 className="text-lg font-semibold text-onSurface mb-2">{title}</h3>
      <p className="text-onSurfaceVariant">{description}</p>
    </Link>
  );
}

export default function IndexScreen() {
  const devTools = [
    {
      title: "Colors",
      description:
        "View all Material Design 3 color tokens for the current theme",
      href: "/dev/colors",
    },
    // Future dev tools can be added here
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-onSurface mb-2">
          Available Tools
        </h2>
        <p className="text-onSurfaceVariant">
          Development utilities to help you work with the Nubase design system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devTools.map((tool) => (
          <DevToolCard
            key={tool.href}
            title={tool.title}
            description={tool.description}
            href={tool.href}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-surfaceVariant rounded-lg">
        <h3 className="text-lg font-semibold text-onSurface mb-2">
          Need more tools?
        </h3>
        <p className="text-onSurfaceVariant text-sm">
          This development section can be extended with additional debugging and
          development utilities like component showcases, typography scales,
          spacing guides, and more.
        </p>
      </div>
    </div>
  );
}
