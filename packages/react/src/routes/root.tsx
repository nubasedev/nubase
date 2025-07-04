import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createContext, useContext, useEffect, useState } from "react";
import { useNubaseConfig } from "src/config";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function RootComponent() {
  const [theme, setTheme] = useState<Theme>("dark");
  const config = useNubaseConfig();

  // Initialize theme from localStorage and keep document in sync
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Keep document in sync with React state
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: setTheme }}>
      <div className="min-h-screen bg-background text-text">
        <header className="p-4 border-b border-border">
          <nav className="flex items-center justify-between">
            <div className="flex gap-4">
              <Link to="/" className="[&.active]:font-bold hover:text-primary">
                {config.appName}
              </Link>
              <Link
                to="/about"
                className="[&.active]:font-bold hover:text-primary"
              >
                About
              </Link>
              <Link
                to="/r/contacts"
                className="[&.active]:font-bold hover:text-primary"
              >
                Contacts
              </Link>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-2 text-sm bg-surface hover:bg-surface-hover border border-border rounded-md transition-colors"
            >
              {theme === "light" ? "🌙" : "☀️"}{" "}
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
        <TanStackRouterDevtools />
      </div>
    </ThemeContext.Provider>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
