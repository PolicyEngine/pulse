import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SURVEY_FILE = path.join(process.cwd(), 'data', 'surveys.json');

interface SurveyData {
  responses: any[];
}

async function getSurveyData(): Promise<SurveyData> {
  try {
    const data = await fs.readFile(SURVEY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default data if file doesn't exist
    return { responses: [] };
  }
}

async function saveSurveyData(data: SurveyData): Promise<void> {
  const dir = path.dirname(SURVEY_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(SURVEY_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await getSurveyData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load survey data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const surveyResponse = await request.json();
    const data = await getSurveyData();
    
    // Add timestamp
    surveyResponse.timestamp = new Date().toISOString();
    
    // Add to responses
    data.responses.push(surveyResponse);
    
    await saveSurveyData(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save survey data' },
      { status: 500 }
    );
  }
}