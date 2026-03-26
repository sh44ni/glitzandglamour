'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Save, Image as ImageIcon, ChevronLeft, Type, AlignLeft, Bold, Italic, Link as LinkIcon, List, Heading2, Tag, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

type BlogEditorProps = {
    initialData?: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
        coverImage: string | null;
        published: boolean;
    };
    isEdit?: boolean;
};

export default function BlogEditor({ initialData, isEdit }: BlogEditorProps) {
    const router = useRouter();

    const [title, setTitle] = useState(initialData?.title || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
    const [published, setPublished] = useState(initialData?.published || false);

    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState<'slug' | 'excerpt' | 'image' | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateAI = async (type: 'slug' | 'excerpt' | 'image-alt') => {
        if (!title && type !== 'image-alt') return alert('Please enter a title first to generate SEO elements.');
        
        // For image-alt, prompt them for context
        let textToSend = title;
        if (type === 'image-alt') {
            const context = prompt('What is this image about? (e.g. "Pink acrylic nails set")');
            if (!context) return;
            textToSend = context;
        }

        setIsGenerating(type === 'image-alt' ? 'image' : type);
        try {
            const res = await fetch('/api/admin/blogs/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSend, type })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error);

            if (type === 'slug') setSlug(data.result);
            if (type === 'excerpt') setExcerpt(data.result);
            if (type === 'image-alt') {
                insertHTML(`<img src="IMAGE_URL_HERE" alt="${data.result}" style="border-radius:12px; max-width:100%;" />`);
            }
        } catch (error) {
            alert('AI Generation failed. Check console for details.');
        } finally {
            setIsGenerating(null);
        }
    };

    const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) setCoverImage(data.url);
            else alert(data.error);
        } catch (err) {
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const insertHTML = (htmlString: string) => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = content;
        
        // Special case to wrap text if passing open/close tags
        let newHtml = htmlString;
        if (htmlString === '<b>' || htmlString === '<i>') {
            const closeTag = htmlString === '<b>' ? '</b>' : '</i>';
            const selectedText = currentText.substring(start, end);
            newHtml = htmlString + selectedText + closeTag;
        }

        const newText = currentText.substring(0, start) + newHtml + currentText.substring(end);
        setContent(newText);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + newHtml.length, start + newHtml.length);
        }, 0);
    };

    const handleSave = async () => {
        if (!title || !slug || !content) return alert('Title, Slug, and Content are required!');

        setIsSaving(true);
        const endpoint = isEdit ? `/api/admin/blogs/${initialData!.id}` : '/api/admin/blogs';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, excerpt, content, coverImage, published })
            });
            const data = await res.json();

            if (res.ok) {
                router.push('/admin/blogs');
                router.refresh();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to save blog post.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <Link href="/admin/blogs" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500 }}>
                    <ChevronLeft size={16} /> Back to Blogs
                </Link>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff', fontSize: '14px' }}>
                        <input 
                            type="checkbox" 
                            checked={published} 
                            onChange={e => setPublished(e.target.checked)} 
                            style={{ accentColor: '#FF2D78', width: '18px', height: '18px' }}
                        />
                        Publish instantly
                    </label>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        style={{ 
                            background: '#FF2D78', color: '#fff', border: 'none', borderRadius: '12px', 
                            padding: '12px 24px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        {isSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />} 
                        {isEdit ? 'Update Post' : 'Create Post'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column - Meta & Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Title */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                        <label style={{ display: 'block', color: '#888', fontSize: '13px', fontWeight: 600, marginBottom: '8px', marginLeft: '4px' }}>Blog Title *</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 5 Trends for Summer Nails" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '24px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }} 
                        />
                    </div>

                    {/* Content Editor */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setActiveTab('write')} style={{ background: activeTab === 'write' ? 'rgba(255,45,120,0.2)' : 'transparent', color: activeTab === 'write' ? '#fff' : '#888', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Write</button>
                                <button onClick={() => setActiveTab('preview')} style={{ background: activeTab === 'preview' ? 'rgba(255,45,120,0.2)' : 'transparent', color: activeTab === 'preview' ? '#fff' : '#888', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Preview</button>
                            </div>
                            
                            {activeTab === 'write' && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => insertHTML('<b>')} style={toolBtnStyle} title="Bold"><Bold size={14} /></button>
                                    <button onClick={() => insertHTML('<i>')} style={toolBtnStyle} title="Italic"><Italic size={14} /></button>
                                    <button onClick={() => insertHTML('<h2>Title</h2>')} style={toolBtnStyle} title="Heading 2"><Heading2 size={14} /></button>
                                    <button onClick={() => insertHTML('<ul><li>Item</li></ul>')} style={toolBtnStyle} title="List"><List size={14} /></button>
                                    <button onClick={() => {
                                        const url = prompt('Enter URL:');
                                        if (url) insertHTML(`<a href="${url}">link text</a>`);
                                    }} style={toolBtnStyle} title="Link"><LinkIcon size={14} /></button>
                                </div>
                            )}
                        </div>
                        
                        {activeTab === 'write' ? (
                            <textarea 
                                ref={contentRef}
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Write your gorgeous blog here... (HTML accepted)"
                                style={{ width: '100%', minHeight: '500px', padding: '24px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '15px', lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        ) : (
                            <div 
                                className="blog-content-preview"
                                dangerouslySetInnerHTML={{ __html: content || '<p style="color:#666;text-align:center;">Preview will appear here</p>' }}
                                style={{ padding: '24px', minHeight: '500px', background: '#fff', color: '#111', lineHeight: 1.8 }}
                            />
                        )}
                        <style>{`
                            .blog-content-preview h2 { font-size: 24px; font-weight: 700; margin-top: 32px; margin-bottom: 16px; color: #111; }
                            .blog-content-preview p { margin-bottom: 20px; font-size: 16px; color: #333; }
                            .blog-content-preview a { color: #FF2D78; text-decoration: underline; }
                            .spin { animation: spin 1s linear infinite; }
                            @keyframes spin { 100% { transform: rotate(360deg); } }
                        `}</style>
                    </div>
                </div>

                {/* Right Column - SEO & Images */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* SEO Slug */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px', fontWeight: 600 }}>
                                <LinkIcon size={14} /> URL Slug *
                            </label>
                            <button 
                                onClick={() => handleGenerateAI('slug')}
                                disabled={isGenerating === 'slug'}
                                style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: '#FF2D78', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                {isGenerating === 'slug' ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />} 
                                Auto-SEO
                            </button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="my-awesome-post" 
                            value={slug}
                            onChange={e => setSlug(e.target.value.toLowerCase().replace(/\\s+/g, '-'))}
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '14px', fontFamily: 'monospace' }} 
                        />
                        <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#555' }}>glitzandglamours.com/blogs/{slug || '...'}</p>
                    </div>

                    {/* Excerpt */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px', fontWeight: 600 }}>
                                <AlignLeft size={14} /> Meta Excerpt
                            </label>
                            <button 
                                onClick={() => handleGenerateAI('excerpt')}
                                disabled={isGenerating === 'excerpt'}
                                style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: '#FF2D78', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                {isGenerating === 'excerpt' ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />} 
                                Gen AI
                            </button>
                        </div>
                        <textarea 
                            placeholder="A brief summary for Google search results..." 
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '13px', minHeight: '100px', resize: 'vertical' }} 
                        />
                    </div>

                    {/* Cover Image */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                            <ImageIcon size={14} /> Cover Image
                        </label>
                        
                        {coverImage ? (
                            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                                <img src={coverImage} alt="Cover" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                                <button onClick={() => setCoverImage('')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Change</button>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', marginBottom: '12px' }}>
                                {isUploading ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#888' }}>
                                        <Loader2 size={24} className="spin" color="#FF2D78" />
                                        <span style={{ fontSize: '12px' }}>Uploading to MinIO...</span>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon size={24} color="#666" style={{ marginBottom: '8px' }} />
                                        <p style={{ color: '#888', fontSize: '12px', margin: '0 0 12px' }}>Upload a high-quality cover photo</p>
                                        <button onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Select File</button>
                                        <input type="file" ref={fileInputRef} onChange={handleUploadCover} accept="image/*" style={{ display: 'none' }} />
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Groq Alt Text Generator for embedded images */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '8px' }}>
                            <p style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Want to insert an SEO-optimized image directly into the post body?</p>
                            <button 
                                type="button"
                                disabled={isGenerating === 'image'}
                                onClick={() => handleGenerateAI('image-alt')}
                                style={{ width: '100%', background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.2)', color: '#FF2D78', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                {isGenerating === 'image' ? <Loader2 size={14} className="spin" /> : <Tag size={14} />} 
                                Generate Image HTML + AI Alt Text
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const toolBtnStyle = { 
    background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ccc', 
    width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', 
    display: 'flex', alignItems: 'center', justifyContent: 'center' 
};
