import { describe, it, expect } from "vitest";
import { parseTags, formatDate } from "../db";

describe("parseTags", () => {
  it("parses a valid JSON array", () => {
    expect(parseTags('["Go","Postgres","TypeScript"]')).toEqual(["Go", "Postgres", "TypeScript"]);
  });

  it("returns empty array for empty JSON array", () => {
    expect(parseTags("[]")).toEqual([]);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseTags("not json")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseTags("")).toEqual([]);
  });
});

describe("formatDate", () => {
  it("formats a date string to month + year", () => {
    const result = formatDate("2024-03-15");
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2024/);
  });

  it("handles start of year", () => {
    const result = formatDate("2023-01-01");
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2023/);
  });
});
