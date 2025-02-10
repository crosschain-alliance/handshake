import { KeyringKms, KeyringKmsConfigs } from './kms/keyring'
import { LitKms, LitKmsConfigs } from './kms/lit'

export interface Kms {
  name: 'keyring' | 'lit'
  configs: KeyringKmsConfigs | LitKmsConfigs
}

export interface HandshakeConfigs {
  kms: Kms
}

class Handshake {
  private kms: KeyringKms | LitKms = new KeyringKms()

  constructor(configs?: HandshakeConfigs) {
    if (!configs) {
      this.kms = new KeyringKms()
    } else if (configs.kms.name === 'keyring') {
      this.kms = new KeyringKms(configs.kms.configs as KeyringKmsConfigs)
    } else if (configs.kms.name === 'lit') {
      this.kms = new LitKms(configs.kms.configs as LitKmsConfigs)
    } else {
      throw new Error('Invalid KMS')
    }
  }

  initialize(): Promise<void> {
    return this.kms.initialize()
  }
}

export default Handshake
