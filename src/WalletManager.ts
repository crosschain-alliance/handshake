import { KeyringKms, KeyringKmsConfigs, KeyringSignOptions } from './kms/keyring'
import { IKms } from './kms/types'

export class WalletManager<
  O extends KeyringSignOptions = KeyringSignOptions,
  K extends IKms<O> = KeyringKms,
  C = KeyringKmsConfigs
> {
  private wallets: { [key: string]: Wallet<O, K, C> } = {}

  createNewWallet(label: string, configs?: WalletConfigs<K, C, O>): Wallet<O, K, C> {
    if (this.wallets[label]) throw new Error('wallet already existent')
    this.wallets[label] = new Wallet(configs)
    return this.wallets[label]
  }
}

export interface WalletConfigs<K extends IKms<O>, C, O> {
  kms: {
    constructor: new (configs?: C) => K
    configs?: C
  }
}

export class Wallet<
  O extends KeyringSignOptions = KeyringSignOptions,
  K extends IKms<O> = KeyringKms,
  C = KeyringKmsConfigs
> {
  kms: K
  private initialized: boolean = false

  constructor(configs?: WalletConfigs<K, C, O>) {
    if (configs?.kms) {
      this.kms = new configs.kms.constructor(configs.kms.configs)
    } else {
      this.kms = (new KeyringKms() as unknown) as K
    }
  }

  async initialize(): Promise<void> {
    await this.kms.initialize()
    this.initialized = true
  }

  async sign(data: Buffer, options?: O): Promise<Buffer> {
    await this.checkIfInitialized()
    return this.kms.sign(data, options || ({} as O))
  }

  private async checkIfInitialized() {
    if (!this.initialized) {
      await this.initialize()
    }
  }
}
