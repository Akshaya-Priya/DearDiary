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
  const dateSet = new Set(entries.map(e => new Date(e.date).toDateString()));
  const sortedDays = Array.from(dateSet)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let maxStreak = 0;
  let currentStreak = 0;
  let streak = 1;

  // Calculate maxStreak
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);

    const diff = (curr.getTime() - prev.getTime()) / 86400000;

    if (diff === 1) {
      streak++;
    } else {
      streak = 1;
    }

    maxStreak = Math.max(maxStreak, streak);
  }

  // Calculate currentStreak (starting from yesterday or today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toDateString();

  let currentDate = dateSet.has(todayStr)
    ? new Date(today) // include today
    : new Date(today.getTime() - 86400000); // start from yesterday

  currentStreak = 0;
  while (dateSet.has(currentDate.toDateString())) {
    currentStreak++;
    currentDate = new Date(currentDate.getTime() - 86400000); // go to previous day
  }

  return {
    days: sortedDays.map(d => d.toISOString().slice(0, 10)), // return string dates
    currentStreak,
    maxStreak: Math.max(maxStreak, 1), // edge case if only 1 entry
  };
}
