/* eslint-disable no-console */
import { Logger } from './logger';

export class ConsoleLogger implements Logger {
  info(msg: string, ...args: object[]): void {
    console.log(this.getMessage('INFO', msg, ...args));
  }

  prompt(msg: string, ...args: object[]): void {
    console.log(this.getMessage('PROMPT', msg, ...args));
  }

  error(msg: string, ...args: object[]): never {
    console.log(this.getMessage('ERROR', msg, ...args));
    throw Error(msg);
  }

  protected getMessage(type: string, msg: string, ...args: object[]): string {
    const argsStr = args ? args.map((arg) => JSON.stringify(arg, null, 2)) : '';
    return `${type}: [${new Date().toUTCString()}]: ${msg}${argsStr}`;
  }
}
