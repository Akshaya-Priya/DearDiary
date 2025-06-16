import supabase from "./supabase";

export async function getAllEntries() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }
    const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq('user_id', user.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Fetch error:", error.message);
    return [];
  }

  return data;
}

export async function addEntry({ title, content, date, image }:{
  title: string; content: string; date: string; image?: string | null;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("diary_entries")
    .insert([
      {
        user_id: user?.id,
        title,
        content,
        date: date || new Date().toISOString().slice(0, 10),
        image: image || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Add error:", error.message);
    return null;
  }

  return data;
}

export async function updateEntry(id: number, updates: {
  title?: string;
  content?: string;
  date?: string;
  image?: string | null;
}) {
  const { data, error } = await supabase
    .from("diary_entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update error:", error.message);
    return null;
  }

  return data;
}

export async function deleteEntry(id: number) {
  const { error } = await supabase.from("diary_entries").delete().eq("id", id);
  if (error) console.error("Delete error:", error.message);
}

export async function findEntriesByKeyword(keyword: string) {
  const term = keyword.trim().toLowerCase();

  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .ilike("title", `%${term}%`) // case-insensitive search
    .order("date", { ascending: false });

  if (error) {
    console.error("Search error:", error.message);
    return [];
  }

  return data;
}

export async function findEntriesByDate(dateStr: string) {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("date", dateStr)
    .order("date", { ascending: false });

  if (error) {
    console.error("Date search error:", error.message);
    return [];
  }

  return data;
}

export async function getStreakInfo() {
  const entries = await getAllEntries();
  const days = Array.from(new Set(entries.map((e) => e.date))).sort();

  let currentStreak = 0,
    maxStreak = 0;
  let prev = null,
    streak = 0;

  for (const d of days) {
    const date = new Date(d);
    if (prev && date.getTime() - prev.getTime() === 86400000) {
      streak++;
    } else {
      streak = 1;
    }
    maxStreak = Math.max(maxStreak, streak);
    prev = date;
  }

  // Calculate current streak
  if (days.length) {
    let i = days.length - 1;
    let date = new Date(days[i]);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let diff = (today.getTime() - date.getTime()) / 86400000;

    streak = diff === 0 || diff === 1 ? 1 : 0;

    for (; i > 0; i--) {
      let prevDate = new Date(days[i - 1]);
      let curDate = new Date(days[i]);
      if (curDate.getTime() - prevDate.getTime() === 86400000) streak++;
      else break;
    }

    currentStreak = streak;
  }

  return { days, currentStreak, maxStreak };
}
