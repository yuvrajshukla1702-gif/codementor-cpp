import type { Metadata } from "next";
import { CompilerStudio } from "@/components/compiler/CompilerStudio";

export const metadata: Metadata = {
  title: "Compiler",
  description: "Write and run C, C++, Python, Java, and JavaScript in the browser.",
};

export default function CompilerPage() {
  return <CompilerStudio />;
}
