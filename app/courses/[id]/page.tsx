import { notFound } from 'next/navigation';
import { COURSES_DATA } from '@/data/courses';
import CourseDetailClient from '@/components/CourseDetailClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return COURSES_DATA.map((course) => ({
    id: course.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const course = COURSES_DATA.find((c) => c.id === params.id);
  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }
  return {
    title: `${course.titlePrefix} ${course.titleHighlight}`,
  };
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = COURSES_DATA.find((c) => c.id === params.id);

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}
