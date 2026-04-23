import { NextResponse } from "next/server";
import { createHash } from "crypto";

const SITE_URL = "https://iamamitkumar.dev";

export async function GET() {
  const skills = [
    {
      name: "Portfolio API",
      type: "api",
      description:
        "Access portfolio projects, blog posts, and professional information",
      url: `${SITE_URL}/api`,
    },
    {
      name: "Blog Content",
      type: "content",
      description:
        "Technical articles about AI agents, agentic architectures, and full-stack development",
      url: `${SITE_URL}/blog`,
    },
    {
      name: "Newsletter Subscription",
      type: "action",
      description: "Subscribe to the Signal Dispatch newsletter",
      url: `${SITE_URL}/newsletter`,
    },
  ];

  const skillsWithDigests = skills.map((skill) => {
    const content = JSON.stringify(skill);
    const sha256 = createHash("sha256").update(content).digest("hex");
    return { ...skill, sha256 };
  });

  const index = {
    $schema: "https://agentskills.io/schemas/agent-skills-index-0.2.0.json",
    name: "Amit Kumar Portfolio Skills",
    description:
      "Available skills for AI agents interacting with iamamitkumar.dev",
    version: "1.0.0",
    skills: skillsWithDigests,
  };

  return NextResponse.json(index, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
