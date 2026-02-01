import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn utility function", () => {
  describe("basic functionality", () => {
    it("merges class names", () => {
      const result = cn("class1", "class2");
      expect(result).toBe("class1 class2");
    });

    it("handles single class name", () => {
      const result = cn("single-class");
      expect(result).toBe("single-class");
    });

    it("handles empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("handles undefined values", () => {
      const result = cn("class1", undefined, "class2");
      expect(result).toBe("class1 class2");
    });

    it("handles null values", () => {
      const result = cn("class1", null, "class2");
      expect(result).toBe("class1 class2");
    });

    it("handles false values", () => {
      const result = cn("class1", false, "class2");
      expect(result).toBe("class1 class2");
    });
  });

  describe("conditional classes", () => {
    it("includes class when condition is true", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toBe("base active");
    });

    it("excludes class when condition is false", () => {
      const isActive = false;
      const result = cn("base", isActive && "active");
      expect(result).toBe("base");
    });

    it("handles ternary conditions", () => {
      const isError = true;
      const result = cn("base", isError ? "text-red-500" : "text-green-500");
      expect(result).toBe("base text-red-500");
    });
  });

  describe("object syntax", () => {
    it("includes classes with truthy values", () => {
      const result = cn({
        "class-a": true,
        "class-b": false,
        "class-c": true,
      });
      expect(result).toBe("class-a class-c");
    });

    it("handles mixed object and string inputs", () => {
      const result = cn("base", { active: true, disabled: false });
      expect(result).toBe("base active");
    });
  });

  describe("array syntax", () => {
    it("handles array of class names", () => {
      const result = cn(["class1", "class2"]);
      expect(result).toBe("class1 class2");
    });

    it("handles nested arrays", () => {
      const result = cn(["class1", ["class2", "class3"]]);
      expect(result).toBe("class1 class2 class3");
    });
  });

  describe("Tailwind class merging", () => {
    it("merges conflicting padding classes", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("merges conflicting margin classes", () => {
      const result = cn("m-2", "m-4");
      expect(result).toBe("m-4");
    });

    it("merges conflicting text color classes", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("merges conflicting background color classes", () => {
      const result = cn("bg-red-500", "bg-blue-500");
      expect(result).toBe("bg-blue-500");
    });

    it("preserves non-conflicting classes", () => {
      const result = cn("px-2 py-1 text-sm", "font-bold");
      expect(result).toBe("px-2 py-1 text-sm font-bold");
    });

    it("handles responsive prefixes", () => {
      const result = cn("md:px-2", "md:px-4");
      expect(result).toBe("md:px-4");
    });

    it("handles state prefixes", () => {
      const result = cn("hover:bg-red-500", "hover:bg-blue-500");
      expect(result).toBe("hover:bg-blue-500");
    });

    it("preserves different state prefixes", () => {
      const result = cn("hover:bg-red-500", "focus:bg-blue-500");
      expect(result).toBe("hover:bg-red-500 focus:bg-blue-500");
    });
  });

  describe("edge cases", () => {
    it("handles whitespace-only strings", () => {
      const result = cn("  ", "class1", "   ");
      expect(result).toBe("class1");
    });

    it("handles empty strings", () => {
      const result = cn("", "class1", "");
      expect(result).toBe("class1");
    });

    it("handles complex combinations", () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        "base-class",
        isActive && "active",
        isDisabled && "disabled",
        { "hover:scale-105": true },
        ["flex", "items-center"]
      );
      expect(result).toBe("base-class active hover:scale-105 flex items-center");
    });
  });
});
