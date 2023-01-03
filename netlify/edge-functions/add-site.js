import words from "https://dev.jspm.io/friendly-words";
import { connect } from "https://unpkg.com/@planetscale/database@1.5.0/dist/index.js";

const randomSiteName = () => {
  const { predicates, objects } = words;
  const predicate = predicates[Math.floor(Math.random() * predicates.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];
  const id = crypto.randomUUID().slice(0, 6);
  return `${predicate}-${object}-${id}`;
};

const config = {
  host: Deno.env.get("DATABASE_HOST"),
  username: Deno.env.get("DATABASE_USERNAME"),
  password: Deno.env.get("DATABASE_PASSWORD"),
};

async function createSite(db, siteConfig) {
  await db.execute(
    `INSERT INTO sites (slug, origin, start_path, selector, replacement_text) 
     VALUES (:slug, :origin, :startPath, :selector, :replacementText)`,
    siteConfig
  );
}

export default async function handler(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const params = new URLSearchParams(url.search);
  const siteUrl = new URL(`https://${params.get("url")}`);
  const siteConfig = {
    slug: randomSiteName(),
    origin: siteUrl.origin,
    startPath: siteUrl.pathname,
    selector: params.get("selector"),
    replacementText: params.get("replacement_text"),
  };
  const db = await connect(config);
  await createSite(db, siteConfig);
  return Response.redirect(`${origin}/sites/${siteConfig.slug}`, 302);
}
