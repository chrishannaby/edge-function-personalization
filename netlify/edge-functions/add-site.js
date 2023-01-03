export default function handler(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const search = url.search;
  console.log(search);
  const slug = crypto.randomUUID();
  return Response.redirect(`${origin}/sites/${slug}`, 302);
}
