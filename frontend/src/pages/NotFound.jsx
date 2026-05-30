import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">404</p>
      <h1 className="font-display mt-2 text-5xl tracking-tight text-zinc-900">Page not found</h1>
      <p className="mt-3 text-sm text-zinc-600">The page you are looking for does not exist or has moved.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Back to home
      </Link>
    </section>
  );
}
