export function parseTime(timeStr: string): { start: Date; end: Date } {
  const [startStr, endStr] = timeStr.split(/[-~]/);
  const today = new Date();

  const start = new Date(today);
  const [startHour, startMin] = startStr.split(':').map(Number);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(today);
  const [endHour, endMin] = endStr.split(':').map(Number);
  end.setHours(endHour, endMin, 0, 0);

  return { start, end };
}

export function isHappeningNow(timeStr: string, sessionDay: string): boolean {
  const now = new Date();
  const currentDay = now.toISOString().split('T')[0];

  // Map session days to actual dates
  const dayMap: Record<string, string> = {
    'Day1': '2026-04-27',
    'Day2': '2026-04-28',
    'Day3': '2026-04-29'
  };

  if (currentDay !== dayMap[sessionDay]) {
    return false;
  }

  const { start, end } = parseTime(timeStr);
  return now >= start && now <= end;
}

export function getTimeSlots(): string[] {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let min of [0, 30]) {
      if (hour === 18 && min === 30) break; // Stop at 18:00
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }
  }
  return slots;
}

export function getStageFloor(stage: string): string {
  const floorMap: Record<string, string> = {
    'Impact Stage': '1F',
    'Green Stage': '1F',
    'Sun Pillar Stage': '1F',
    'Wind Stage': '1F',
    'Meteor Stage': '1F',
    'Japan Stage': '1F',
    'Open Innovation Stage': '1F',
    'Atrium Stage': '1F',
    'Innovation Stage': '4F',
    'Tokyo Stage': '4F',
    'Investor Stage': '4F',
    'ITAMAE Stage': '4F',
    'SusHi Tech Global Stage': '4F'
  };

  return floorMap[stage] || '';
}

export function isUpNext(timeStr: string, sessionDay: string, windowMins = 45): boolean {
  const now = new Date();
  const currentDay = now.toISOString().split('T')[0];

  const dayMap: Record<string, string> = {
    'Day1': '2026-04-27',
    'Day2': '2026-04-28',
    'Day3': '2026-04-29'
  };

  if (currentDay !== dayMap[sessionDay]) return false;

  const { start } = parseTime(timeStr);
  const diffMins = (start.getTime() - now.getTime()) / 60000;
  return diffMins > 0 && diffMins <= windowMins;
}

export function getTodayDay(): string | null {
  const now = new Date();
  const currentDay = now.toISOString().split('T')[0];
  const dayMap: Record<string, string> = {
    '2026-04-27': 'Day1',
    '2026-04-28': 'Day2',
    '2026-04-29': 'Day3'
  };
  return dayMap[currentDay] || null;
}

export function getDayDate(day: string): string {
  const dayMap: Record<string, string> = {
    'Day1': 'Mon 27 Apr',
    'Day2': 'Tue 28 Apr',
    'Day3': 'Wed 29 Apr'
  };

  return dayMap[day] || day;
}