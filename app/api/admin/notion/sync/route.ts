import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/authorize";
import { serializeTags } from "@/lib/blog";
import { env } from "@/lib/env";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

export async function POST(req: NextRequest) {
  const { authorized, session, response } = await requireAdmin(req);
  if (!authorized) return response;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!env.NOTION_INTEGRATION_SECRET || !env.NOTION_CONTENT_CALENDAR_DB_ID) {
      return NextResponse.json(
        { error: "Notion integration is not configured in environment variables." },
        { status: 500 }
      );
    }

    const notion = new Client({ auth: env.NOTION_INTEGRATION_SECRET });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    const dbResponse = await notion.databases.query({
      database_id: env.NOTION_CONTENT_CALENDAR_DB_ID,
      filter: {
        property: "Status",
        select: {
          equals: "published",
        },
      },
    });

    const results = dbResponse.results as any[];

    let syncedCount = 0;
    const errors: string[] = [];

    for (const page of results) {
      try {
        const props = page.properties;

        const title = props.Title?.title?.[0]?.plain_text;
        const slug = props.Slug?.rich_text?.[0]?.plain_text;

        if (!title || !slug) continue;

        const excerpt = props.Excerpt?.rich_text?.[0]?.plain_text || null;
        const status = "published";
        const tags = props.Tags?.multi_select?.map((t: any) => t.name) || [];
        const metaTitle = props["Meta Title"]?.rich_text?.[0]?.plain_text || null;
        const metaDescription = props["Meta Description"]?.rich_text?.[0]?.plain_text || null;
        const publishedAtStr = props["Published At"]?.date?.start;

        let coverImage: string | null = null;
        const coverFile = props["Cover Image URL"]?.files?.[0];
        if (coverFile) {
          coverImage = coverFile.type === "external"
            ? coverFile.external.url
            : coverFile.file.url;
        } else if (page.cover) {
          coverImage = page.cover.type === "external"
            ? page.cover.external.url
            : page.cover.file.url;
        }

        const publishedAt = publishedAtStr || new Date().toISOString();

        const mdBlocks = await n2m.pageToMarkdown(page.id);
        const content = n2m.toMarkdownString(mdBlocks).parent;

        const postData = {
          title,
          slug,
          content,
          excerpt,
          coverImage,
          status,
          tags: tags.length > 0 ? serializeTags(tags) : null,
          metaTitle,
          metaDescription,
          publishedAt,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { error } = await supabaseAdmin
          .from("post")
          .upsert(postData, { onConflict: "slug" });

        if (error) {
          console.error(`Failed to sync post ${slug}:`, error);
          errors.push(`Failed to sync ${slug}: ${error.message}`);
        } else {
          syncedCount++;
        }
      } catch (err: any) {
        console.error(`Error processing Notion page ${page.id}:`, err);
        errors.push(`Error processing page ${page.id}: ${err.message}`);
      }
    }

    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");

    return NextResponse.json({
      success: true,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Notion sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Notion", details: error.message },
      { status: 500 },
    );
  }
}