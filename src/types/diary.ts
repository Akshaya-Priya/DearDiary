// src/types/diary.ts

export type DiaryEntry = {
  id: number;  // Optional if not present before saving to DB
  title: string;
  content: string;
  date: string;
  image?: string | null;
};
