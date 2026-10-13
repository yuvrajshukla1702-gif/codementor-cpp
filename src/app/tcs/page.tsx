import type { Metadata } from "next";
import { bankBySection } from "@/lib/interview-bank";
import { ShortAnswerCard } from "@/components/ShortAnswerCard";
import { PageFrame, PageHeader, SectionTitle } from "@/components/ui/kit";

export const metadata: Metadata = { title: "TCS NQT" };

export default function TcsPage() {
  const aptitude = bankBySection("tcs-aptitude");
  const coding = bankBySection("tcs-coding");
  return (
    <PageFrame>
      <PageHeader eyebrow="Interview prep" title="TCS" accent="NQT">
        Aptitude patterns and coding discussion prompts typical of NQT and service-company first rounds. Pair this with
        DSA practice three times a week.
      </PageHeader>
      <section>
        <SectionTitle count={aptitude.length}>Aptitude</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          {aptitude.map((q) => (
            <ShortAnswerCard key={q.id} q={q} />
          ))}
        </div>
      </section>
      <section>
        <SectionTitle count={coding.length}>Coding prompts</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          {coding.map((q) => (
            <ShortAnswerCard key={q.id} q={q} />
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
