export default async function handler(req, context) {
  const host = new URL(req.url).host;
  const subdomain = host.split(".")[0];
  if (subdomain === "www") {
    return;
  }

  return new Response(`Requested from: ${req.url}`, {
    status: 200,
  });
}
