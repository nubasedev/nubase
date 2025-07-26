import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "../buttons/Button/Button";
import { useNubaseContext } from "../nubase-app/NubaseContextProvider";

export interface ThemeToggleProps {
  className?: string;
  defaultTheme: "light" | "dark";
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const context = useNubaseContext();

  const toggleTheme = () => {
    context.commands.execute("workbench.setTheme");
  };

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${context.theming.activeThemeId === "light" ? "dark" : "light"} mode`}
    >
      {context.theming.activeThemeId === "light" ? (
        <IconMoon size={16} />
      ) : (
        <IconSun size={16} />
      )}
    </Button>
  );
};
