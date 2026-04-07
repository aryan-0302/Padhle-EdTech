/** Compare Mongo-style ids from URL strings vs API objects. */
export function matchId(a, b) {
  if (a == null || b == null) return false
  return String(a) === String(b)
}
