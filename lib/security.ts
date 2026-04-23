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

const FORBIDDEN_TAGS = [
  "script", "style", "iframe", "object", "embed", "form", "input",
];

const FORBIDDEN_ATTR = [
  "onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur",
  "onmouseout", "onmouseenter", "onmouseleave", "onkeydown", "onkeyup",
];

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
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: FORBIDDEN_ATTR,
    WHOLE_DOCUMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });
}

export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return "";

  return DOMPurify.sanitize(markdown, {
    ALLOWED_TAGS: DEFAULT_ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(DEFAULT_ALLOWED_ATTRIBUTES).flat(),
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: FORBIDDEN_ATTR,
    WHOLE_DOCUMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });
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