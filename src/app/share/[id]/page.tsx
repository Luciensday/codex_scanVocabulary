import Link from "next/link";
import { notFound } from "next/navigation";

import { ShareGallery } from "@/components/share-gallery";
import { readSharePack } from "@/lib/share-store";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pack = await readSharePack(id);

  if (!pack) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Shared board</p>
          <h1>{pack.title}</h1>
          <p className="hero-text">
            A saved selection from Who Let Me Out. This MVP stores share packs as
            local server data, so links are lightweight and easy to inspect.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-tile">
            <span>Cards</span>
            <strong>{pack.items.length}</strong>
          </div>
          <div className="stat-tile">
            <span>Created</span>
            <strong>{new Date(pack.createdAt).toLocaleDateString()}</strong>
          </div>
          <div className="stat-tile">
            <span>Source</span>
            <strong>OpenRouter</strong>
          </div>
          <div className="stat-tile">
            <span>App</span>
            <strong>Who Let Me Out</strong>
          </div>
        </div>
      </section>

      <section className="board-column board-column--standalone">
        <div className="board-header">
          <div>
            <p className="panel__eyebrow">Saved selection</p>
            <h2>Shared animal gallery</h2>
          </div>
          <Link className="secondary-button secondary-button--link" href="/">
            Open the generator
          </Link>
        </div>

        <ShareGallery items={pack.items} />
      </section>
    </main>
  );
}
