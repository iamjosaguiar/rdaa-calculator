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

export async function GET(request: NextRequest) {
  try {
    // Initialize table if needed
    if (!tableInitialized) {
      await initAnalyticsTable();
      tableInitialized = true;
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const hasDateFilter = startDate && endDate;

    // Get summary stats
    const stats = hasDateFilter
      ? await sql`
          SELECT
            event_type,
            COUNT(*) as count,
            COUNT(DISTINCT session_id) as unique_sessions
          FROM calculator_events
          WHERE created_at >= ${startDate}::timestamp
            AND created_at < (${endDate}::timestamp + interval '1 day')
          GROUP BY event_type
        `
      : await sql`
          SELECT
            event_type,
            COUNT(*) as count,
            COUNT(DISTINCT session_id) as unique_sessions
          FROM calculator_events
          GROUP BY event_type
        `;

    const recentEvents = hasDateFilter
      ? await sql`
          SELECT * FROM calculator_events
          WHERE created_at >= ${startDate}::timestamp
            AND created_at < (${endDate}::timestamp + interval '1 day')
          ORDER BY created_at DESC
          LIMIT 100
        `
      : await sql`
          SELECT * FROM calculator_events
          ORDER BY created_at DESC
          LIMIT 100
        `;

    return NextResponse.json({ stats, recentEvents });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
