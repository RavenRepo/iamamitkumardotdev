import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorize";
import { serializeTags, mapDbToPost } from "@/lib/blog";
import { validateAndSanitizePostInput } from "@/lib/validation";
import { sanitizeMarkdown } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    const rateLimitResult = rateLimit(req, { windowMs: 60000, maxRequests: 20 });
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { 
                status: 429,
                headers: {
                    "Retry-After": "60",
                    "X-RateLimit-Limit": "20",
                    "X-RateLimit-Remaining": "0",
                }
            }
        );
    }

    const { authorized, session, response } = await requireAdmin();
    if (!authorized) return response;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validation = validateAndSanitizePostInput(body);
    if (!validation.success) {
        return NextResponse.json({ error: validation.errors.join(", ") }, { status: 400 });
    }

    const { title, slug, content, excerpt, coverImage, status, tags, metaTitle, metaDescription } = validation.data!;
    
    const sanitizedContent = sanitizeMarkdown(content);

    const isPublished = status === 'published';

    try {
        const { data: newPost, error } = await supabaseAdmin
            .from('post')
            .insert({
                id: crypto.randomUUID(),
                title,
                slug,
                content: sanitizedContent,
                excerpt: excerpt || null,
                coverImage: coverImage || null,
                status: status || 'draft',
                tags: tags ? serializeTags(tags) : null,
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                authorId: session.user.id,
                publishedAt: isPublished ? new Date().toISOString() : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
            }
            throw error;
        }

        revalidatePath("/blog");
        if (isPublished) {
            revalidatePath("/sitemap.xml");
            revalidatePath("/feed.xml");
        }

        return NextResponse.json(mapDbToPost(newPost));
    } catch (error: unknown) {
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const rateLimitResult = rateLimit(req, { windowMs: 60000, maxRequests: 60 });
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { 
                status: 429,
                headers: {
                    "Retry-After": "60",
                    "X-RateLimit-Limit": "60",
                    "X-RateLimit-Remaining": "0",
                }
            }
        );
    }

    const { authorized, session, response } = await requireAdmin();
    if (!authorized) return response;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const offset = (page - 1) * limit;

    const { count, error: countError } = await supabaseAdmin
        .from('post')
        .select('*', { count: 'exact', head: true })
        .eq('authorId', session.user.id);

    if (countError) throw countError;

    const { data: allPosts, error } = await supabaseAdmin
        .from('post')
        .select('*')
        .eq('authorId', session.user.id)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    const total = count ?? 0;

    return NextResponse.json({
        posts: allPosts.map(mapDbToPost),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: offset + limit < total,
            hasPrev: page > 1,
        }
    });
}
