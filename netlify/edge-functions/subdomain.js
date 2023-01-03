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
  const reqUrl = new URL(req.url);
  const reqHost = reqUrl.host;
  const subdomain = reqHost.split(".")[0];
  if (subdomain === "www" || subdomain === "localhost:8888") {
    return;
  }
  const site = await getSiteFromSubdomain(subdomain);
  if (!site) {
    return context.rewrite("/404.html");
  } else {
    const url = site.url + reqUrl.pathname;
    return await fetch(url);
  }
}
