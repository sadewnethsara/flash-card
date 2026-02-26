import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const dirPath = path.join(process.cwd(), 'public', 'flashcards');
  
  try {
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json({ files: [] });
    }

    const fileNames = fs.readdirSync(dirPath).filter(file => file.endsWith('.csv'));
    
    const files = fileNames.map(fileName => {
      const content = fs.readFileSync(path.join(dirPath, fileName), 'utf-8');
      return {
        name: fileName.replace('.csv', ''),
        content
      };
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error reading flashcards directory", error);
    return NextResponse.json({ error: "Failed to load flashcards" }, { status: 500 });
  }
}