import { JsonRpcProvider } from 'ethers'
import { IKms, Signature } from '../types'

export interface LitKmsConfigs {}

export interface LitSignOptions {}

export class LitKms implements IKms<LitSignOptions> {
  constructor(configs?: LitKmsConfigs) {
    console.log(configs)
  }

  async initialize(): Promise<void> {
    // TODO
    return
  }

  async sign(data: Buffer, options: LitSignOptions = {}): Promise<Signature> {
    // TODO
    console.log(options)
    return data
  }

  async prepareTransfer(
    tokenAddress: string,
    amount: string,
    receiver: string,
    provider: JsonRpcProvider
  ): Promise<Buffer> {
    // TODO
    console.log(tokenAddress, amount, receiver, provider)
    return Buffer.from([])
  }

  async postSignature(signature: Signature, data: Buffer, provider: JsonRpcProvider) {
    // TODO
    console.log(signature, data, provider)
  }
}
