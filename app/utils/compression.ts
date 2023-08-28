import pako from "pako";

const compressData = (data: Uint8Array): Uint8Array => {
  return pako.gzip(data);
};

const decompressData = (data: Uint8Array): Uint8Array => {
  return pako.ungzip(data);
};

export { compressData, decompressData };
