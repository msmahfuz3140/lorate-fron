import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const toolDir = path.join(process.cwd(), 'public', 'roulette-tool');

    if (!fs.existsSync(toolDir)) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="background:#05090f;color:#ff4d5e;font-family:sans-serif;padding:2rem;"><h2>Tool directory not found</h2><p>Expected folder at <code>public/roulette-tool</code></p></body></html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // List all files in the roulette-tool directory
    const allFiles = fs.readdirSync(toolDir);
    const htmlFiles = allFiles
      .filter((file) => file.toLowerCase().endsWith('.html'))
      .map((file) => {
        const fullPath = path.join(toolDir, file);
        const stats = fs.statSync(fullPath);
        return {
          name: file,
          fullPath,
          mtime: stats.mtimeMs,
          isIndex: file.toLowerCase() === 'index.html',
        };
      })
      .sort((a, b) => {
        return b.mtime - a.mtime;
      });

    if (htmlFiles.length === 0) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="background:#05090f;color:#ff4d5e;font-family:sans-serif;padding:2rem;"><h2>No Tool HTML file found</h2><p>Please place your <code>index.html</code> (or any <code>.html</code> tool file) in <code>public/roulette-tool/</code>.</p></body></html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // Prioritize index.html if it exists and is newest, or pick the most recently modified HTML file
    let selectedFile = htmlFiles[0];
    const indexFile = htmlFiles.find((f) => f.isIndex);

    if (indexFile && indexFile.mtime >= selectedFile.mtime) {
      selectedFile = indexFile;
    }

    const htmlContent = fs.readFileSync(selectedFile.fullPath, 'utf-8');

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Served-Tool-File': selectedFile.name,
      },
    });
  } catch (error: any) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="background:#05090f;color:#ff4d5e;font-family:sans-serif;padding:2rem;"><h2>Failed to load roulette tool</h2><p>${error?.message || 'Unknown error'}</p></body></html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}
