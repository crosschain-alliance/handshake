import { Kms } from '../Kms'

export interface LitKmsConfigs {}

export class LitKms extends Kms {
  constructor(configs: LitKmsConfigs) {
    super({
      provider: 'Lit Protocol',
    })
    console.log(configs)
  }

  async initialize(): Promise<void> {
    // TODO
    return
  }
}
