import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalName = file.name;
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}-${sanitizedName}`;
        
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const url = `/uploads/${filename}`;

        return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
        console.error("API Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
