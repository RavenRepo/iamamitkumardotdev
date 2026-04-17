import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/authorize";
import { serializeTags, mapDbToPost } from "@/lib/blog";
import { validateAndSanitizePostInput } from "@/lib/validation";
import { sanitizeMarkdown } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { authorized, session, response } = await requireAdmin(req);
  if (!authorized) return response;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: post, error } = await supabaseAdmin
    .from("post")
    .select("*")
    .eq("id", id)
    .eq("authorId", session.user.id)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(mapDbToPost(post));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { authorized, session, response } = await requireAdmin(req);
  if (!authorized) return response;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateAndSanitizePostInput(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.errors.join(", ") },
      { status: 400 },
    );
  }

  const {
    title,
    slug,
    content,
    excerpt,
    coverImage,
    status,
    tags,
    metaTitle,
    metaDescription,
  } = validation.data!;

  const sanitizedContent = sanitizeMarkdown(content);

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("post")
    .select("*")
    .eq("id", id)
    .eq("authorId", session.user.id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: "Not found or no permission" },
      { status: 404 },
    );
  }

  const wasPublished = existing.status === "published";
  const isNowPublished = status === "published";
  const publishedAt =
    isNowPublished && !wasPublished
      ? new Date().toISOString()
      : existing.publishedAt;

  try {
    const { data: updatedPost, error } = await supabaseAdmin
      .from("post")
      .update({
        title,
        slug,
        content: sanitizedContent,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        status: status || existing.status,
        tags: tags ? serializeTags(tags) : existing.tags,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        publishedAt: publishedAt,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("authorId", session.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 409 },
        );
      }
      throw error;
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");

    return NextResponse.json(mapDbToPost(updatedPost));
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { authorized, session, response } = await requireAdmin(req);
  if (!authorized) return response;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { error } = await supabaseAdmin
      .from("post")
      .delete()
      .eq("id", id)
      .eq("authorId", session.user.id);

    if (error) {
      return NextResponse.json(
        { error: "Not found or no permission" },
        { status: 404 },
      );
    }

    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
