// src/hooks/useStreak.js
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { getStreak, markStreakToday } from "../api/literacyService";

/**
 * Returns:
 *  streakDays  – array of 7 booleans (Mon–Sun), true = user was active that day
 *  streakCount – current consecutive day count
 *  loading     – fetching from Firestore
 */
export function useStreak() {
  const { user } = useUser();
  const [streakDays,  setStreakDays]  = useState(Array(7).fill(false));
  const [streakCount, setStreakCount] = useState(0);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const init = async () => {
      // mark today active & get updated streak
      const { count } = await markStreakToday(user.uid || user._id);
      const data  = await getStreak(user.uid || user._id);
      setStreakCount(count);

      // build 7-day window: Mon of current week → Sun
      const today   = new Date();
      const dayOfWk = today.getDay(); // 0=Sun,1=Mon,...
      const monday  = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWk + 6) % 7)); // go back to Mon

      const week = Array(7).fill(false);
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const str = d.toISOString().slice(0, 10);
        if ((data.dates || []).includes(str)) week[i] = true;
      }
      setStreakDays(week);
      setLoading(false);
    };

    init();
  }, [user]);

  return { streakDays, streakCount, loading };
}
