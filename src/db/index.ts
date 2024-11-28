import { supabase } from './config';

export interface Journey {
  id: string;
  prompt: string;
  exercises: any;
  analysis: any;
  responses: JourneyResponse[];
  created_at: string;
}

export interface JourneyResponse {
  heading: string;
  response: string;
  audio_url?: string;
}

export const db = {
  async initDatabase() {
    try {
      return supabase;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  },

  async saveJourney(userId: number, prompt: string, exercises: any = null, analysis: any = null): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .insert([{
          user_id: userId,
          prompt,
          exercises,
          analysis,
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to save journey:', error);
      throw error;
    }
  },

  async getJourneyHistory(userId: number): Promise<Journey[]> {
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(journey => ({
        ...journey,
        responses: journey.journey_responses || [],
        timestamp: journey.created_at
      }));
    } catch (error) {
      console.error('Failed to get journey history:', error);
      return [];
    }
  },

  async deleteJourney(journeyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journeys')
        .delete()
        .eq('id', journeyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to delete journey:', error);
      return false;
    }
  },

  async updateJourneyResponse(
    journeyId: string,
    heading: string,
    response: string,
    audioUrl?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journey_responses')
        .upsert({
          journey_id: journeyId,
          heading,
          response,
          audio_url: audioUrl
        }, {
          onConflict: 'journey_id,heading'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update journey response:', error);
      return false;
    }
  },

  async getJourneyResponses(journeyId: string): Promise<JourneyResponse[]> {
    try {
      const { data, error } = await supabase
        .from('journey_responses')
        .select('heading, response, audio_url')
        .eq('journey_id', journeyId);

      if (error) throw error;
      return data.map(response => ({
        heading: response.heading,
        response: response.response,
        audioUrl: response.audio_url
      }));
    } catch (error) {
      console.error('Failed to get journey responses:', error);
      return [];
    }
  }
};