/**
 * Date Formatting Utilities
 * -------------------------
 * All dates should be passed as ISO string or Date object.
 * These helpers are UI-only and must not mutate data.
 */

/* ---------- Guards ---------- */
const toDate = (value) => {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

/* ---------- Formats ---------- */

/** Sun, Mar 8, 2026 */
export const formatShortDate = (value) => {
  const date = toDate(value)
  if (!date) return ""

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/** March 8, 2026 */
export const formatLongDate = (value) => {
  const date = toDate(value)
  if (!date) return ""

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/** 8 Mar 2026 */
export const formatCompactDate = (value) => {
  const date = toDate(value)
  if (!date) return ""

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

/** Sun, Mar 8 */
export const formatWeekdayDate = (value) => {
  const date = toDate(value)
  if (!date) return ""

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)
}

/** ISO → 08/03/2026 */
export const formatSlashDate = (value) => {
  const date = toDate(value)
  if (!date) return ""

  return new Intl.DateTimeFormat("en-GB").format(date)
}

/* ---------- Time ---------- */

/** 6:30 PM */
export const formatTime12h = (time) => {
  if (!time) return ""

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`1970-01-01T${time}`))
}

/** 18:30 */
export const formatTime24h = (time) => {
  if (!time) return ""

  return time
}

/* ---------- Date + Time ---------- */

/** Sun, Mar 8 • 6:30 PM */
export const formatDateTime = (date, time) => {
  if (!date) return ""

  const formattedDate = formatShortDate(date)
  const formattedTime = time ? formatTime12h(time) : ""

  return formattedTime
    ? `${formattedDate} • ${formattedTime}`
    : formattedDate
}
