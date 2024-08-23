import type { AgentUserConfig } from '../config/config';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, LLMChatParams } from './types';
import { requestChatCompletions } from './request';

export class Mistral implements ChatAgent {
    readonly name = 'mistral';
    readonly modelKey = 'MISTRAL_API_KEY';

    enable(context: AgentUserConfig): boolean {
        return !!(context.MISTRAL_API_KEY);
    }

    model(ctx: AgentUserConfig) {
        return ctx.MISTRAL_CHAT_MODEL;
    }

    private render(item: HistoryItem): any {
        return {
            role: item.role,
            content: item.content,
        };
    }

    async request(params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> {
        const { message, prompt, history } = params;
        const url = `${context.MISTRAL_API_BASE}/chat/completions`;
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.MISTRAL_API_KEY}`,
        };

        const messages = [...(history || []), { role: 'user', content: message }];
        if (prompt) {
            messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
        }

        const body = {
            model: context.MISTRAL_CHAT_MODEL,
            messages: messages.map(this.render),
            stream: onStream != null,
        };

        return requestChatCompletions(url, header, body, onStream);
    }
}
