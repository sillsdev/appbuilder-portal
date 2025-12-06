import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { RequestEvent } from './$types';

export async function GET({ params, locals }: RequestEvent) {
  locals.security.requireNothing();

  const { filename } = params;

  // Decode the filename and handle both + and %20 as spaces
  const decodedFilename = decodeURIComponent(filename.replace(/\+/g, ' '));

  // Security: prevent directory traversal
  if (decodedFilename.includes('..') || decodedFilename.includes('/')) {
    throw error(400, 'Invalid filename');
  }

  // Only allow PDF files
  if (!decodedFilename.endsWith('.pdf')) {
    throw error(400, 'Only PDF files are allowed');
  }

  try {
    const pdfPath = join(process.cwd(), 'client', 'docs', decodedFilename);
    const pdfBuffer = await readFile(pdfPath);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${decodedFilename}"`
      }
    });
  } catch (err) {
    console.error('Error reading PDF:', err);
    throw error(404, 'PDF not found');
  }
}
