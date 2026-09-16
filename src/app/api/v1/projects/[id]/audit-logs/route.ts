import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@sitesync/api/modules/audit/audit.service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const url = new URL(request.url);

    const actorId = url.searchParams.get('actorId') || undefined;
    const action = url.searchParams.get('action') || undefined;
    const entityType = url.searchParams.get('entityType') || undefined;
    const entityId = url.searchParams.get('entityId') || undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : 50;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!, 10) : 0;

    const auditService = new AuditService();
    const result = await auditService.getAuditLogs({
      projectId,
      actorId,
      action,
      entityType,
      entityId,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      projectId,
      total: result.total,
      logs: result.logs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
