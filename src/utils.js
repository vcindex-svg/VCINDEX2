/**
 * Converts a page name into a relative URL path.
 * Matches the Base44 convention: createPageUrl("Marketplace") → "/Marketplace"
 */
export function createPageUrl(pageName) {
  return `/${pageName}`
}
