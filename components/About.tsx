export default function About() {
  return (
    <section id="about" className="section section-tight">
      <div className="container grid gap-10 items-center lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="section-title">Built for teams</p>
          <h2 className="section-heading">Built for teams that demand more.</h2>
          <p className="mt-6 section-copy">
            We build websites and systems that help growing businesses stay fast, trusted, and easy to manage as they scale.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="card rounded-[1.8rem] p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Discovery</p>
              <p className="mt-3 text-white/70">Align on goals, audience, and the right product roadmap.</p>
            </div>
            <div className="card rounded-[1.8rem] p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Execution</p>
              <p className="mt-3 text-white/70">Design and build systems crafted for reliability and growth.</p>
            </div>
          </div>
        </div>

        <div className="about-graphic" />
      </div>
    </section>
  );
}
