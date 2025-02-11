import { JsonRpcProvider } from 'ethers'

export type Signature = Buffer

export interface IKms<O> {
  initialize(): Promise<void>
  sign(data: Buffer, options: O): Promise<Buffer>
  prepareTransfer(tokenAddress: string, amount: string, receiver: string, provider: JsonRpcProvider): Promise<Buffer>
  postSignature(signature: Signature, data: Buffer, provider: JsonRpcProvider): Promise<void>
}
