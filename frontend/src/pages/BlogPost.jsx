import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/format";
import PageHelmet from "@/components/PageHelmet";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    setPost(null);
    api.get(`/blog/${slug}`).then(({ data }) => setPost(data.post));
  }, [slug]);

  if (!post) return <div className="mx-auto max-w-3xl px-6 py-20 text-sm text-zinc-400">Loading…</div>;

  return (
    <>
      <PageHelmet title={post.title} description={post.excerpt} />
      <div className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4 text-xs text-zinc-500 sm:px-6 lg:px-8">
          <Link to="/" className="hover:text-zinc-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/blog" className="hover:text-zinc-900">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 text-zinc-900">{post.title}</span>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-600">{post.category}</p>
        <h1 className="font-display mt-3 text-4xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-5 flex items-center gap-4 text-xs text-zinc-500">
          <span>{post.author}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>{shortDate(post.published_at)}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>{post.read_minutes} min read</span>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl bg-zinc-100">
          <img src={post.cover} alt="" className="h-auto w-full" />
        </div>

        <div className="prose prose-zinc mt-10 max-w-none whitespace-pre-line text-[16px] leading-[1.75] text-zinc-700">
          {post.content}
        </div>

        <hr className="my-12 border-zinc-100" />
        <Link to="/blog" className="text-sm text-blue-600 hover:text-blue-700">← All posts</Link>
      </article>
    </>
  );
}
