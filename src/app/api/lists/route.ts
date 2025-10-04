import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all Twitter lists
export async function GET() {
  try {
    const lists = await prisma.twitterList.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Error fetching Twitter lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter lists' },
      { status: 500 }
    );
  }
}

// Add a new Twitter list
export async function POST(request: Request) {
  try {
    const { name, listUrl, description } = await request.json();

    if (!name || !listUrl) {
      return NextResponse.json(
        { error: 'name and listUrl are required' },
        { status: 400 }
      );
    }

    // Extract list ID from URL
    const match = listUrl.match(/\/lists\/(\d+)/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid Twitter list URL' },
        { status: 400 }
      );
    }
    const listId = match[1];

    // Check if list already exists
    const existing = await prisma.twitterList.findFirst({
      where: {
        OR: [{ listUrl }, { listId }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This Twitter list is already added' },
        { status: 409 }
      );
    }

    const list = await prisma.twitterList.create({
      data: {
        name,
        listUrl,
        listId,
        description,
      },
    });

    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    console.error('Error creating Twitter list:', error);
    return NextResponse.json(
      { error: 'Failed to create Twitter list' },
      { status: 500 }
    );
  }
}
