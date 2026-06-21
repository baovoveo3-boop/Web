import { notFound } from 'next/navigation';
import { COMBOS_DATA } from '@/data/combos';
import ComboDetailClient from '@/components/ComboDetailClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return COMBOS_DATA.map((combo) => ({
    id: combo.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const combo = COMBOS_DATA.find((c) => c.id === params.id);
  if (!combo) {
    return {
      title: 'Combo Not Found',
    };
  }
  return {
    title: `${combo.titlePrefix} ${combo.titleHighlight}`,
  };
}

export default function ComboDetailPage({ params }: { params: { id: string } }) {
  const combo = COMBOS_DATA.find((c) => c.id === params.id);

  if (!combo) {
    notFound();
  }

  return <ComboDetailClient combo={combo} />;
}
