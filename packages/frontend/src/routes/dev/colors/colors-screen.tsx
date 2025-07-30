import { useNubaseContext } from "../../../components/nubase-app/NubaseContextProvider";
import type { NubaseThemeColors } from "../../../theming/theme";

interface ColorSwatchProps {
  name: string;
  value: string;
  description: string;
}

function ColorSwatch({ name, value, description }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-4 p-3 border border-outline rounded-lg bg-surface">
      <div
        className="w-12 h-12 rounded-md border border-outline shadow-sm flex-shrink-0"
        style={{ backgroundColor: value }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-onSurface bg-surfaceVariant px-2 py-1 rounded">
            {name}
          </code>
          <code className="text-xs font-mono text-onSurfaceVariant bg-surfaceVariant px-2 py-1 rounded">
            {value}
          </code>
        </div>
        <p className="text-sm text-onSurfaceVariant mt-1">{description}</p>
      </div>
    </div>
  );
}

interface ColorGroupProps {
  title: string;
  colors: Array<{ name: keyof NubaseThemeColors; description: string }>;
  themeColors: NubaseThemeColors;
}

function ColorGroup({ title, colors, themeColors }: ColorGroupProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-onSurface border-b border-outline pb-2">
        {title}
      </h3>
      <div className="grid gap-3">
        {colors.map(({ name, description }) => (
          <ColorSwatch
            key={name}
            name={name}
            value={themeColors[name]}
            description={description}
          />
        ))}
      </div>
    </div>
  );
}

export default function ColorsScreen() {
  const context = useNubaseContext();
  const currentTheme = context.theming.themeMap[context.theming.activeThemeId];

  if (!currentTheme) {
    return (
      <div className="text-center py-8">
        <p className="text-onSurfaceVariant">No theme loaded</p>
      </div>
    );
  }

  const colorGroups = [
    {
      title: "Primary Colors",
      colors: [
        {
          name: "primary" as const,
          description: "Main brand color for prominent actions",
        },
        {
          name: "onPrimary" as const,
          description: "Text/icons on primary surfaces",
        },
        {
          name: "primaryContainer" as const,
          description: "Emphasized containers and badges",
        },
        {
          name: "onPrimaryContainer" as const,
          description: "Text/icons on primary containers",
        },
      ],
    },
    {
      title: "Secondary Colors",
      colors: [
        {
          name: "secondary" as const,
          description: "Supporting brand color for less prominent actions",
        },
        {
          name: "onSecondary" as const,
          description: "Text/icons on secondary surfaces",
        },
        {
          name: "secondaryContainer" as const,
          description: "Secondary buttons and containers",
        },
        {
          name: "onSecondaryContainer" as const,
          description: "Text/icons on secondary containers",
        },
      ],
    },
    {
      title: "Tertiary Colors",
      colors: [
        {
          name: "tertiary" as const,
          description: "Accent color for balance and contrast",
        },
        {
          name: "onTertiary" as const,
          description: "Text/icons on tertiary surfaces",
        },
        {
          name: "tertiaryContainer" as const,
          description: "Tertiary containers and highlights",
        },
        {
          name: "onTertiaryContainer" as const,
          description: "Text/icons on tertiary containers",
        },
      ],
    },
    {
      title: "Error Colors",
      colors: [
        {
          name: "error" as const,
          description: "Error states and destructive actions",
        },
        {
          name: "onError" as const,
          description: "Text/icons on error surfaces",
        },
        {
          name: "errorContainer" as const,
          description: "Error containers and alerts",
        },
        {
          name: "onErrorContainer" as const,
          description: "Text/icons on error containers",
        },
      ],
    },
    {
      title: "Surface Colors",
      colors: [
        {
          name: "surface" as const,
          description: "Default background surfaces",
        },
        { name: "onSurface" as const, description: "Primary text color" },
        {
          name: "surfaceVariant" as const,
          description: "Subtle background variations",
        },
        {
          name: "onSurfaceVariant" as const,
          description: "Secondary text and placeholders",
        },
      ],
    },
    {
      title: "Other Colors",
      colors: [
        { name: "outline" as const, description: "Borders and dividers" },
        { name: "outlineVariant" as const, description: "Subtle borders" },
        { name: "shadow" as const, description: "Drop shadows" },
        { name: "scrim" as const, description: "Modal backdrops" },
        {
          name: "inverseSurface" as const,
          description: "High contrast surfaces",
        },
        {
          name: "onInverseSurface" as const,
          description: "Text on inverse surfaces",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-onSurface">Theme Colors</h2>
          <p className="text-onSurfaceVariant mt-1">
            Current theme:{" "}
            <span className="font-medium">{currentTheme.name}</span> (
            {currentTheme.type})
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-onSurfaceVariant">
          <span>Theme ID:</span>
          <code className="bg-surfaceVariant px-2 py-1 rounded font-mono">
            {currentTheme.id}
          </code>
        </div>
      </div>

      <div className="grid gap-8">
        {colorGroups.map((group) => (
          <ColorGroup
            key={group.title}
            title={group.title}
            colors={group.colors}
            themeColors={currentTheme.colors}
          />
        ))}
      </div>

      <div className="mt-12 p-6 bg-surfaceVariant rounded-lg">
        <h3 className="text-lg font-semibold text-onSurface mb-4">
          Usage Examples
        </h3>
        <div className="space-y-3">
          <div className="font-mono text-sm">
            <span className="text-primary">bg-primary</span>{" "}
            <span className="text-onSurfaceVariant">→</span>{" "}
            <span className="text-onSurface">
              {currentTheme.colors.primary}
            </span>
          </div>
          <div className="font-mono text-sm">
            <span className="text-secondary">text-onSurface</span>{" "}
            <span className="text-onSurfaceVariant">→</span>{" "}
            <span className="text-onSurface">
              {currentTheme.colors.onSurface}
            </span>
          </div>
          <div className="font-mono text-sm">
            <span className="text-tertiary">border-outline</span>{" "}
            <span className="text-onSurfaceVariant">→</span>{" "}
            <span className="text-onSurface">
              {currentTheme.colors.outline}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
