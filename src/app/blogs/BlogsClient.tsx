'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Eye, Search, Tag, TrendingUp } from 'lucide-react';

export interface BlogCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string;
  createdAt: string;
  tags: string | null;
  viewCount?: number;
  readTime?: number;
}

interface Props {
  blogs: BlogCardData[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadTime(excerpt: string | null): number {
  if (!excerpt) return 2;
  const words = excerpt.trim().split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 200));
}

function getAllTags(blogs: BlogCardData[]): string[] {
  const set = new Set<string>();
  blogs.forEach(b => {
    if (b.tags) {
      b.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => set.add(t));
    }
  });
  return Array.from(set).slice(0, 8);
}

function BlogCard({ blog, index, coverUrl }: { blog: BlogCardData; index: number; coverUrl: string | null }) {
  const readTime = estimateReadTime(blog.excerpt);
  const tags = blog.tags ? blog.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="blog-card-link"
      style={{ textDecoration: 'none', display: 'block', animationDelay: `${index * 0.05}s` }}
    >
      <article className="blog-card">
        {/* Cover Image */}
        <div className="blog-card-img-wrap">
          {coverUrl && !imgFailed ? (
            <img
              src={coverUrl}
              alt={blog.title}
              width={800}
              height={450}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="blog-card-img"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="blog-card-img-placeholder">
              <span className="blog-card-placeholder-text">G&amp;G</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="blog-card-img-overlay" />
          {/* Tag badge on image */}
          {tags[0] && (
            <span className="blog-card-tag-badge">
              <Tag size={10} /> {tags[0]}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="blog-card-body">
          <div className="blog-card-meta">
            <span className="blog-card-meta-item">
              <Calendar size={11} color="#ff8ab8" /> {formatDate(blog.createdAt)}
            </span>
            <span className="blog-card-meta-divider">·</span>
            <span className="blog-card-meta-item">
              <Clock size={11} color="#E2C286" /> {readTime} min read
            </span>
            {(blog.viewCount ?? 0) > 0 && (
              <>
                <span className="blog-card-meta-divider">·</span>
                <span className="blog-card-meta-item">
                  <Eye size={11} color="#dfd2d9" /> {blog.viewCount}
                </span>
              </>
            )}
          </div>

          <h2 className="blog-card-title">{blog.title}</h2>

          {blog.excerpt && (
            <p className="blog-card-excerpt">{blog.excerpt}</p>
          )}

          <div className="blog-card-footer">
            <div className="blog-card-author">
              <div className="blog-card-avatar">
                {blog.author.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <span className="blog-card-author-name">{blog.author}</span>
            </div>
            <span className="blog-card-read-cta">
              Read <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogsClient({ blogs }: Props) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => getAllTags(blogs), [blogs]);

  const filtered = useMemo(() => {
    let result = blogs;
    if (activeTag) {
      result = result.filter(b =>
        b.tags && b.tags.split(',').map(t => t.trim()).includes(activeTag)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.excerpt?.toLowerCase().includes(q)) ||
        b.author.toLowerCase().includes(q)
      );
    }
    return result;
  }, [blogs, search, activeTag]);

  return (
    <>
      <style>{`
        /* ─── Search Bar ─── */
        .blogs-search-wrap {
          position: relative;
          max-width: 500px;
          margin: 0 auto 28px;
        }
        .blogs-search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #dfd2d9;
          pointer-events: none;
        }
        .blogs-search {
          width: 100%;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 50px;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          padding: 14px 20px 14px 46px;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }
        .blogs-search:focus {
          border-color: rgba(255, 138, 184, 0.6);
          box-shadow: 0 0 0 4px rgba(255, 45, 120, 0.12);
        }
        .blogs-search::placeholder { color: #c8b8c2; }

        /* ─── Tag Filters ─── */
        .blogs-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 44px;
        }
        .blogs-tag-btn {
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(20, 10, 17, 0.85);
          color: #e2d6dc;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          text-transform: capitalize;
        }
        .blogs-tag-btn:hover {
          border-color: rgba(255, 138, 184, 0.45);
          color: #fff;
          background: rgba(255, 45, 120, 0.12);
        }
        .blogs-tag-btn.active {
          background: rgba(255, 45, 120, 0.22);
          border-color: rgba(255, 138, 184, 0.6);
          color: #fff;
          box-shadow: 0 4px 18px rgba(255, 45, 120, 0.25);
        }

        /* ─── Blog Grid ─── */
        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 28px;
        }
        @media (min-width: 960px) {
          .blogs-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* ─── Blog Card ─── */
        .blog-card-link {
          animation: blogCardIn 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes blogCardIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .blog-card {
          position: relative;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s, box-shadow 0.3s;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.38);
        }
        .blog-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.4), transparent);
          z-index: 3;
          pointer-events: none;
        }
        .blog-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 138, 184, 0.4);
          box-shadow: 0 24px 60px -12px rgba(255, 45, 120, 0.22);
        }

        /* ─── Card Image ─── */
        .blog-card-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(32, 15, 26, 0.95), rgba(14, 7, 12, 0.98));
          flex-shrink: 0;
        }
        .blog-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .blog-card:hover .blog-card-img {
          transform: scale(1.05);
        }
        .blog-card-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.95), rgba(14, 7, 12, 0.98));
        }
        .blog-card-placeholder-text {
          font-size: 28px;
          font-weight: 800;
          color: #ff8ab8;
          letter-spacing: -1px;
        }
        .blog-card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(14, 7, 12, 0.78) 0%, transparent 60%);
          pointer-events: none;
        }
        .blog-card-tag-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(14, 7, 12, 0.9);
          border: 1px solid rgba(255, 138, 184, 0.42);
          backdrop-filter: blur(8px);
          color: #ff8ab8;
          font-family: 'Poppins', sans-serif;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 11px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 4px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ─── Card Body ─── */
        .blog-card-body {
          padding: 22px 24px 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .blog-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .blog-card-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #dfd2d9;
          font-family: 'Poppins', sans-serif;
        }
        .blog-card-meta-divider {
          color: #c8b8c2;
          font-size: 12px;
        }
        .blog-card-title {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          line-height: 1.35;
          margin: 0 0 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }
        .blog-card:hover .blog-card-title { color: #ff8ab8; }

        .blog-card-excerpt {
          font-size: 13.5px;
          color: #e2d6dc;
          line-height: 1.66;
          margin: 0 0 20px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .blog-card-author {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .blog-card-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 45, 120, 0.22);
          border: 1px solid rgba(255, 138, 184, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }
        .blog-card-author-name {
          font-size: 12px;
          font-weight: 600;
          color: #dfd2d9;
          font-family: 'Poppins', sans-serif;
        }
        .blog-card-read-cta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          color: #ff8ab8;
          font-family: 'Poppins', sans-serif;
          letter-spacing: 0.3px;
          transition: gap 0.2s;
        }
        .blog-card:hover .blog-card-read-cta { gap: 8px; }

        /* ─── Empty State ─── */
        .blogs-empty {
          text-align: center;
          padding: 72px 24px;
          grid-column: 1 / -1;
          background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
        }
        .blogs-empty-icon {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 45, 120, 0.14);
          border: 1px solid rgba(255, 138, 184, 0.35);
        }
        .blogs-empty-title { font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 8px; }
        .blogs-empty-sub { font-size: 14px; color: #e2d6dc; margin: 0; }

        /* ─── Trending Strip ─── */
        .trending-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding: 0 0 8px;
          margin-bottom: 28px;
          scrollbar-width: none;
        }
        .trending-strip::-webkit-scrollbar { display: none; }
        .trending-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: #ff8ab8;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* Search */}
      <div className="blogs-search-wrap">
        <Search size={15} className="blogs-search-icon" />
        <input
          className="blogs-search"
          type="search"
          placeholder="Search articles…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search blog articles"
        />
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="blogs-tags" role="group" aria-label="Filter by topic">
          <button
            className={`blogs-tag-btn${!activeTag ? ' active' : ''}`}
            onClick={() => setActiveTag(null)}
          >
            All Posts
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`blogs-tag-btn${activeTag === tag ? ' active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Trending Strip */}
      {!search && !activeTag && blogs.length > 0 && (
        <div className="trending-strip">
          <span className="trending-label"><TrendingUp size={12} /> Trending:</span>
          {blogs.slice(0, 4).map(b => (
            <Link
              key={b.id}
              href={`/blogs/${b.slug}`}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '12px',
                color: '#e2d6dc',
                background: 'rgba(20, 10, 17, 0.85)',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'all 0.2s',
                fontFamily: 'Poppins, sans-serif',
              }}
              className="no-press"
            >
              {b.title.length > 36 ? b.title.slice(0, 36) + '…' : b.title}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="blogs-grid">
        {filtered.length === 0 ? (
          <div className="blogs-empty">
            <div className="blogs-empty-icon">
              <Search size={24} color="#ff8ab8" />
            </div>
            <p className="blogs-empty-title">No articles found</p>
            <p className="blogs-empty-sub">Try a different search or clear the filter.</p>
          </div>
        ) : (
          filtered.map((blog, i) => (
            <BlogCard key={blog.id} blog={blog} index={i} coverUrl={blog.coverImage ?? null} />
          ))
        )}
      </div>
    </>
  );
}
