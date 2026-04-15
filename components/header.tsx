import React from "react";
import { LinkPreview } from "./link-preview";

export const Header = () => {
  return (
    <div>
      <div className="text-foreground pt-4 text-base">
        I'm an indie hacker shipping AI products in public. I go from idea to
        MVP fast, test demand, and iterate weekly. I share the full journey on{" "}
        <LinkPreview url="https://x.com/growthperclick">
          X / Twitter
        </LinkPreview>{" "}
        — wins, mistakes, and what actually worked.
      </div>
      <div className="text-foreground pt-4 text-base">
        I launched{" "}
        <LinkPreview url="https://launchsuite.tech">
          LaunchSuite.tech
        </LinkPreview>{" "}
        as a production SaaS boilerplate and pushed it to Product Hunt. I also
        build high-leverage products in AI automation, trading intelligence,
        and growth systems.
      </div>
      <div className="text-foreground pt-4 text-base">
        I publish founder notes, build logs, and playbooks on{" "}
        <LinkPreview url="https://substack.com/@growthperclick">
          Substack
        </LinkPreview>{" "}
        for builders who want speed plus real execution.
      </div>
    </div>
  );
};
