/* eslint-disable no-console */
import { appendFile } from 'node:fs/promises';
import { Logger } from './logger';

export class FileLogger implements Logger {
  constructor(protected fileName: string) {}

  info(msg: string, ...args: object[]): void {
    this.log('INFO', msg, ...args);
  }

  prompt(msg: string, ...args: object[]): void {
    this.log('PROMPT', msg, ...args);
  }

  error(msg: string, ...args: object[]): never {
    this.log('ERROR', msg, ...args);
    throw Error(msg);
  }

  protected async log(type: string, msg: string, ...args: object[]): Promise<void> {
    try {
      await appendFile(this.fileName, this.getMessage(type, msg, ...args));
    } catch (e) {
      console.log(e);
    }
  }

  protected getMessage(type: string, msg: string, ...args: object[]): string {
    const argsStr = args ? args.map((arg) => JSON.stringify(arg, null, 2)) : '';
    return `${type}-[${new Date().toUTCString()}]: ${msg}${argsStr}\n`;
  }
}
