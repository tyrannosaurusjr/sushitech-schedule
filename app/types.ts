export interface Session {
  id: number;
  title: { en: string; jp: string };
  category: { en: string; jp: string };
  themes: { en: string; jp: string };
  industryTags: { en: string; jp: string };
  technologyTags: { en: string; jp: string };
  focusOns: { en: string; jp: string };
  overview: { en: string; jp: string };
  day: string;
  stage: string;
  time: string;
  speakerIds: number[];
  url: string;
  hasOnDemand: string;
  speakers: Speaker[];
}

export interface Speaker {
  id: number;
  name: { en: string; jp: string };
  company: { en: string; jp: string };
  role: { en: string; jp: string };
  bio: { en: string; jp: string };
  subCategory: { en: string; jp: string };
  image: string;
}

export type Day = 'Day1' | 'Day2' | 'Day3';

export interface TimeSlot {
  time: string;
  sessions: Session[];
}