import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import CourseDetailClient from '@/components/CourseDetailClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const paths: { id: string }[] = [];
    querySnapshot.forEach((doc) => {
      paths.push({ id: doc.id });
    });
    return paths;
  } catch (error) {
    console.error("Error generating static params for courses:", error);
    return [{ id: 'premium-course' }];
  }
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

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const docRef = doc(db, "products", params.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const data = docSnap.data();
  
  const product = {
    id: docSnap.id,
    name: data.name || "",
    tag: data.badgeText || (data.category === 'course' ? "KHÓA HỌC" : "SẢN PHẨM"),
    titlePrefix: data.name?.split(' ')[0] || "",
    titleHighlight: data.name?.split(' ').slice(1).join(' ') || "",
    description: data.description || "",
    price: data.price ? `${Number(data.price).toLocaleString()}đ` : "Miễn phí",
    image: data.imageUrl || "/software-box.jpg",
    gallery: data.gallery || [],
    features: [], 
    theme: "from-blue-500 to-indigo-500",
    glow: "bg-blue-500/20",
    modules: [], 
    faq: data.faqs || []
  };

  return <CourseDetailClient course={product as any} />;
}
