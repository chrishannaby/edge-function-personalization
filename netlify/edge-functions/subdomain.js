import { connect } from "https://unpkg.com/@planetscale/database";

const config = {
  host: Deno.env.get("DATABASE_HOST"),
  username: Deno.env.get("DATABASE_USERNAME"),
  password: Deno.env.get("DATABASE_PASSWORD"),
};

async function getSiteFromSubdomain(subdomain) {
  const conn = await connect(config);
  const sitesData = await conn.execute("SELECT * FROM sites WHERE name = ?", [
    subdomain,
  ]);
  return sitesData.rows[0];
}

export default async function handler(req, context) {
  const host = new URL(req.url).host;
  const subdomain = host.split(".")[0];
  if (subdomain === "www" || subdomain === "localhost:8888") {
    return;
  }

  console.log("subdomain", subdomain);
  const site = await getSiteFromSubdomain(subdomain);
  console.log("site", site);
  if (!site) {
    return context.rewrite("/404.html");
  } else {
    return context.json(site);
  }
}
