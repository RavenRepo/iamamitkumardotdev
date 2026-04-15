import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_URL_REGEX = /^https?:\/\/.+/;
const MAX_CONTENT_LENGTH = 500_000;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 50;

export const PostInputSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  slug: z
    .string()
    .regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(MAX_CONTENT_LENGTH, `Content must be under ${MAX_CONTENT_LENGTH.toLocaleString()} characters`),
  excerpt: z
    .string()
    .max(500, "Excerpt must be under 500 characters")
    .optional()
    .default(""),
  coverImage: z
    .string()
    .regex(SAFE_URL_REGEX, "Cover image must be a valid HTTP/HTTPS URL")
    .optional()
    .default(""),
  status: z
    .enum(["draft", "published"])
    .optional()
    .default("draft"),
  tags: z
    .array(z.string().max(MAX_TAG_LENGTH, `Each tag must be under ${MAX_TAG_LENGTH} characters`))
    .max(MAX_TAGS, `Maximum ${MAX_TAGS} tags allowed`)
    .optional()
    .default([]),
  metaTitle: z
    .string()
    .max(70, "Meta title must be under 70 characters")
    .optional()
    .default(""),
  metaDescription: z
    .string()
    .max(160, "Meta description must be under 160 characters")
    .optional()
    .default(""),
});

export type PostInput = z.infer<typeof PostInputSchema>;

export function validatePostInput(body: unknown): { success: boolean; data?: PostInput; errors: string[] } {
  const result = PostInputSchema.safeParse(body);
  
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return { success: false, errors };
  }
  
  return { success: true, data: result.data, errors: [] };
}

export function validateAndSanitizePostInput(body: unknown): { success: boolean; data?: PostInput; errors: string[] } {
  const validation = validatePostInput(body);
  
  if (!validation.success) {
    return validation;
  }
  
  const data = validation.data!;
  
  return {
    success: true,
    data: {
      ...data,
      title: data.title.trim(),
      slug: data.slug.trim(),
      content: data.content.trim(),
      excerpt: data.excerpt?.trim() || "",
      coverImage: data.coverImage?.trim() || "",
      metaTitle: data.metaTitle?.trim() || "",
      metaDescription: data.metaDescription?.trim() || "",
      tags: data.tags?.map((t: string) => t.trim()).filter(Boolean) || [],
    },
    errors: [],
  };
}

export const ContactInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required").max(2000, "Message must be under 2000 characters"),
  subject: z.string().max(200, "Subject must be under 200 characters").optional().default(""),
});

export type ContactInput = z.infer<typeof ContactInputSchema>;

export function validateContactInput(body: unknown): { success: boolean; data?: ContactInput; errors: string[] } {
  const result = ContactInputSchema.safeParse(body);
  
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return { success: false, errors };
  }
  
  return { success: true, data: result.data, errors: [] };
}

export const NewsletterInputSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type NewsletterInput = z.infer<typeof NewsletterInputSchema>;

export function validateNewsletterInput(body: unknown): { success: boolean; data?: NewsletterInput; errors: string[] } {
  const result = NewsletterInputSchema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return { success: false, errors };
  }

  return { success: true, data: result.data, errors: [] };
}
