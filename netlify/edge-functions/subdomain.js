export default async function handler(req, context) {
  return new Response(`Requested from: ${req.url}`, {
    status: 200,
  });
}
