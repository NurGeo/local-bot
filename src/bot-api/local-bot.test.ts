/* eslint-disable @typescript-eslint/explicit-function-return-type */
import lt from 'localtunnel';
import {
  describe, test, expect, spyOn,
} from 'bun:test';
import { LocalBot } from './local-bot';

const getFetchMockOnce = (sut: LocalBot, resolvedValue: object) => {
  const fn = () => resolvedValue;
  const fetchMock = spyOn(sut.botApi, 'fetch').mockReturnValueOnce(
    Promise.resolve({ json: fn }) as ReturnType<typeof fetch>,
  );
  return fetchMock;
};

describe('init bot server tests', () => {
  const tunnelArgs = { port: 3000, subdomain: 'bot-test-subdomain' };
  const testBotToken = '<BOT_TOKEN>';

  test('received tunnel-like object', async () => {
    const sut = new LocalBot(tunnelArgs, testBotToken);
    const getInitWobhookUrlMock = spyOn(sut, 'initWebhookUrl').mockImplementationOnce(
      async () => { sut.webHookUrl = 'http://test_domain.ts/updates'; },
    );
    const fetchMock = getFetchMockOnce(sut, { ok: true });
    await sut.init();

    expect(getInitWobhookUrlMock).toHaveBeenCalledTimes(1);
    expect(sut.webHookUrl).toBe('http://test_domain.ts/updates');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.telegram.org/bot<BOT_TOKEN>/');
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'post',
      body: JSON.stringify({
        url: 'http://test_domain.ts/updates',
        method: 'setWebhook',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'ok',
      },
    });
  });
});
