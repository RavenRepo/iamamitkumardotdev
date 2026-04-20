import type { Metadata } from "next";
import Container from "@/components/container";
import { Companies } from "@/components/companies";
import { CopyEmailInline } from "@/components/copy-email-inline";
import { Focus } from "@/components/focus";
import { LinkPreview } from "@/components/link-preview";

import { DottedSeparator } from "@/components/separator";

export const metadata: Metadata = {
  title: "Sponsor — Partner With Me for Founder-Focused Collabs",
  description:
    "Partner with me on founder-focused collaborations, product launches, and distribution experiments.",
  alternates: {
    canonical: "/sponsor",
  },
  openGraph: {
    title: "Sponsor — Partner With Me for Founder-Focused Collabs",
    description:
      "Partner with me on founder-focused collaborations, product launches, and distribution experiments.",
    images: ["/images/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsor — Partner With Me for Founder-Focused Collabs",
    description:
      "Partner with me on founder-focused collaborations, product launches, and distribution experiments.",
    images: ["/images/og-image.png"],
  },
};

export default async function SponsorsPage() {
  return (
    <>
      <Container className="min-h-screen">
        <div className="text-foreground pt-4 text-base">
          I share build-in-public lessons across my{" "}
          <LinkPreview url="https://substack.com/@growthperclick">
            writing channels
          </LinkPreview>{" "}
          and social handles. I only partner with products I believe help
          founders ship faster and grow better.
        </div>
        <div className="text-foreground pt-4 text-base">
          If your product is relevant for indie hackers, operators, and
          technical founders, reach out at{" "}
          <CopyEmailInline>my email</CopyEmailInline>.
        </div>
        <DottedSeparator className="my-8" />
        <Focus />
        <DottedSeparator className="my-8" />
        <Companies />
      </Container>
      <Container>
        <DottedSeparator className="my-8" />
      </Container>
    </>
  );
}
