type ReadableFileHandle = {
  close: () => void;
  offset: number | null;
  readBytes: (length: number) => Uint8Array<ArrayBuffer>;
};

/** Read only the requested part without passing bytes through React Native's Blob constructor. */
export const readMobileResourcePart = (
  open: () => ReadableFileHandle,
  start: number,
  end: number,
): Uint8Array<ArrayBuffer> => {
  const handle = open();
  try {
    handle.offset = start;
    const bytes = handle.readBytes(end - start);
    if (bytes.byteLength !== end - start) {
      throw new Error("附件讀取不完整，請重新選擇檔案");
    }
    return bytes;
  } finally {
    handle.close();
  }
};
