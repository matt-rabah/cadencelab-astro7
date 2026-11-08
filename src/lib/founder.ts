// Single source for the founder's public identity. Used by the site-wide
// JSON-LD (SEO.astro), blog post author data, the About page, and the article
// author bio, so structured data and visible links always agree.
export const FOUNDER = {
  name: "Matt Rabah",
  jobTitle: "Founder and CXO",
  aboutPath: "/about/",
  // Stable JSON-LD identifier for the Person node.
  schemaId: "https://cadencelab.co/about/#matt-rabah",
  linkedIn: "https://www.linkedin.com/in/mattrabah/",
} as const;
