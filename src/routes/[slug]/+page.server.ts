import { fetchBlog } from "$lib/github";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
  // Set CDN cache headers (10 minutes)
  setHeaders({
    "cache-control": "public, max-age=600, s-maxage=600",
  });

  try {
    const blog = await fetchBlog(params.slug, fetch);
    return { blog };
  } catch (e) {
    if (e instanceof Error && e.message === "Blog post not found") {
      throw error(404, "Blog post not found");
    }
    throw error(500, "Failed to fetch blog post");
  }
};
