import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const blog = await prisma.blogPost.findUnique({ where: { id } });
        if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        return NextResponse.json({ blog });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const { title, slug, excerpt, content, coverImage, published } = await req.json();

        // Check slug uniqueness
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing && existing.id !== id) {
            return NextResponse.json({ error: 'Slug already taken by another post' }, { status: 400 });
        }

        const updatedBlog = await prisma.blogPost.update({
            where: { id },
            data: { title, slug, excerpt, content, coverImage, published },
        });

        return NextResponse.json({ blog: updatedBlog });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        await prisma.blogPost.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
}
