import { fetchPublicBlogSummaries } from "$lib/github";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  // Set CDN cache headers (5 minutes)
  setHeaders({
    "cache-control": "public, max-age=300, s-maxage=300",
  });

  const blogs = await fetchPublicBlogSummaries(fetch);
  return { blogs };
};
