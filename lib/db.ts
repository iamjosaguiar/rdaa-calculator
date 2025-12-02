import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

// Initialize the analytics table if it doesn't exist
export async function initAnalyticsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS calculator_events (
      id SERIAL PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      session_id VARCHAR(100),
      mmm_category VARCHAR(20),
      professional_status VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
}
