import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SessionPlayer } from "@/components/SessionPlayer";
import { buildPlaylist } from "@/content/playlist";
import { getProgram, getSession } from "@/content/programs";
import { requireSubscriber } from "@/lib/auth";
import { terminerSeance } from "@/app/seance/actions";

export const metadata: Metadata = {
  title: "Séance",
  robots: { index: false, follow: false },
};

export default async function SeancePage({
  params,
}: {
  params: Promise<{ slug: string; week: string; day: string }>;
}) {
  await requireSubscriber();

  const { slug, week: weekParam, day: dayParam } = await params;
  const week = Number(weekParam);
  const day = Number(dayParam);

  const program = getProgram(slug);
  const session = getProgram(slug) && getSession(slug, week, day);
  if (!program || !session) notFound();

  return (
    <SessionPlayer
      entries={buildPlaylist(session)}
      sessionTitle={`Semaine ${week} · Séance ${day} — ${session.title}`}
      backHref={`/app/programmes/${program.slug}`}
      onFinish={terminerSeance.bind(null, program.slug, week, day)}
    />
  );
}
