import { IKms, Signature } from '../types'

export interface LitKmsConfigs {}

export interface LitSignOptions {}

export class LitKms implements IKms<LitSignOptions> {
  constructor(configs: LitKmsConfigs) {
    console.log(configs)
  }

  async initialize(): Promise<void> {
    // TODO
    return
  }

  async sign(data: Buffer, options: LitSignOptions): Promise<Signature> {
    console.log(options)
    return data
  }
}
