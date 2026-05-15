export function getRouteParams(req) {
  const raw = req.query?.params;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}
