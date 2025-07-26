import { cva } from "class-variance-authority";
import { describe, expect, it } from "vitest";

describe("cn", () => {
  it("should work", () => {
    const buttonVariants = cva("inline-flex", {
      variants: {
        variant: {
          default: "bg-primary",
          destructive: "bg-destructive",
        },
        size: {
          default: "h-9",
          sm: "h-8",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    });
    expect(buttonVariants({ variant: "default", size: "default" })).toBe(
      "inline-flex bg-primary h-9",
    );
  });
});
