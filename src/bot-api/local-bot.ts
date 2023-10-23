import lt from 'localtunnel';
import { Update } from '@grammyjs/types';
import { BotApi } from './bot-api';
import { ConsoleLogger } from '../utils/console-logger';
import { Logger } from '../utils/logger';

type Handler = (updates: Update) => void | Promise<void>;

export class LocalBot {
  public botApi: BotApi;

  public webHookUrl: string | undefined;

  protected updateHandlers: Handler[] = [];

  protected tunnel: lt.Tunnel | undefined;

  constructor(
    protected tunnelArgs: lt.TunnelConfig & { port: number },
    protected botToken: string,
    protected logger: Logger = new ConsoleLogger(),
  ) {
    this.botApi = new BotApi(botToken, logger);
  }

  async init(): Promise<void> {
    await this.initWebhookUrl();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.botApi.setWebhook({ url: this.webHookUrl! });
  }

  initWebhookUrl(): Promise<void> {
    this.logger.info(`start init localtunnel in port: ${this.tunnelArgs.port}`);
    return new Promise((resolve, reject) => {
      const tunnel = lt(this.tunnelArgs, (err, initedTunnel) => {
        if (err) {
          this.logger.prompt('fail init localtunnel', { err, tunnel: initedTunnel });
          reject(err);
        }
        if (!initedTunnel || !initedTunnel.url) {
          this.logger.error('fail inited local tunnel', { tunnel: initedTunnel });
        }

        this.logger.info(`localtunnel successfully inited, url=${initedTunnel.url}`);
        this.webHookUrl = `${initedTunnel.url}/`.replace('http:', 'https:');
        this.logger.info(`webhook url successfully inited, webhookUrl=${this.webHookUrl}`);
        resolve();
      });
      this.tunnel = tunnel;
    });
  }

  startBotServer(): void {
    this.logger.info(`start server in port: ${this.tunnelArgs.port}`);
    const { port } = this.tunnelArgs;
    const { updateHandlers } = this;
    const { logger } = this;
    Bun.serve({
      port,
      async fetch(req) {
        const updates = await req.json() as Update;
        logger.info(`update json: ${JSON.stringify(updates, null, 2)}`);
        updateHandlers.forEach((handler) => handler(updates));

        logger.info(`received request. method: ${req.method}.`);
        return new Response('ok', { status: 200 });
      },
    });
  }

  subscribeUpdates(cb: Handler): void {
    this.updateHandlers.push(cb);
  }
}
