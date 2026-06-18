import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillspace.example.com';

  const routes = ['', '/packages', '/docs', '/create', '/playground'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // You would typically fetch dynamic packages here from the database
  // to add them to the sitemap, but for now we just return the static ones.
  // Example:
  // const packages = await prisma.package.findMany({ select: { name: true, updatedAt: true } });
  // const packageUrls = packages.map(pkg => ({ url: `${baseUrl}/packages/${pkg.name}`, lastModified: pkg.updatedAt, ... }));

  return [...routes];
}
