import type { AnyRouter } from "@tanstack/react-router";

export interface NavigationHistoryEntry {
  id: string;
  path: string;
  pathname: string;
  search: string;
  searchParams: Record<string, any>;
  hash: string;
  timestamp: number;
  title: string;
}

export class NavigationHistoryTracker {
  private history: NavigationHistoryEntry[] = [];
  private maxHistorySize = 50;
  private unsubscribe: (() => void) | null = null;
  private router: AnyRouter;
  private lastEntryId: string | null = null;
  private historyIdCounter = 0;

  constructor(router: AnyRouter) {
    this.router = router;
    this.startTracking();

    // Add current location to history on initialization
    this.addCurrentLocation();
  }

  private formatTitle(
    pathname: string,
    searchParams: Record<string, any>,
  ): string {
    let title = pathname;

    // Add search params if present
    if (Object.keys(searchParams).length > 0) {
      const searchString = new URLSearchParams(searchParams).toString();
      if (searchString) {
        title += `?${searchString}`;
      }
    }

    return title;
  }

  private parseSearchParams(search: string): Record<string, any> {
    if (!search || search === "?") return {};

    const params: Record<string, any> = {};
    const searchParams = new URLSearchParams(search);

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  private addCurrentLocation() {
    const location = this.router.state.location;
    this.addEntry(location);
  }

  private addEntry(location: any) {
    const searchParams = this.parseSearchParams(location.search);
    const title = this.formatTitle(location.pathname, searchParams);

    // Create a unique ID based on the full location
    const entryId = `${location.pathname}${location.search}${location.hash}`;

    // Don't add duplicate consecutive entries
    if (this.lastEntryId === entryId) {
      return;
    }

    const entry: NavigationHistoryEntry = {
      id: `history-${this.historyIdCounter++}`,
      path: `${location.pathname}${location.search}${location.hash}`,
      pathname: location.pathname,
      search: location.search || "",
      searchParams,
      hash: location.hash || "",
      timestamp: Date.now(),
      title,
    };

    this.history.unshift(entry);
    this.lastEntryId = entryId;

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  private startTracking() {
    // Subscribe to route changes - use onResolved to capture completed navigations
    this.unsubscribe = this.router.subscribe("onResolved", (event) => {
      // Only track when the path actually changed
      if (event.pathChanged || event.hrefChanged) {
        this.addEntry(event.toLocation);
      }
    });
  }

  public getHistory(): NavigationHistoryEntry[] {
    return [...this.history];
  }

  public clearHistory() {
    this.history = [];
    this.historyIdCounter = 0;
    this.lastEntryId = null;
  }

  public dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  public navigateToEntry(entry: NavigationHistoryEntry) {
    // Navigate using pathname and search params separately
    const searchParams =
      Object.keys(entry.searchParams).length > 0
        ? entry.searchParams
        : undefined;

    this.router.navigate({
      to: entry.pathname as any,
      search: searchParams as any,
      hash: entry.hash || undefined,
    });
  }

  public formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
