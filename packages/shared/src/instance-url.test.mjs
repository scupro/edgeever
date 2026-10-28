import { describe, expect, test } from "bun:test";
import { normalizeInstanceUrl } from "./instance-url.ts";

describe("normalizeInstanceUrl", () => {
  test("keeps an explicit https URL and drops trailing slashes", () => {
    expect(normalizeInstanceUrl("https://notes.example.com/")).toBe("https://notes.example.com");
  });

  test("defaults a bare host to https", () => {
    expect(normalizeInstanceUrl("notes.example.com")).toBe("https://notes.example.com");
    expect(normalizeInstanceUrl(" notes.example.com ")).toBe("https://notes.example.com");
  });

  test("keeps an explicit http URL untouched apart from its trailing slash", () => {
    expect(normalizeInstanceUrl("http://192.168.1.10:8787/")).toBe("http://192.168.1.10:8787");
  });

  test("returns an empty value unchanged", () => {
    expect(normalizeInstanceUrl("")).toBe("");
    expect(normalizeInstanceUrl("   ")).toBe("");
  });
});