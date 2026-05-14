export function ArtistDirectoryGrid({ artists }) {
  if (!artists.length) {
    return (
      <div className="bg-card border border-edge rounded p-8 text-center text-ink-dim">
        Belum ada data artis untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {artists.map((artist) => (
        <article
          key={artist.id}
          className="bg-card border border-edge rounded p-5 text-center transition-all hover:border-edge-glow hover:-translate-y-0.5"
        >
          <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-brand-gradient border-[3px] border-bg shadow-glow" />
          <h3 className="font-display font-semibold text-lg">{artist.name}</h3>
          <p className="text-xs text-ink-mute uppercase tracking-wide mt-0.5">
            {artist.genre || "-"}
          </p>
        </article>
      ))}
    </div>
  );
}
