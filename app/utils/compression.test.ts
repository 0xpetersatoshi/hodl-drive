import { compressData, decompressData } from "./compression";

describe("compression", () => {
  it("round-trips: compress then decompress equals original", () => {
    const original = new TextEncoder().encode("Hello, world! This is a test.");
    const compressed = compressData(original);
    const decompressed = decompressData(compressed);

    expect(Array.from(decompressed)).toEqual(Array.from(original));
  });

  it("compresses repetitive data to a smaller size", () => {
    const repetitive = new TextEncoder().encode("a".repeat(10000));
    const compressed = compressData(repetitive);

    expect(compressed.length).toBeLessThan(repetitive.length);
  });

  it("handles empty input", () => {
    const empty = new Uint8Array(0);
    const compressed = compressData(empty);
    const decompressed = decompressData(compressed);

    expect(Array.from(decompressed)).toEqual(Array.from(empty));
  });

  it("decompressData throws on non-gzip input", () => {
    const notGzip = new Uint8Array([0, 1, 2, 3, 4, 5]);

    expect(() => decompressData(notGzip)).toThrow();
  });
});
