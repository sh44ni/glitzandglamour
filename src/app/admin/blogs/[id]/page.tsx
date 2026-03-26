import { prisma } from '@/lib/prisma';
import BlogEditor from '../BlogEditor';
import { notFound } from 'next/navigation';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const blog = await prisma.blogPost.findUnique({ where: { id } });
    
    if (!blog) return notFound();

    return (
        <div style={{ padding: '0 10px' }}>
            <BlogEditor isEdit={true} initialData={blog} />
        </div>
    );
}
