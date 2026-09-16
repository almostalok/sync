import { NextResponse } from 'next/server';
import { copilotConversationService } from '@/../apps/api/src/modules/copilot';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversations = await copilotConversationService.getProjectConversations(params.id);
    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: conversations,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'system-user';
    const conversation = await copilotConversationService.getOrCreateConversation(
      params.id,
      userId,
      body.conversationId
    );
    return NextResponse.json({
      success: true,
      projectId: params.id,
      data: conversation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
