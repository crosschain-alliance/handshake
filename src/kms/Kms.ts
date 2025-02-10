export interface KmsConfigs {
  provider: string
}

export type Signature = Buffer

export abstract class Kms {
  provider: string

  constructor(configs: KmsConfigs) {
    this.provider = configs.provider
  }

  abstract initialize(): Promise<void>
}
