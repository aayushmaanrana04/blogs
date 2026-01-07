import { getBlogBySlug } from "$lib/data/blogs";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch }) => {
  // Special case for test-blog: fetch external markdown
  if (params.slug === "test-blog") {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/Raphire/Win11Debloat/refs/heads/master/README.md",
      );
      if (!response.ok) {
        throw error(404, "Could not fetch README");
      }
      const content = await response.text();

      return {
        blog: {
          slug: "test-blog",
          title: "Win11Debloat",
          excerpt:
            "A PowerShell script to remove bloatware and improve Windows 11/10",
          content: content,
          date: "2026-01-07",
          category: "Documentation",
          author: "Raphire",
          readTime: 10,
          isExternalMarkdown: true,
        },
      };
    } catch (e) {
      throw error(500, "Failed to fetch external markdown");
    }
  }

  const blog = getBlogBySlug(params.slug);

  if (!blog) {
    throw error(404, "Blog post not found");
  }

  return { blog };
};
