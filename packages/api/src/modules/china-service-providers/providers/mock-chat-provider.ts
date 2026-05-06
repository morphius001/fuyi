import {
  ChatMessage,
  ChatProvider,
  ConversationParticipant,
  CreateConversationInput,
  CreateConversationResult,
  ListMessagesInput,
  SendMessageInput,
  SendMessageResult,
  UnreadCountInput,
} from "../types";
import { nowIso, providerError, stableMockId } from "../utils";

type MockConversation = {
  conversationId: string;
  participants: ConversationParticipant[];
  contextKey: string;
  createdAt: string;
};

export class MockChatProvider implements ChatProvider {
  private readonly conversations = new Map<string, MockConversation>();
  private readonly messages = new Map<string, ChatMessage[]>();
  private readonly sendResultsByIdempotencyKey = new Map<
    string,
    SendMessageResult
  >();
  private readonly unreadCounts = new Map<string, number>();

  async createOrGetConversation(
    input: CreateConversationInput,
  ): Promise<CreateConversationResult> {
    if (input.participants.length < 2) {
      throw providerError(
        "INVALID_INPUT",
        "A conversation requires at least two participants.",
        false,
      );
    }

    const participants = [...input.participants].sort((a, b) =>
      `${a.type}:${a.id}`.localeCompare(`${b.type}:${b.id}`),
    );
    const conversationId = stableMockId("mock_conv", [
      input.contextKey,
      participants.map(
        (participant) => `${participant.type}:${participant.id}`,
      ),
    ]);
    const existing = this.conversations.get(conversationId);

    if (existing) {
      return { conversationId, replayed: true };
    }

    this.conversations.set(conversationId, {
      conversationId,
      participants,
      contextKey: input.contextKey,
      createdAt: nowIso(),
    });
    this.messages.set(conversationId, []);

    return { conversationId, replayed: false };
  }

  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    if (input.idempotencyKey) {
      const replayed = this.sendResultsByIdempotencyKey.get(
        input.idempotencyKey,
      );

      if (replayed) {
        return { ...replayed, replayed: true };
      }
    }

    const conversation = this.conversations.get(input.conversationId);

    if (!conversation) {
      throw providerError("NOT_FOUND", "Conversation does not exist.", false, {
        conversationId: input.conversationId,
      });
    }

    const existingMessages = this.messages.get(input.conversationId) ?? [];
    const messageId = stableMockId("mock_msg", [
      input.conversationId,
      input.senderId,
      input.body,
      input.idempotencyKey ?? existingMessages.length + 1,
    ]);

    if (input.simulateFailure) {
      const failed: SendMessageResult = {
        messageId,
        status: "failed",
        reason: providerError(
          "PROVIDER_UNAVAILABLE",
          "Mock chat provider simulated a send failure.",
          true,
        ),
        replayed: false,
      };

      this.rememberSendResult(input.idempotencyKey, failed);
      return failed;
    }

    const message: ChatMessage = {
      messageId,
      conversationId: input.conversationId,
      senderId: input.senderId,
      body: input.body,
      attachments: input.attachments ?? [],
      createdAt: nowIso(),
    };

    existingMessages.push(message);
    this.messages.set(input.conversationId, existingMessages);
    conversation.participants
      .filter((participant) => participant.id !== input.senderId)
      .forEach((participant) => {
        const key = this.unreadKey(input.conversationId, participant.id);
        this.unreadCounts.set(key, (this.unreadCounts.get(key) ?? 0) + 1);
      });

    const sent: SendMessageResult = {
      messageId,
      status: "sent",
      replayed: false,
    };

    this.rememberSendResult(input.idempotencyKey, sent);
    return sent;
  }

  async listMessages(
    input: ListMessagesInput,
  ): Promise<{ messages: ChatMessage[] }> {
    return {
      messages: [...(this.messages.get(input.conversationId) ?? [])],
    };
  }

  async getUnreadCount(input: UnreadCountInput): Promise<{ count: number }> {
    return {
      count:
        this.unreadCounts.get(
          this.unreadKey(input.conversationId, input.participantId),
        ) ?? 0,
    };
  }

  private rememberSendResult(
    idempotencyKey: string | undefined,
    result: SendMessageResult,
  ): void {
    if (idempotencyKey) {
      this.sendResultsByIdempotencyKey.set(idempotencyKey, result);
    }
  }

  private unreadKey(conversationId: string, participantId: string): string {
    return `${conversationId}:${participantId}`;
  }
}
