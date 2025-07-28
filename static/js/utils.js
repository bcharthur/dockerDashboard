export function formatBytesMBGB (bytes) {
  const GB = 1_000_000_000;
  const MB = 1_000_000;
  if (bytes >= GB) return (bytes / GB).toFixed(2) + ' GB';
  return (bytes / MB).toFixed(2) + ' MB';
}
