import { useState, useEffect } from 'react';
import type { JourneyEntry } from '../types/history';
import { db } from '../db';

export function useJourneyHistory() {
  const [journeyHistory, setJourneyHistory] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        await db.initDatabase();
        const history = await db.getJourneyHistory(1); // Demo user ID
        if (history) {
          const formattedHistory = history.map((entry: any) => ({
            id: entry.id,
            prompt: entry.prompt,
            exercises: entry.exercises || {},
            analysis: entry.analysis,
            timestamp: entry.timestamp,
            responses: entry.responses || []
          }));
          setJourneyHistory(formattedHistory);
        }
      } catch (error) {
        console.error('Failed to load journey history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();

    // Add event listener for storage changes
    const handleStorageChange = () => {
      loadHistory();
    };
    window.addEventListener('journeyUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('journeyUpdate', handleStorageChange);
    };
  }, []);

  return {
    journeyHistory,
    setJourneyHistory,
    isLoading
  };
}