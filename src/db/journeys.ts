import { initDatabase } from './config';

export async function saveJourney(userId: number, prompt: string) {
  const db = await initDatabase();
  try {
    const stmt = db.prepare('INSERT INTO journeys (prompt, user_id) VALUES (?, ?)');
    const result = stmt.run([prompt, userId]);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Failed to save journey:', error);
    throw error;
  }
}

export async function getJourneyHistory(userId: number) {
  const db = await initDatabase();
  try {
    const stmt = db.prepare(`
      SELECT 
        j.id,
        j.prompt,
        j.created_at,
        GROUP_CONCAT(json_object(
          'heading', jr.heading,
          'response', jr.response,
          'audio_url', jr.audio_url
        )) as responses
      FROM journeys j
      LEFT JOIN journey_responses jr ON j.id = jr.journey_id
      WHERE j.user_id = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `);
    
    const rows = stmt.all([userId]);
    return rows.map(row => ({
      ...row,
      responses: row.responses ? JSON.parse(`[${row.responses}]`) : []
    }));
  } catch (error) {
    console.error('Failed to get journey history:', error);
    return [];
  }
}

export async function deleteJourney(journeyId: number) {
  const db = await initDatabase();
  try {
    await db.exec('BEGIN TRANSACTION');
    const stmt1 = db.prepare('DELETE FROM journey_responses WHERE journey_id = ?');
    const stmt2 = db.prepare('DELETE FROM journeys WHERE id = ?');
    stmt1.run([journeyId]);
    stmt2.run([journeyId]);
    await db.exec('COMMIT');
    return true;
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('Failed to delete journey:', error);
    throw error;
  }
}