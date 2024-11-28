import { useState, useEffect } from 'react';
import type { JourneyEntry } from '../types/history';
import { supabase } from '../db/config';

export function useJourneyHistory() {
  const [journeyHistory, setJourneyHistory] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('journeys')
          .select(`
            id,
            prompt,
            exercises,
            analysis,
            created_at,
            journey_responses (
              heading,
              response,
              audio_url
            )
          `)
          .eq('user_id', 1) // Demo user ID
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedHistory = data.map((entry: any) => ({
            id: entry.id,
            prompt: entry.prompt,
            exercises: entry.exercises || {},
            analysis: entry.analysis,
            created_at: entry.created_at,
            responses: entry.journey_responses || []
          }));
          setJourneyHistory(formattedHistory);
        }
      } catch (error) {
        console.error('Failed to load journey history:', error);
        setError(error instanceof Error ? error.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  return {
    journeyHistory,
    setJourneyHistory,
    isLoading,
    error
  };
}