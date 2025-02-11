export type Signature = Buffer

export interface IKms<O> {
  initialize(): Promise<void>
  sign(data: Buffer, options: O): Promise<Buffer>
}
