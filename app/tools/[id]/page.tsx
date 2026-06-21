import { notFound } from 'next/navigation';
import { TOOLS } from '@/data/tools';
import ToolDetailClient from '@/components/ToolDetailClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    id: tool.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tool = TOOLS.find((t) => t.id === params.id);
  if (!tool) {
    return {
      title: 'Tool Not Found',
    };
  }
  return {
    title: `${tool.titlePrefix} ${tool.titleHighlight}`,
  };
}

export default function ToolDetailPage({ params }: { params: { id: string } }) {
  const tool = TOOLS.find((t) => t.id === params.id);

  if (!tool) {
    notFound();
  }

  return <ToolDetailClient tool={tool} />;
}
