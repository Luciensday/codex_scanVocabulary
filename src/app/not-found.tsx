export default function NotFound() {
  return (
    <main className="page-shell page-shell--narrow">
      <section className="empty-state">
        <p className="eyebrow">Missing pack</p>
        <h1>This share link is gone.</h1>
        <p>
          The shared board may have expired locally, or the link was copied
          incorrectly.
        </p>
      </section>
    </main>
  );
}
