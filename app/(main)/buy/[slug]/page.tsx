import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${decodeURIComponent(slug)} | OneGold`,
    description: 'Verified gold product details',
  };
}

/** Dynamic product route (Nexus: /productdetails/[slug]). Content is rendered by the App shell. */
export default async function ProductSlugPage({ params }: Props) {
  await params;
  return null;
}
