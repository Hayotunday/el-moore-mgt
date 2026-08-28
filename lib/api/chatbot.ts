import { apiFetch } from "./client";
import type { ChatConversation, ChatMessage, ChatSender } from "./types";

/**
 * Client for the live backend's chatbot module. Not wired into any /management page yet —
 * the AI-human hybrid care feature from the product scope doc hasn't been built out in this
 * frontend. Exposed here so it's ready to build against.
 */

/** Public. */
export async function startConversation(customerIdentifier: string): Promise<ChatConversation> {
  return apiFetch<ChatConversation>("/chatbot/conversations", {
    method: "POST",
    body: JSON.stringify({ customerIdentifier }),
  });
}

/** CUSTOMER_CARE or OFFICE_ADMIN. */
export async function listConversations(): Promise<ChatConversation[]> {
  return apiFetch<ChatConversation[]>("/chatbot/conversations");
}

/** Public. */
export async function sendMessage(
  conversationId: string,
  content: string,
  sender: ChatSender = "CUSTOMER",
): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/chatbot/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, sender }),
  });
}

/** Public. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  return apiFetch<ChatMessage[]>(`/chatbot/conversations/${conversationId}/messages`);
}

/** CUSTOMER_CARE or OFFICE_ADMIN. */
export async function handoffConversation(id: string): Promise<ChatConversation> {
  return apiFetch<ChatConversation>(`/chatbot/conversations/${id}/handoff`, { method: "PATCH" });
}

/** CUSTOMER_CARE or OFFICE_ADMIN. */
export async function closeConversation(id: string): Promise<ChatConversation> {
  return apiFetch<ChatConversation>(`/chatbot/conversations/${id}/close`, { method: "PATCH" });
}
