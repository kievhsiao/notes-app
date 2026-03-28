import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("file") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const urls: string[] = [];
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        
        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e: unknown) {
            // recursive: true should handle existing dirs, but catch anyway
            const err = e as NodeJS.ErrnoException;
            if (err.code !== 'EEXIST' && err.code !== 'ENOENT') throw err;
        }

        for (const file of files) {
            // Server-side mime type validation (do not trust client only)
            if (!file.type.startsWith('image/')) {
                console.warn(`Skipping non-image file: ${file.name} (${file.type})`);
                continue;
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const originalName = file.name;
            const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
            // Add random string to avoid collision if files are uploaded at the same timestamp
            const randomId = Math.random().toString(36).substring(2, 7);
            const filename = `${Date.now()}-${randomId}-${sanitizedName}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            urls.push(`/uploads/${filename}`);
        }

        // Return both url (for legacy) and urls (for new multi-upload)
        return NextResponse.json({ 
            url: urls[0], 
            urls: urls 
        }, { status: 201 });
    } catch (error) {
        console.error("API Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
    }
}

