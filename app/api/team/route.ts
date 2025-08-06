import { NextResponse } from 'next/server';
import { getTeamData, saveTeamData } from '@/lib/server-storage';

export async function GET() {
  try {
    const data = await getTeamData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load team data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await saveTeamData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save team data' },
      { status: 500 }
    );
  }
}