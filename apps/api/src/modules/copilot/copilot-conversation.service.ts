import {
  CopilotConversation,
  CopilotMessage,
} from '@sitesync/types';

export class CopilotConversationService {
  private conversations = new Map<string, CopilotConversation>();

  /**
   * Create or fetch existing conversation strictly isolated by projectId.
   */
  async getOrCreateConversation(
    projectId: string,
    userId: string,
    conversationId?: string
  ): Promise<CopilotConversation> {
    if (conversationId && this.conversations.has(conversationId)) {
      const conv = this.conversations.get(conversationId)!;
      if (conv.projectId !== projectId) {
        throw new Error(`Unauthorized: Cross-project conversation access rejected.`);
      }
      return conv;
    }

    const newId = conversationId || `CONV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newConv: CopilotConversation = {
      id: newId,
      projectId,
      userId,
      title: 'New Project Copilot Thread',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    this.conversations.set(newId, newConv);
    return newConv;
  }

  /**
   * Append message to conversation with project isolation check.
   */
  async addMessage(
    projectId: string,
    conversationId: string,
    message: Omit<CopilotMessage, 'id' | 'createdAt'>
  ): Promise<CopilotMessage> {
    const conv = this.conversations.get(conversationId);
    if (!conv || conv.projectId !== projectId) {
      throw new Error(`Cannot add message: conversation ${conversationId} not found in project ${projectId}`);
    }

    const fullMessage: CopilotMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...message,
    };

    conv.messages.push(fullMessage);
    conv.updatedAt = fullMessage.createdAt;

    // Update conversation title if first user message
    if (conv.messages.length === 1 && message.role === 'user') {
      conv.title = message.content.slice(0, 45) + (message.content.length > 45 ? '...' : '');
    }

    return fullMessage;
  }

  /**
   * Get all conversations for a project.
   */
  async getProjectConversations(projectId: string): Promise<CopilotConversation[]> {
    return Array.from(this.conversations.values())
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Delete conversation thread (respecting project scoping).
   */
  async deleteConversation(projectId: string, conversationId: string): Promise<boolean> {
    const conv = this.conversations.get(conversationId);
    if (!conv || conv.projectId !== projectId) {
      return false;
    }
    return this.conversations.delete(conversationId);
  }
}
