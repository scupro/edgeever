import { describe, expect, test } from "bun:test";
import {
  parseAllowedAndroidSignerDigests,
  verifyAndroidSignerOutput,
} from "./verify-android-apk-signature.mjs";

const PINNED_SIGNER = "b".repeat(64);

describe("Android APK signer verification", () => {
  test("accepts a single signer when no pin is configured", () => {
    expect(
      verifyAndroidSignerOutput(
        `Signer #1 certificate SHA-256 digest: ${PINNED_SIGNER}`,
      ),
    ).toBe(PINNED_SIGNER);
  });

  test("normalizes colon-separated uppercase fingerprints", () => {
    const fingerprint = PINNED_SIGNER.toUpperCase()
      .match(/.{2}/g)
      .join(":");
    expect(
      verifyAndroidSignerOutput(
        `Signer #1 certificate SHA-256 digest: ${fingerprint}`,
        parseAllowedAndroidSignerDigests(PINNED_SIGNER),
      ),
    ).toBe(PINNED_SIGNER);
  });

  test("accepts fingerprints wrapped and spaced by newer build tools", () => {
    const fingerprint = PINNED_SIGNER.toUpperCase()
      .match(/.{2}/g)
      .join(" ");
    expect(
      verifyAndroidSignerOutput(
        `Signer #1 certificate SHA-256 digest: [${fingerprint}]`,
        parseAllowedAndroidSignerDigests(PINNED_SIGNER),
      ),
    ).toBe(PINNED_SIGNER);
  });

  test("accepts scheme-prefixed signer output from Linux build tools", () => {
    expect(
      verifyAndroidSignerOutput(
        [
          "Number of signers: 1",
          `V2 Signer: certificate SHA-256 digest: ${PINNED_SIGNER}`,
        ].join("\n"),
        parseAllowedAndroidSignerDigests(PINNED_SIGNER),
      ),
    ).toBe(PINNED_SIGNER);
  });

  test("rejects an APK signed by a certificate outside the pin", () => {
    expect(() =>
      verifyAndroidSignerOutput(
        `Signer #1 certificate SHA-256 digest: ${"0".repeat(64)}`,
        parseAllowedAndroidSignerDigests(PINNED_SIGNER),
      ),
    ).toThrow("Android signer mismatch");
  });

  test("accepts any one of several explicitly configured signers", () => {
    const rotated = "a".repeat(64);
    expect(
      verifyAndroidSignerOutput(
        `Signer #1 certificate SHA-256 digest: ${rotated}`,
        parseAllowedAndroidSignerDigests(`${PINNED_SIGNER},${rotated}`),
      ),
    ).toBe(rotated);
  });

  test("treats blank configuration as unpinned", () => {
    expect(parseAllowedAndroidSignerDigests()).toEqual([]);
    expect(parseAllowedAndroidSignerDigests("  ")).toEqual([]);
  });

  test("rejects malformed configured signer fingerprints", () => {
    expect(() => parseAllowedAndroidSignerDigests("not-a-fingerprint")).toThrow(
      "SHA-256 fingerprint",
    );
  });

  test("rejects missing or multiple signers", () => {
    expect(() => verifyAndroidSignerOutput("Verified")).toThrow(
      "Expected exactly one Android signer",
    );
    expect(() =>
      verifyAndroidSignerOutput(
        [
          `Signer #1 certificate SHA-256 digest: ${PINNED_SIGNER}`,
          `Signer #2 certificate SHA-256 digest: ${PINNED_SIGNER}`,
        ].join("\n"),
      ),
    ).toThrow("Expected exactly one Android signer");
  });
});