import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  loadRemotes,
  saveRemotes,
  getActiveRemote,
  addRemote,
  removeRemote,
  setActiveRemote,
} from "./remotes-file.js";
import type { RemotesConfig } from "./types.js";

describe("remotes-file", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), "nubase-remotes-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("loadRemotes", () => {
    it("returns empty config when file does not exist", () => {
      const result = loadRemotes(tmpDir);
      expect(result).toEqual({ active: null, remotes: {} });
    });

    it("loads existing remotes file", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      saveRemotes(tmpDir, config);
      const result = loadRemotes(tmpDir);
      expect(result).toEqual(config);
    });
  });

  describe("addRemote", () => {
    it("adds a remote and sets it as active if first", () => {
      const config = addRemote(
        { active: null, remotes: {} },
        "origin",
        { url: "http://localhost:3001", workspace: "tavern" },
      );
      expect(config.active).toBe("origin");
      expect(config.remotes.origin).toEqual({
        url: "http://localhost:3001",
        workspace: "tavern",
      });
    });

    it("adds a second remote without changing active", () => {
      let config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      config = addRemote(config, "staging", {
        url: "https://staging.example.com",
        workspace: "tavern-staging",
      });
      expect(config.active).toBe("origin");
      expect(config.remotes.staging).toBeDefined();
    });

    it("throws if remote name already exists", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      expect(() =>
        addRemote(config, "origin", { url: "http://other.com", workspace: "x" }),
      ).toThrow('Remote "origin" already exists');
    });
  });

  describe("removeRemote", () => {
    it("removes a remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
          staging: { url: "https://staging.example.com", workspace: "tavern-staging" },
        },
      };
      const result = removeRemote(config, "staging");
      expect(result.remotes.staging).toBeUndefined();
      expect(result.active).toBe("origin");
    });

    it("clears active if removing the active remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      const result = removeRemote(config, "origin");
      expect(result.active).toBeNull();
      expect(result.remotes.origin).toBeUndefined();
    });

    it("throws if remote does not exist", () => {
      expect(() =>
        removeRemote({ active: null, remotes: {} }, "origin"),
      ).toThrow('Remote "origin" does not exist');
    });
  });

  describe("setActiveRemote", () => {
    it("sets the active remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
          staging: { url: "https://staging.example.com", workspace: "tavern-staging" },
        },
      };
      const result = setActiveRemote(config, "staging");
      expect(result.active).toBe("staging");
    });

    it("throws if remote does not exist", () => {
      expect(() =>
        setActiveRemote({ active: null, remotes: {} }, "origin"),
      ).toThrow('Remote "origin" does not exist');
    });
  });

  describe("getActiveRemote", () => {
    it("returns the active remote", () => {
      const config: RemotesConfig = {
        active: "origin",
        remotes: {
          origin: { url: "http://localhost:3001", workspace: "tavern" },
        },
      };
      const result = getActiveRemote(config);
      expect(result).toEqual({
        name: "origin",
        url: "http://localhost:3001",
        workspace: "tavern",
      });
    });

    it("throws if no active remote is set", () => {
      expect(() =>
        getActiveRemote({ active: null, remotes: {} }),
      ).toThrow("No active remote. Run `nubase remote add` to add one.");
    });
  });
});
