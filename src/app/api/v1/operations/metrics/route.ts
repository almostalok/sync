import { NextResponse } from 'next/server';
import { TelemetryService } from '@/../apps/api/src/modules/observability/telemetry.service';
import { DataFreshnessService } from '@/../apps/api/src/modules/observability/data-freshness.service';
import { EventBusService } from '@/../apps/api/src/modules/events/event-bus.service';

export async function GET(request: Request) {
  const telemetry = TelemetryService.getInstance();
  const freshnessService = new DataFreshnessService();
  const eventBus = EventBusService.getInstance();

  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') || 'PROJ-OIL-2026-01';

  const summary = telemetry.getSummary();
  const freshness = freshnessService.evaluateFreshness(projectId);
  const dlq = eventBus.getDeadLetterQueue();

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      service: 'sitesync-operations-monitoring',
      summary,
      freshness,
      deadLetterQueue: {
        totalJobs: dlq.length,
        recentJobs: dlq.slice(0, 10),
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Service-Layer': 'SiteSync-Operations',
      },
    }
  );
}
