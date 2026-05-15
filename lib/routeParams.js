export function getRouteParams(req, basePath = '') {
  const query = req.query || {};

  if (query.params) {
    return Array.isArray(query.params) ? query.params : [query.params];
  }

  if (query.slug) {
    return Array.isArray(query.slug) ? query.slug : [query.slug];
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = url.pathname;

    if (basePath && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length);
    }

    return pathname
      .split('/')
      .filter(Boolean)
      .map(decodeURIComponent);
  } catch {
    return [];
  }
}
