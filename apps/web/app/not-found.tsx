import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '64px var(--gutter)' }}>
      <h1 className="page-title">Page not found</h1>
      <p className="muted" style={{ marginTop: 12 }}>
        <Link href="/" className="link">
          Back to the overview
        </Link>
      </p>
    </main>
  );
}
