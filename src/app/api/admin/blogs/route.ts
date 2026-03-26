import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const blogs = await prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ blogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { title, slug, excerpt, content, coverImage, published } = await req.json();

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
        }

        // Check if slug exists
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: 'A blog with this slug already exists. Please modify the slug.' }, { status: 400 });
        }

        const newBlog = await prisma.blogPost.create({
            data: {
                title,
                slug,
                excerpt,
                content,
                coverImage,
                published: published || false,
                author: 'JoJany',
            },
        });

        return NextResponse.json({ blog: newBlog });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
