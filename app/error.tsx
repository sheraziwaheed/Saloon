"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>A little pause.</h1>
      <p className="mt-6">We couldn’t load this page. Please try once more.</p>
      <button className="btn btn-dark" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
