import { supabase } from './config';

export async function updateJourneyResponse(
  journeyId: number,
  heading: string,
  response: string,
  audioUrl?: string
) {
  try {
    const { data, error } = await supabase
      .from('journey_responses')
      .upsert({
        journey_id: journeyId,
        heading,
        response,
        audio_url: audioUrl
      }, {
        onConflict: 'journey_id,heading'
      })
      .select()
      .single();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to update journey response:', error);
    throw error;
  }
}

export async function getJourneyResponses(journeyId: number) {
  try {
    const { data, error } = await supabase
      .from('journey_responses')
      .select('heading, response, audio_url')
      .eq('journey_id', journeyId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get journey responses:', error);
    return [];
  }
}