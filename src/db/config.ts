import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Initialize database (optional, mainly for type checking)
export async function initDatabase() {
  try {
    // You can add any initialization logic here if needed
    return supabase;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Example functions for database operations
export async function createUser(email: string, name: string) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createJourney(prompt: string, userId: number) {
  const { data, error } = await supabase
    .from('journeys')
    .insert([{ prompt, user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createJourneyResponse(
  journeyId: number, 
  heading: string, 
  response: string, 
  audioUrl?: string
) {
  const { data, error } = await supabase
    .from('journey_responses')
    .insert([{
      journey_id: journeyId,
      heading,
      response,
      audio_url: audioUrl
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}