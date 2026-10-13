import type { Metadata } from "next";
import { bankBySection } from "@/lib/interview-bank";
import { ShortAnswerCard } from "@/components/ShortAnswerCard";
import { PageFrame, PageHeader } from "@/components/ui/kit";

export const metadata: Metadata = { title: "HR round" };

export default function HrPage() {
  const qs = bankBySection("hr");
  return (
    <PageFrame>
      <PageHeader eyebrow="Interview prep" title="HR" accent="desk">
        Behavioural answers using STAR. Practise until your stories sound natural, not memorised.
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        {qs.map((q) => (
          <ShortAnswerCard key={q.id} q={q} />
        ))}
      </div>
    </PageFrame>
  );
}
