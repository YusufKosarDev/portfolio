import type { Metadata } from "next";
import { getAllPostsMeta } from "@/lib/blog";
import { BlogIndex } from "@/components/blog/BlogIndex";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Geliştirme notları, öğrendiklerim ve proje hikâyeleri. | Development notes, learnings, and project stories.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPostsMeta();
  return <BlogIndex posts={posts} />;
}
