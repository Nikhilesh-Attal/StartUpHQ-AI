// src/app/api/validation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  createValidationEntry,
  // getValidationEntries,
  deleteValidationEntry
} from '@/lib/db';
import { account } from '@/lib/appwrite';

export async function GET() {
  try {
    const session = await account.get();
    // TODO: Replace with the correct function to fetch validation entries for the user
    // const entries = await getValidationEntries(session.$id);
    const entries = []; // Placeholder: update with actual implementation
    return NextResponse.json(entries);
  } catch (err) {
    console.error('GET /api/validation error:', err);
    return NextResponse.json({ error: 'Failed to fetch validation entries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await account.get();

    const result = await createValidationEntry({
      userId: session.$id,
      type: body.type,
      title: body.title,
      content: body.content,
      status: body.status || "Pending",
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('POST /api/validation error:', err);
    return NextResponse.json({ error: 'Failed to create validation entry' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await deleteValidationEntry(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/validation error:', err);
    return NextResponse.json({ error: 'Failed to delete validation entry' }, { status: 500 });
  }
}
