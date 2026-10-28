/** Resolve aliases, default missing schemes to https://, and drop trailing slashes. */
export const normalizeInstanceUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  const withProtocol = /:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
};
