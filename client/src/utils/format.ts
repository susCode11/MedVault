/**
 * Formats a Unix timestamp (in milliseconds or nanoseconds) to a readable date.
 * Assumes Azle backend passes nanoseconds, so it divides by 1,000,000 if necessary.
 */
export const formatDate = (timestamp: bigint | number | string): string => {
  let ms = Number(timestamp);
  
  // If the timestamp is way too large, it's likely in nanoseconds (Azle default)
  if (ms > 1e13) {
    ms = Math.floor(ms / 1_000_000);
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
};

/**
 * Truncates an ICP Principal for UI display (e.g., 'r7inp...-cai').
 */
export const truncatePrincipal = (principal: string): string => {
  if (principal.length <= 15) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
};

/**
 * Converts bytes into a human-readable string (KB, MB, etc.)
 */
export const formatBytes = (bytes: number | bigint, decimals = 2): string => {
  const numBytes = Number(bytes);
  if (!+numBytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(numBytes) / Math.log(k));

  return `${parseFloat((numBytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Formats a record category into a display-friendly string
export const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
