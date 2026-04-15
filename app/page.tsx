import type { Metadata } from "next";
import Container from "@/components/container";
import { Header } from "@/components/header";
import { Work } from "@/components/work";
import { DottedSeparator } from "@/components/separator";
import { Companies } from "@/components/companies";
import { getPublishedPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog/blog-list";
import { WorkWithMe } from "@/components/work-with-me";

export const metadata: Metadata = {
  title: "Amit Kumar",
  description:
    "Indie hacker building AI products in public — from LaunchSuite.tech to multi-agent systems, growth experiments, and fast MVP launches.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const posts = await getPublishedPosts(3);

  return (
    <Container>
      <Header />
      <DottedSeparator className="my-10" />
      <Work />
      <DottedSeparator className="my-10" />
      <Companies />
      <DottedSeparator className="my-10" />
      <WorkWithMe />
      <DottedSeparator className="my-10" />
      <BlogList posts={posts} />
      <DottedSeparator className="my-10" />
    </Container>
  );
}
