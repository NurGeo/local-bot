export interface Logger {
  info(msg: string, ...args: object[]): void

  prompt(msg: string, ...args: object[]): void

  error(msg: string, ...args: object[]): never
}
