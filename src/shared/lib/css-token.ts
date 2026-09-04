type CssColorToken = `--color-${string}`;

export function readCssColorToken(token: CssColorToken): string {
  return window.getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}
