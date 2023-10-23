import { ApiMethods, Update, WebhookInfo } from '@grammyjs/types';
import { Logger } from '../utils/logger';

export type SendMessageArgs = Parameters<ApiMethods<object>['sendMessage']>[0];

export type SetWebhookArgs = Parameters<ApiMethods<object>['setWebhook']>[0];

export type GetUpdatesArgs = Parameters<ApiMethods<object>['getUpdates']>[0];

export type Fetch = typeof fetch;

export class BotApi {
  protected providerName = 'telegram' as const;

  protected botUrl: string;

  constructor(
    protected botToken: string,
    protected logger: Logger,
    protected localtunnelBypassOn = true,
  ) {
    this.botUrl = `https://api.telegram.org/bot${this.botToken}/`;
  }

  async sendMessage(args: SendMessageArgs): Promise<true> {
    await this.postRequest({ ...args, method: 'sendMessage' });
    return true;
  }

  async setWebhook(args: SetWebhookArgs): Promise<true> {
    if (args.url === undefined) this.logger.error('not received webhook url', args);
    await this.postRequest({ ...args, method: 'setWebhook' });
    return true;
  }

  async getWebhookInfo(): Promise<WebhookInfo> {
    const data = await this.getRequest<WebhookInfo>('getWebhookInfo');
    return data.result;
  }

  async getUpdates(args?: GetUpdatesArgs): Promise<Update[]> {
    let urlSuffix = 'getUpdates';
    if (args) {
      const notAllowedUpdates = Object.entries(args)
        .filter(([key]) => key !== 'allowed_updates');

      if (notAllowedUpdates.length !== 0) {
        urlSuffix = notAllowedUpdates.reduce(
          (suff, [key, value], i) => (
            `${suff}${key}=${value}${i === notAllowedUpdates.length - 1 ? '' : '&'}`
          ),
          `${urlSuffix}?`,
        );
      }
    }
    const data = await this.getRequest<Update[]>(urlSuffix);
    return data.result;
  }

  protected async postRequest(payload: object): Promise<object> {
    const bypassHeader = this.localtunnelBypassOn ? { 'Bypass-Tunnel-Reminder': 'ok' } : {};
    const response = await this.fetch(this.botUrl, {
      method: 'post',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', ...bypassHeader } as HeadersInit,
    });
    return response;
  }

  protected async getRequest<R>(urlSuffix: string): Promise<{ ok: boolean, result: R }> {
    const response = await this.fetch(this.botUrl + urlSuffix);
    return response.json() as unknown as { ok: boolean, result: R};
  }

  fetch(...args: Parameters<typeof fetch>): ReturnType<typeof fetch> {
    return fetch(...args);
  }
}
