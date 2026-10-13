import type { Metadata } from "next";
import { bankBySection } from "@/lib/interview-bank";
import { ShortAnswerCard } from "@/components/ShortAnswerCard";
import { PageFrame, PageHeader, SectionTitle } from "@/components/ui/kit";

export const metadata: Metadata = { title: "Core CS" };

const sections = [
  { id: "oops" as const, title: "OOPs (C++)" },
  { id: "dbms" as const, title: "DBMS" },
  { id: "os" as const, title: "Operating Systems" },
  { id: "cn" as const, title: "Computer Networks" },
];

export default function CorePage() {
  return (
    <PageFrame>
      <PageHeader eyebrow="Interview prep" title="Core" accent="CS">
        Interviews are not only DSA. Write short answers; the tutor grades them and strengthens your outline.
      </PageHeader>
      {sections.map((s) => {
        const qs = bankBySection(s.id);
        return (
          <section key={s.id}>
            <SectionTitle count={qs.length}>{s.title}</SectionTitle>
            <div className="grid gap-4 lg:grid-cols-2">
              {qs.map((q) => (
                <ShortAnswerCard key={q.id} q={q} />
              ))}
            </div>
          </section>
        );
      })}
    </PageFrame>
  );
}
