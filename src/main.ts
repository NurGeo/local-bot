import { Update } from '@grammyjs/types';
import { LocalBot } from './bot-api/local-bot';
import { FileLogger } from './utils/file-logger';

async function main(): Promise<void> {
  const logger = new FileLogger('/home/nur/updates.log');
  const botToken = process.env.BOT_TOKEN ?? logger.error('not finded bot token from envoirement');
  const bot = new LocalBot({ port: 3000 }, botToken, logger);
  await bot.init();

  function hanlder(update: Update): void {
    logger.info('update hanlder: ', update);
  }
  bot.subscribeUpdates(hanlder);
  bot.startBotServer();
}

main();
