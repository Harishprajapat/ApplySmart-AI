type PageMetaOptions = {
  title: string;
  description: string;
};

export function buildPageMeta({ title, description }: PageMetaOptions) {
  const fullTitle = `${title} | ApplySmart AI`;

  return [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
  ];
}
