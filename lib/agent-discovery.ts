const DEFAULT_SITE_URL = "https://iamamitkumar.dev";

export const OAUTH_SCOPES = {
  openid: "Authenticate the user with OpenID Connect.",
  email: "Read the authenticated user's email address.",
  profile: "Read the authenticated user's basic profile.",
  offline_access:
    "Request refresh tokens when supported by the authorization server.",
} as const;

function firstNonEmpty(
  ...values: Array<string | undefined>
): string | undefined {
  return values.find((value) => value && value.trim().length > 0)?.trim();
}

function normalizeOrigin(value: string | undefined, fallback?: string): string {
  const candidate = firstNonEmpty(value, fallback, DEFAULT_SITE_URL)!;

  try {
    return new URL(candidate).origin;
  } catch {
    return new URL(DEFAULT_SITE_URL).origin;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getSiteOrigin(): string {
  return normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL, DEFAULT_SITE_URL);
}

export function getSupabaseProjectOrigin(): string | null {
  const projectUrl = firstNonEmpty(
    process.env.PROJECT_URL,
    process.env.NEXT_PUBLIC_PROJECT_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );

  if (!projectUrl) return null;

  try {
    return new URL(projectUrl).origin;
  } catch {
    return null;
  }
}

export function getAuthServerMetadata() {
  const supabaseOrigin = getSupabaseProjectOrigin();
  if (!supabaseOrigin) return null;

  const authBaseUrl = `${trimTrailingSlash(supabaseOrigin)}/auth/v1`;

  return {
    issuer: authBaseUrl,
    authorization_endpoint: `${authBaseUrl}/oauth/authorize`,
    token_endpoint: `${authBaseUrl}/oauth/token`,
    jwks_uri: `${authBaseUrl}/.well-known/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "none",
    ],
    scopes_supported: Object.keys(OAUTH_SCOPES),
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256", "ES256"],
  };
}

export function getProtectedResourceMetadata() {
  const siteOrigin = getSiteOrigin();
  const authServer = getAuthServerMetadata();

  return {
    resource: siteOrigin,
    authorization_servers: authServer ? [authServer.issuer] : [],
    scopes_supported: Object.keys(OAUTH_SCOPES),
    bearer_methods_supported: ["header"],
    resource_documentation: `${siteOrigin}/.well-known/api-catalog`,
  };
}

export function getOAuthProtectedResourceMetadataUrl(): string {
  return `${getSiteOrigin()}/.well-known/oauth-protected-resource`;
}

export function getUnauthorizedResourceMetadataHeader(): string {
  return `Bearer resource_metadata="${getOAuthProtectedResourceMetadataUrl()}"`;
}

export function getA2AAgentCard() {
  const siteOrigin = getSiteOrigin();
  const openIdConnectUrl = `${siteOrigin}/.well-known/openid-configuration`;

  return {
    name: "Amit Kumar Portfolio Agent",
    version: "1.0.0",
    description:
      "Discover Amit Kumar's portfolio, blog posts, newsletter, and public site metadata for agent-assisted browsing.",
    url: `${siteOrigin}/api/a2a`,
    supportedInterfaces: [
      {
        url: `${siteOrigin}/api/a2a`,
        protocolBinding: "HTTP+JSON",
        protocolVersion: "0.3",
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    security: [
      {},
      {
        openIdConnect: [],
      },
    ],
    securitySchemes: {
      openIdConnect: {
        type: "openIdConnect",
        description:
          "Optional Supabase-backed OpenID Connect authentication for protected admin APIs.",
        openIdConnectUrl,
      },
    },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["text/plain", "application/json", "text/markdown"],
    skills: [
      {
        id: "portfolio-discovery",
        name: "Portfolio Discovery",
        description:
          "Find public information about Amit Kumar's work, projects, and professional profile.",
        tags: ["portfolio", "profile", "projects"],
        examples: ["Summarize Amit Kumar's current work and contact links."],
        inputModes: ["text/plain", "application/json"],
        outputModes: ["text/plain", "text/markdown", "application/json"],
      },
      {
        id: "blog-research",
        name: "Blog Research",
        description:
          "Discover and retrieve public blog posts about AI agents, product building, and growth experiments.",
        tags: ["blog", "writing", "research"],
        examples: ["Find recent writing about AI agents."],
        inputModes: ["text/plain", "application/json"],
        outputModes: ["text/plain", "text/markdown", "application/json"],
      },
      {
        id: "newsletter-subscription",
        name: "Newsletter Subscription",
        description:
          "Help users locate the newsletter subscription flow for Signal Dispatch.",
        tags: ["newsletter", "subscription"],
        examples: ["Where can a user subscribe to the newsletter?"],
        inputModes: ["text/plain", "application/json"],
        outputModes: ["text/plain", "application/json"],
      },
    ],
  };
}

export function discoveryHeaders(contentType = "application/json") {
  return {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600",
    "Access-Control-Allow-Origin": "*",
  };
}
