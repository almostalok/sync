import { NextResponse } from 'next/server';
import { copilotConversationService } from '@/../apps/api/src/modules/copilot';

export async function GET(
  _req: Request,
  { params }: { params: { id: string; conversationId: string } }
) {
  try {
    const conversation = await copilotConversationService.getOrCreateConversation(
      params.id,
      'system-user',
      params.conversationId
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

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; conversationId: string } }
) {
  try {
    const deleted = await copilotConversationService.deleteConversation(
      params.id,
      params.conversationId
    );
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      projectId: params.id,
      message: 'Conversation deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
