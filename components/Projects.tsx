const projects = [
  {
    title: "Restaurant website",
    tag: "Concept project",
    text: "A premium restaurant experience designed for reservations, menus, and conversions.",
    accent: "from-slate-800 via-slate-700 to-slate-950",
  },
  {
    title: "Ecommerce platform",
    tag: "Commerce design",
    text: "A fast online storefront built for product discovery, checkout, and growth.",
    accent: "from-sky-700 via-cyan-500 to-slate-950",
  },
  {
    title: "Anulen website",
    tag: "Brand launch",
    text: "The agency website concept built to evolve into full service operations.",
    accent: "from-fuchsia-700 via-rose-500 to-slate-950",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="section bg-[#020613]">
      <div className="container">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="section-title">Recent projects</p>
            <h2 className="section-heading">Built for real business growth.</h2>
          </div>
          <p className="max-w-md text-white/60">Sample projects that show the direction for brand-led websites, ecommerce, and system design.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <article key={project.title} className="card overflow-hidden rounded-[2rem]">
              <div className={`h-56 bg-gradient-to-br ${project.accent}`} />
              <div className="p-7">
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-200">{project.tag}</span>
                <h3 className="mt-5 text-2xl font-semibold text-white">{project.title}</h3>
                <p className="mt-3 leading-8 text-white/65">{project.text}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
                  View project <span aria-hidden="true">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
