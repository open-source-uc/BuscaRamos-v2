import Link from "next/link";

import contributors from "@/data/contributors.json";
import acknowledgements from "@/data/acknowledgments.json";

import { GitHubIcon, LinkedInIcon } from "@/components/icons";

export default function ContributorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="border-border mb-8 overflow-hidden rounded-md border">
        <div className="border-border border-b px-6 py-6">
          <h2 className="text-foreground text-3xl font-bold">Contribuidores de BuscaRamos</h2>
          <p className="text-md text-muted-foreground mt-1">
            BuscaRamos no sería posible sin la dedicación y el esfuerzo de los muchos estudiantes
            que han colaborado a lo largo de los años. A continuación, se muestra una lista de
            quienes han aportado al proyecto.
          </p>
        </div>
        <div className="p-6">
          <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-6">
            {contributors.map((contributor) => (
              <div
                key={contributor.github}
                className="border-border bg-background rounded-md border p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1 justify-between">
                    <section>
                      <h3 className="text-foreground text-xl font-semibold text-wrap">
                        {contributor.name}
                      </h3>
                      <p className="text-muted-foreground mb-3 max-w-[85%] text-xs">
                        {contributor.career}
                      </p>
                    </section>
                    <div className="flex gap-3">
                      {contributor.linkedin && (
                        <Link
                          href={`https://www.linkedin.com/in/${contributor.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-muted-foreground transition-colors"
                          aria-label={`GitHub de ${contributor.name}`}
                        >
                          <LinkedInIcon className="w-4 h-4 text-blue-500" />
                        </Link>
                      )}

                      {contributor.github && (
                        <Link
                          href={`https://github.com/${contributor.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-muted-foreground transition-colors"
                          aria-label={`GitHub de ${contributor.name}`}
                        >
                          <GitHubIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-border overflow-hidden rounded-md border">
        <div className="border-border border-b px-6 py-6">
          <h2 className="text-foreground text-2xl font-semibold">Agradecimientos</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Reconocemos y agradecemos a todas las personas que, gracias a sus esfuerzos históricos,
            han hecho posible este proyecto.
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {acknowledgements.map((person) =>
              person.linkedin ? (
                <Link
                  key={person.name}
                  href={`https://www.linkedin.com/in/${person.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background text-muted-foreground border-border hover:bg-primary-foreground/80 hover:text-primary/80 inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4 text-blue-500" />
                  {person.name}
                </Link>
              ) : (
                <div
                  key={person.name}
                  className="bg-background text-muted-foreground border-border inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium whitespace-nowrap"
                >
                  {person.name}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
