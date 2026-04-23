"use client";

import { useEffect } from "react";

type JsonSchema = Record<string, unknown>;

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
  annotations?: {
    readOnlyHint?: boolean;
  };
};

type ModelContext = {
  registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void;
  provideContext?: (
    context: { tools: WebMcpTool[] },
    options?: { signal?: AbortSignal },
  ) => void;
};

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}

function pageSummary() {
  const headings = Array.from(
    document.querySelectorAll<HTMLHeadingElement>("h1, h2, h3"),
  )
    .map((heading) => ({
      level: heading.tagName.toLowerCase(),
      text: heading.innerText.trim(),
    }))
    .filter((heading) => heading.text.length > 0)
    .slice(0, 20);

  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a[href]"),
  )
    .map((link) => ({
      text:
        link.innerText.trim() ||
        link.getAttribute("aria-label") ||
        "Untitled link",
      href: new URL(link.getAttribute("href") || "", window.location.href).href,
    }))
    .filter((link, index, links) => {
      if (!link.href.startsWith(window.location.origin)) return false;
      return (
        links.findIndex((candidate) => candidate.href === link.href) === index
      );
    })
    .slice(0, 30);

  return {
    title: document.title,
    url: window.location.href,
    description:
      document
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.content.trim() || "",
    headings,
    links,
  };
}

function searchPageLinks(query: string) {
  const normalizedQuery = query.toLowerCase().trim();

  return pageSummary().links.filter((link) => {
    const haystack = `${link.text} ${link.href}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

function buildTools(): WebMcpTool[] {
  return [
    {
      name: "portfolio.get_page_summary",
      title: "Get page summary",
      description:
        "Return the current page title, description, headings, and internal links for agent navigation.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async () => pageSummary(),
    },
    {
      name: "portfolio.search_links",
      title: "Search portfolio links",
      description:
        "Search visible internal links on the current portfolio page by keyword.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Keyword or phrase to search for in visible internal links.",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const query = typeof input.query === "string" ? input.query : "";
        return { query, results: searchPageLinks(query) };
      },
    },
    {
      name: "portfolio.fetch_markdown",
      title: "Fetch markdown page",
      description:
        "Fetch a same-origin portfolio page using Accept: text/markdown and return its markdown body plus token header.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Same-origin path to fetch, for example / or /blog.",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const path = typeof input.path === "string" ? input.path : "/";
        const url = new URL(path, window.location.origin);

        if (url.origin !== window.location.origin) {
          throw new Error("Only same-origin portfolio pages can be fetched.");
        }

        const response = await fetch(url.href, {
          headers: { Accept: "text/markdown" },
        });

        return {
          url: url.href,
          ok: response.ok,
          status: response.status,
          contentType: response.headers.get("content-type"),
          markdownTokens: response.headers.get("x-markdown-tokens"),
          body: await response.text(),
        };
      },
    },
    {
      name: "portfolio.navigate",
      title: "Navigate portfolio",
      description: "Navigate the browser to a same-origin portfolio path.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Same-origin path to open, for example /blog or /newsletter.",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const path = typeof input.path === "string" ? input.path : "/";
        const url = new URL(path, window.location.origin);

        if (url.origin !== window.location.origin) {
          throw new Error("Only same-origin portfolio paths can be opened.");
        }

        window.location.assign(url.href);
        return { navigatingTo: url.href };
      },
    },
  ];
}

export function WebMcpProvider() {
  useEffect(() => {
    const modelContext = navigator.modelContext;
    if (!modelContext) return;

    const controller = new AbortController();
    const tools = buildTools();

    try {
      if (typeof modelContext.registerTool === "function") {
        for (const tool of tools) {
          modelContext.registerTool(tool, { signal: controller.signal });
        }
      } else if (typeof modelContext.provideContext === "function") {
        modelContext.provideContext({ tools }, { signal: controller.signal });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("WebMCP tool registration failed", error);
      }
    }

    return () => controller.abort();
  }, []);

  return null;
}
