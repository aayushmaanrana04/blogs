export interface Blog {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  author: string;
  readTime: number;
}

export const blogs: Blog[] = [
  {
    slug: "evolution-of-modern-typography",
    title: "The Evolution of Modern Typography in Digital Design",
    excerpt:
      "An exploration of how typography has transformed from print to digital mediums, and the principles that guide contemporary typographic choices.",
    content: `
Typography has undergone a remarkable transformation in the digital age. What began as a craft rooted in physical type and printing presses has evolved into a sophisticated discipline that shapes how we consume information online.

The transition from print to digital brought unique challenges. Screen resolution, pixel density, and variable viewing distances forced designers to reconsider traditional typographic principles. Fonts that looked elegant in print often failed to translate well to early screens, leading to the development of screen-optimized typefaces.

Today, variable fonts and responsive typography allow designers to create adaptive reading experiences that adjust to different devices and contexts. The principles remain constant: readability, hierarchy, and emotional resonance. But the tools and possibilities have expanded exponentially.

## The Rise of Variable Fonts

Modern designers must consider not just aesthetic beauty, but accessibility, performance, and cross-platform consistency. Variable fonts represent one of the most significant advances in this space, allowing a single font file to contain an entire family of variations.

## Principles That Endure

Despite technological changes, certain principles remain timeless. Contrast, rhythm, and proportion continue to guide effective typography. The goal remains the same as it was centuries ago: to facilitate communication and enhance understanding.

---

The future of typography is bright, with new tools and technologies emerging constantly. Yet the fundamentals established by master typographers centuries ago continue to inform best practices today.
		`.trim(),
    date: "2026-01-05",
    category: "Design",
    author: "Eleanor Hayes",
    readTime: 4,
  },
  {
    slug: "sustainable-architecture",
    title: "Sustainable Architecture: Building for Tomorrow",
    excerpt:
      "How contemporary architects are integrating environmental consciousness with innovative design to create buildings that harmonize with nature.",
    content: `
Architecture has always been about creating spaces for human habitation. But in an era of climate change and environmental awareness, the discipline has evolved to embrace a broader responsibility: building structures that work with nature rather than against it.

Sustainable architecture isn't just about solar panels and green roofs, though these play important roles. It's about a fundamental rethinking of how buildings interact with their environments, from the materials used in construction to the way structures manage energy and water throughout their lifespans.

## Passive Design Strategies

The most elegant sustainable buildings often rely on passive design strategies that have been used for millennia. Proper orientation, natural ventilation, thermal mass, and strategic shading can dramatically reduce a building's energy needs without any high-tech interventions.

## Materials Matter

The choice of building materials has profound environmental implications. From the embodied carbon in concrete to the renewability of timber, architects must now consider the full lifecycle impact of their material choices.

> "The greenest building is the one that's already built."
> — Carl Elefante

## Looking Forward

As building codes evolve and clients increasingly demand sustainable solutions, architecture is being pushed toward ever more innovative approaches. The buildings of tomorrow will need to be not just sustainable, but regenerative—actively improving their environments rather than merely minimizing harm.

---

The challenge for architects is to meet these demands while still creating spaces that inspire and delight. The best sustainable architecture proves that environmental responsibility and aesthetic excellence are not mutually exclusive.
		`.trim(),
    date: "2026-01-03",
    category: "Architecture",
    author: "Marcus Chen",
    readTime: 5,
  },
  {
    slug: "quiet-revolution-analog-photography",
    title: "The Quiet Revolution of Analog Photography",
    excerpt:
      "In an age of instant digital images, film photography is experiencing an unexpected renaissance among a new generation of photographers seeking authenticity.",
    content: `
In an age of instant digital images, film photography is experiencing an unexpected renaissance among a new generation of photographers. This return to analog isn't mere nostalgia—it represents a fundamental reconsideration of what photography means and what it can offer.

The digital revolution promised convenience and immediacy, and it delivered. But something was lost in translation: the deliberate, contemplative process that defined photography for over a century. Film photographers speak of a different relationship with their craft, one defined by patience, intention, and acceptance of imperfection.

## The Appeal of Limitations

Constraints breed creativity. With a roll of 36 exposures instead of a memory card holding thousands, every shot matters. This limitation forces photographers to be more intentional, more present, more thoughtful about what they choose to capture.

## The Aesthetic Difference

Film has a distinctive look that digital processing can approximate but never quite replicate. The grain, the color rendition, the dynamic range—these qualities give film images a character that many find more emotionally resonant than their digital equivalents.

## A Slower Process

From loading the film to waiting for development, analog photography enforces a slower pace. In a world of instant gratification, this delay has become part of the appeal. The anticipation of seeing developed images creates a different relationship with the photographs themselves.

---

The analog revival isn't about rejecting digital technology—most film photographers use both mediums. It's about expanding the photographic vocabulary and recognizing that different tools serve different purposes. Sometimes, the old ways still have something to teach us.
		`.trim(),
    date: "2025-12-28",
    category: "Photography",
    author: "Sofia Andersson",
    readTime: 6,
  },
];

export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((blog) => blog.slug === slug);
}

export function getAllBlogs(): Blog[] {
  return blogs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
