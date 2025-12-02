import { NextRequest, NextResponse } from 'next/server';
import { sql, initAnalyticsTable } from '@/lib/db';

// Initialize table on first request
let tableInitialized = false;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, sessionId, mmmCategory, professionalStatus } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    // Initialize table if needed
    if (!tableInitialized) {
      await initAnalyticsTable();
      tableInitialized = true;
    }

    // Insert the event
    await sql`
      INSERT INTO calculator_events (event_type, session_id, mmm_category, professional_status)
      VALUES (${eventType}, ${sessionId || null}, ${mmmCategory || null}, ${professionalStatus || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Initialize table if needed
    if (!tableInitialized) {
      await initAnalyticsTable();
      tableInitialized = true;
    }

    // Get summary stats
    const stats = await sql`
      SELECT
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT session_id) as unique_sessions
      FROM calculator_events
      GROUP BY event_type
    `;

    const recentEvents = await sql`
      SELECT * FROM calculator_events
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ stats, recentEvents });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
