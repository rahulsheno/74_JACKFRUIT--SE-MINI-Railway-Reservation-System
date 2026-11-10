/**
 * Date helper to prevent UTC timezone shift bugs
 * Ensures all dates use the user's local timezone (e.g. IST) instead of UTC.
 */
export function getLocalDateString(d = new Date()) {
  const dateObj = typeof d === 'number' ? new Date(d) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

