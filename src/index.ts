import { IKms } from './kms/types'
import { KeyringKms, KeyringKmsConfigs, KeyringSignOptions } from './kms/keyring'
import { LitKms } from './kms/lit'

export interface HandshakeConfigs<K extends IKms<O>, C, O> {
  kms: {
    constructor: new (configs?: C) => K
    configs?: C
  }
}

export class Handshake<
  O extends KeyringSignOptions = KeyringSignOptions,
  K extends IKms<O> = KeyringKms,
  C = KeyringKmsConfigs
> {
  private kms: K

  constructor(configs?: HandshakeConfigs<K, C, O>) {
    if (configs?.kms) {
      this.kms = new configs.kms.constructor(configs.kms.configs)
    } else {
      this.kms = (new KeyringKms() as unknown) as K
    }
  }

  async initialize(): Promise<void> {
    return this.kms.initialize()
  }

  async sign(data: Buffer, options?: O): Promise<Buffer> {
    return this.kms.sign(data, options || ({} as O))
  }
}

export {
  KeyringKms,
  LitKms
}