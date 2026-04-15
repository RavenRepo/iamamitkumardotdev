import DOMPurify from "isomorphic-dompurify";

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

const DEFAULT_ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "strong", "em", "u", "s", "del",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span",
];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  "a": ["href", "title", "target", "rel"],
  "img": ["src", "alt", "title", "width", "height", "loading"],
  "td": ["colspan", "rowspan"],
  "th": ["colspan", "rowspan", "scope"],
  "*": ["class", "id", "style"],
};

export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
  } = options;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.values(allowedAttributes).flat(),
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target", "rel"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
    ADD_TAGS: ["input"],
    WHOLE_DOCUMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });
}

export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return "";
  
  let sanitized = markdown;

  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");
  
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(["'])[^"']*\1/gi, "");
  
  sanitized = sanitized.replace(/javascript:/gi, "");
  sanitized = sanitized.replace(/data:/gi, "");
  
  return sanitized;
}

const URL_SCHEMES = ["http", "https", "mailto", "tel"];

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return URL_SCHEMES.includes(parsed.protocol.replace(":", "")) || 
           parsed.protocol === "mailto:" ||
           parsed.protocol === "tel:";
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  if (!url) return "";
  
  if (!url.startsWith("http://") && 
      !url.startsWith("https://") && 
      !url.startsWith("mailto:") && 
      !url.startsWith("tel:") &&
      !url.startsWith("/")) {
    return "";
  }
  
  if (url.startsWith("javascript:") || url.startsWith("data:")) {
    return "";
  }
  
  return url;
}