// Vite rewrites BASE_URL to '/lari-invoice/' at build time and '/' in dev,
// so every internal link goes through here rather than hard-coding either one.
const BASE = import.meta.env.BASE_URL

/** Absolute href for a page directory. `href('')` is the home page. */
export function href(path) {
  return path ? `${BASE}${path}/` : BASE
}

/** True when `path` is the page currently being viewed. */
export function isCurrent(path) {
  const here = window.location.pathname.replace(/index\.html$/, '')
  const there = href(path)
  return here === there || here === there.replace(/\/$/, '')
}
