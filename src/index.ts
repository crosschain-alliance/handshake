import { AssetsManager } from './AssetsManager'
import { KeyringKms } from './kms/keyring'
import { LitKms } from './kms/lit'
import { WalletManager } from './WalletManager'

export class Handshake {
  walletManager: WalletManager
  assetsManager: AssetsManager

  constructor() {
    this.walletManager = new WalletManager()
    this.assetsManager = new AssetsManager()
  }
}

export { KeyringKms, LitKms, WalletManager, AssetsManager }
