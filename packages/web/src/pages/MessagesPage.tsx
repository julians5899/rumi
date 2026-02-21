import { t } from '../i18n/es';

export function MessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-rumi-text mb-6">{t.messages.conversations}</h1>
      <p className="text-rumi-text/60">{t.messages.noConversations}</p>
      {/* TODO: Conversation list + chat window */}
    </div>
  );
}
