import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <small>A LITTLE DETOUR</small>
      <h1 className="my-6">Let’s find your way.</h1>
      <p>
        This page has stepped out for a moment. There’s plenty more to discover.
      </p>
      <Link className="btn btn-dark" href="/">
        Back to Luxe →
      </Link>
    </div>
  );
}
