import { supabase } from './config';

export async function saveJourney(userId: number, prompt: string) {
  try {
    const { data, error } = await supabase
      .from('journeys')
      .insert([{ user_id: userId, prompt }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Failed to save journey:', error);
    throw error;
  }
}

export async function getJourneyHistory(userId: number) {
  try {
    const { data, error } = await supabase
      .from('journeys')
      .select(`
        id,
        prompt,
        created_at,
        journey_responses (
          heading,
          response,
          audio_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(journey => ({
      ...journey,
      responses: journey.journey_responses || []
    }));
  } catch (error) {
    console.error('Failed to get journey history:', error);
    return [];
  }
}

export async function deleteJourney(journeyId: number) {
  try {
    const { error } = await supabase
      .from('journeys')
      .delete()
      .eq('id', journeyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete journey:', error);
    throw error;
  }
}