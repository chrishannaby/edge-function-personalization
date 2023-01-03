import { connect } from "https://unpkg.com/@planetscale/database";

const config = {
  host: Deno.env.get("PS_HOST"),
  username: Deno.env.get("PS_USERNAME"),
  password: Deno.env.get("PS_PASSWORD"),
};

async function getSiteFromSubdomain(subdomain) {
  const conn = await connect(config);
  const sitesData = await conn.excecute(
    `SELECT * FROM sites WHERE subdomain = ?`,
    subdomain
  );
  return sitesData.rows[0];
}

export default async function handler(req, context) {
  const host = new URL(req.url).host;
  const subdomain = host.split(".")[0];
  if (subdomain === "www") {
    return;
  }

  const site = await getSiteFromSubdomain(subdomain);
  if (!site) {
    context.rewrite = "/404.html";
  } else {
    return context.json(site);
  }
}
