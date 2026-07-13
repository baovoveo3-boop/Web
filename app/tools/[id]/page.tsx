import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import ToolDetailClient from '@/components/ToolDetailClient';
import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';

export async function generateStaticParams() {
  try {
    const querySnapshot = await adminDb.collection("products").get();
    const paths: { id: string }[] = [];
    querySnapshot.forEach((doc: any) => {
      paths.push({ id: doc.id });
    });
    return paths;
  } catch (error) {
    console.error("Error generating static params for tools:", error);
    return [{ id: 'ban-content' }, { id: 'healing-bird' }];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const docRef = adminDb.collection("products").doc(params.id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return { title: 'Sản phẩm không tồn tại' };
  }
  const data = docSnap.data();
  return { title: data?.name };
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const docRef = adminDb.collection("products").doc(params.id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    notFound();
  }

  const data = docSnap.data();
  const staticData = TOOLS.find(t => t.id === params.id);
  
  const product = {
    id: docSnap.id,
    name: data?.name || "",
    tag: data?.badgeText || staticData?.tag || (data?.category === 'tool' ? "CÔNG CỤ" : "SẢN PHẨM"),
    titlePrefix: data?.name?.split(' ')[0] || staticData?.titlePrefix || "",
    titleHighlight: data?.name?.split(' ').slice(1).join(' ') || staticData?.titleHighlight || "",
    description: data?.description || staticData?.description || "",
    price: data?.price ? `${Number(data.price).toLocaleString()}đ` : "Miễn phí",
    originalPriceText: data?.originalPrice ? `${Number(data.originalPrice).toLocaleString()}đ` : staticData?.originalPriceText,
    image: data?.imageUrl || staticData?.image || "/software-box.jpg",
    gallery: data?.gallery || staticData?.gallery || ["/software-box.jpg", "/software-box-2.jpg", "/software-box.jpg"],
    features: data?.features?.length > 0 ? data.features : (staticData?.features || []), 
    theme: staticData?.theme || "from-neonPurple to-neonGreen",
    glow: staticData?.glow || "bg-neonPurple/20",
    howToUse: data?.howToUse?.length > 0 ? data.howToUse : (staticData?.howToUse || []), 
    faq: data?.faqs?.length > 0 ? data.faqs : (staticData?.faq || []),
    allow_trial: data?.allow_trial || false
  };

  return <ToolDetailClient tool={product as any} />;
}
