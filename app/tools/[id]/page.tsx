import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import ToolDetailClient from '@/components/ToolDetailClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const querySnapshot = await getDocs(collection(db, "products"));
  const paths: { id: string }[] = [];
  querySnapshot.forEach((doc) => {
    paths.push({ id: doc.id });
  });
  return paths;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const docRef = doc(db, "products", params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return { title: 'Sản phẩm không tồn tại' };
  }
  const data = docSnap.data();
  return { title: data.name };
}

export default async function ToolDetailPage({ params }: { params: { id: string } }) {
  const docRef = doc(db, "products", params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const data = docSnap.data();
  
  const product = {
    id: docSnap.id,
    name: data.name || "",
    tag: data.badgeText || (data.category === 'tool' ? "CÔNG CỤ" : "SẢN PHẨM"),
    titlePrefix: data.name?.split(' ')[0] || "",
    titleHighlight: data.name?.split(' ').slice(1).join(' ') || "",
    description: data.description || "",
    price: data.price ? `${Number(data.price).toLocaleString()}đ` : "Miễn phí",
    image: data.imageUrl || "/software-box.jpg",
    gallery: data.gallery || [],
    features: [], 
    theme: "from-neonPurple to-neonGreen",
    glow: "bg-neonPurple/20",
    howToUse: [], 
    faq: data.faqs || []
  };

  return <ToolDetailClient tool={product as any} />;
}
