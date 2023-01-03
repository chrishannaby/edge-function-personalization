import { connect } from "https://unpkg.com/@planetscale/database@1.5.0/dist/index.js";
import { HTMLRewriter } from "https://raw.githubusercontent.com/worker-tools/html-rewriter/master/index.ts";

const config = {
  host: Deno.env.get("DATABASE_HOST"),
  username: Deno.env.get("DATABASE_USERNAME"),
  password: Deno.env.get("DATABASE_PASSWORD"),
};

async function getSiteFromSubdomain(db, subdomain) {
  const sitesData = await db.execute("SELECT * FROM sites WHERE name = ?", [
    subdomain,
  ]);
  return sitesData.rows[0];
}

async function getExperimentsForSite(db, siteId) {
  const experimentsData = await db.execute(
    "SELECT * FROM experiments WHERE site_id = ?",
    [siteId]
  );
  return experimentsData.rows;
}

export default async function handler(req, context) {
  const reqUrl = new URL(req.url);
  const reqHost = reqUrl.host;
  const subdomain = reqHost.split(".")[0];
  if (subdomain === "www" || subdomain === "localhost:8888") {
    return;
  }
  const db = await connect(config);
  const site = await getSiteFromSubdomain(db, subdomain);
  if (!site) {
    return context.rewrite("/404.html");
  } else {
    const url = site.url + reqUrl.pathname;
    const response = await fetch(url);
    if (response.headers.get("content-type").includes("text/html")) {
      const experiements = await getExperimentsForSite(db, site.id);
      if (experiements.length > 0) {
        const experiment = experiements[0];
        const transformedResponse = new HTMLRewriter()
          .on(experiment.selector, {
            element(element) {
              element.setInnerContent(experiment.replacement_text);
            },
          })
          .transform(response);
        return transformedResponse;
      } else {
        return response;
      }
    } else {
      return response;
    }
  }
}
