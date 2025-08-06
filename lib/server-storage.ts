import fs from 'fs/promises';
import path from 'path';
import { TeamData } from './storage';

const DATA_FILE = path.join(process.cwd(), 'data', 'team.json');

export async function getTeamData(): Promise<TeamData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default data if file doesn't exist
    return {
      team: [],
      meetings: []
    };
  }
}

export async function saveTeamData(data: TeamData): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}