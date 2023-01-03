export default function handler(req) {
  const origin = new URL(req.url).origin;
  const slug = crypto.randomUUID();
  return Response.redirect(`${origin}/sites/${slug}`, 302);
}
