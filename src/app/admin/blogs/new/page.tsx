import BlogEditor from '../BlogEditor';

export default function NewBlogPage() {
    return (
        <div style={{ padding: '0 10px' }}>
            <BlogEditor isEdit={false} />
        </div>
    );
}
