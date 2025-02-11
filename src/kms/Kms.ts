import { Provider } from 'ethers'

export interface KmsConfigs {
  name: string
  provider?: Provider
}

export class Kms {
  name: string
  provider?: Provider

  constructor(configs: KmsConfigs) {
    this.name = configs.name
    this.provider = configs.provider
  }
}
