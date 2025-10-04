import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update a Twitter list
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const list = await prisma.twitterList.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ list });
  } catch (error) {
    console.error('Error updating Twitter list:', error);
    return NextResponse.json(
      { error: 'Failed to update Twitter list' },
      { status: 500 }
    );
  }
}

// Delete a Twitter list
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.twitterList.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Twitter list:', error);
    return NextResponse.json(
      { error: 'Failed to delete Twitter list' },
      { status: 500 }
    );
  }
}
