type MetaTagsConfig = {
  title: string;
  description: string;
  image: string;
  url: string;
};

export function updateMetaTags({ title, description, image, url }: MetaTagsConfig) {
  // Update basic meta tags
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);

  // Update Open Graph meta tags
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);

  // Update Twitter meta tags
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', image);
  document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', url);
}