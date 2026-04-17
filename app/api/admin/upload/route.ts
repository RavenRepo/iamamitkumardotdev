import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { requireAdmin } from "@/lib/auth/authorize";
import { fileTypeFromBuffer } from "file-type";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function ensureUploadsDir() {
  const uploadsDir = join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { allowed } = rateLimit(request);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type header. Only JPEG, PNG, GIF, WebP are allowed.",
        },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType || !allowedTypes.includes(fileType.mime)) {
      return NextResponse.json(
        { error: "Invalid file content. Magic bytes verification failed." },
        { status: 400 },
      );
    }

    // Sanitize filename to prevent path traversal
    const safeBaseName = file.name.replace(/[^a-zA-Z0-9_-]/g, "");
    const ext = fileType.ext;
    const uniqueName = `${Date.now()}-${safeBaseName.substring(0, 20)}.${ext}`;
    const uploadsDir = await ensureUploadsDir();
    const filePath = join(uploadsDir, uniqueName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url,
      filename: uniqueName,
      size: file.size,
    });
  } catch (error) {
    // Redact internal error specifics from public outputs
    console.error("Upload Error: Failed to process file securely.");
    return NextResponse.json(
      {
        error:
          "Failed to upload file due to an internal security or processing error.",
      },
      { status: 500 },
    );
  }
}
