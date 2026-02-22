import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { t } from '../i18n/es';
import { useAuthStore } from '../store/auth.store';
import apiClient from '../services/api-client';
import { useChat } from '../hooks/useChat';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { IconArrowLeft, IconSend, IconMessage, IconHeart } from '../components/ui/Icons';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface LastMessage {
  content: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participant: Participant;
  lastMessage: LastMessage | null;
  createdAt: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return t.messages.yesterday;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return t.messages.today;
  if (date.toDateString() === yesterday.toDateString()) return t.messages.yesterday;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function shouldShowDateSeparator(currentMsg: string, prevMsg: string | undefined): boolean {
  if (!prevMsg) return true;
  const curr = new Date(currentMsg).toDateString();
  const prev = new Date(prevMsg).toDateString();
  return curr !== prev;
}

// ---------- Conversation List ----------
function ConversationList({
  conversations,
  activeId,
  loading,
  userId,
}: {
  conversations: Conversation[];
  activeId: string | undefined;
  loading: boolean;
  userId: string;
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="px-4">
        <EmptyState
          icon={<IconMessage className="w-8 h-8" />}
          title={t.messages.noConversations}
          description={t.messages.noConversationsSubtitle}
          action={{ label: t.messages.goToMatches, to: '/matches' }}
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-rumi-primary-light/10">
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const isMine = conv.lastMessage?.senderId === userId;
        return (
          <button
            key={conv.id}
            onClick={() => navigate(`/messages/${conv.id}`)}
            className={`w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-rumi-primary/[0.03] transition-colors ${
              isActive ? 'bg-rumi-primary/5 border-l-3 border-rumi-primary' : ''
            }`}
          >
            <Avatar
              src={conv.participant.avatarUrl}
              name={`${conv.participant.firstName} ${conv.participant.lastName}`}
              size="md"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold text-rumi-text truncate ${isActive ? 'text-rumi-primary' : ''}`}>
                  {conv.participant.firstName} {conv.participant.lastName}
                </p>
                {conv.lastMessage && (
                  <span className="text-[10px] text-rumi-text/30 flex-shrink-0 ml-2">
                    {formatRelativeTime(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              {conv.lastMessage ? (
                <p className="text-xs text-rumi-text/40 truncate mt-0.5">
                  {isMine ? `${t.messages.you}: ` : ''}
                  {conv.lastMessage.content}
                </p>
              ) : (
                <p className="text-xs text-rumi-text/25 italic mt-0.5">Sin mensajes</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Chat View ----------
function ChatView({
  conversationId,
  participant,
  userId,
}: {
  conversationId: string;
  participant: Participant | undefined;
  userId: string;
}) {
  const { messages, sendMessage, isConnected, isLoading, error } = useChat({ conversationId });
  const [input, setInput] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSendError('');
    setSending(true);
    try {
      await sendMessage(input.trim());
      setInput('');
    } catch {
      setSendError(t.messages.errorSending);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-rumi-primary-light/10 glass-strong flex-shrink-0">
        <button
          onClick={() => navigate('/messages')}
          className="md:hidden p-1.5 rounded-lg text-rumi-text/40 hover:text-rumi-text hover:bg-rumi-text/5 transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
        </button>

        <Avatar
          src={participant?.avatarUrl || null}
          name={participant ? `${participant.firstName} ${participant.lastName}` : '?'}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rumi-text truncate">
            {participant ? `${participant.firstName} ${participant.lastName}` : '...'}
          </p>
          <div className="flex items-center gap-1.5">
            {isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <p className={`text-[11px] ${isConnected ? 'text-emerald-500' : 'text-rumi-text/30'}`}>
              {isConnected ? t.messages.online : t.messages.offline}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-rumi-bg/30">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-rumi-danger">{error}</p>
          </div>
        )}

        {!isLoading &&
          messages.map((msg, idx) => {
            const isMine = msg.senderId === userId;
            const showDate = shouldShowDateSeparator(
              msg.createdAt,
              idx > 0 ? messages[idx - 1].createdAt : undefined,
            );
            const isOptimistic = msg.id.startsWith('optimistic-');

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] text-rumi-text/30 glass px-3 py-1 rounded-full">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl shadow-sm ${
                      isMine
                        ? 'bg-rumi-primary text-white rounded-br-md'
                        : 'bg-white text-rumi-text rounded-bl-md'
                    } ${isOptimistic ? 'opacity-60' : ''}`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? 'text-white/50' : 'text-rumi-text/25'
                      } text-right`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Send error */}
      {sendError && (
        <div className="px-4 py-1.5 bg-rumi-danger/5">
          <p className="text-xs text-rumi-danger text-center">{sendError}</p>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-rumi-primary-light/10 glass-strong flex-shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.messages.typeMessage}
          rows={1}
          className="flex-1 resize-none rounded-2xl border-2 border-rumi-primary-light/30 px-4 py-2.5 text-sm focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 max-h-32 transition-all duration-200 placeholder:text-rumi-text/30"
          style={{ minHeight: '40px' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="p-2.5 rounded-xl bg-rumi-primary text-white hover:bg-rumi-primary-dark transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-rumi-primary/20"
        >
          <IconSend className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiClient.get<Conversation[]>('/messages/conversations');
      setConversations(res.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!conversationId) {
      fetchConversations();
    }
  }, [conversationId, fetchConversations]);

  const activeConversation = conversations.find((c) => c.id === conversationId);
  const userId = user?.userId || '';

  const showListOnMobile = !conversationId;

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] flex flex-col md:flex-row bg-white rounded-2xl shadow-lg shadow-rumi-primary/[0.04] overflow-hidden border border-rumi-primary-light/15">
      {/* Conversation list sidebar */}
      <div
        className={`${
          showListOnMobile ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-80 md:border-r border-rumi-primary-light/10 flex-shrink-0`}
      >
        <div className="px-4 py-3.5 border-b border-rumi-primary-light/10 flex-shrink-0">
          <h1 className="text-lg font-bold text-rumi-text">{t.messages.conversations}</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeId={conversationId}
            loading={loading}
            userId={userId}
          />
        </div>
      </div>

      {/* Chat area */}
      <div
        className={`${
          conversationId ? 'flex' : 'hidden'
        } md:flex flex-col flex-1 min-w-0`}
      >
        {conversationId ? (
          <ChatView
            conversationId={conversationId}
            participant={activeConversation?.participant}
            userId={userId}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center px-8">
            <EmptyState
              icon={<IconHeart className="w-10 h-10" />}
              title={t.messages.selectConversation}
              description={t.messages.selectConversationSubtitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
