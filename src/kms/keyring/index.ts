import { ethers, Wallet } from 'ethers'
import { Kms, Signature } from '../Kms'

import { jsonRpcId, stripHexPrefix } from '../../utils'

export interface KeyringKmsConfigs {
  bootNodeUrl: string
  instanceKeyType: 'ecdsa'
  instancePrivateKey?: string
}

export class KeyringKms extends Kms {
  private _initialized: boolean = false
  private _instanceKeyWallet: Wallet
  bootNodeUrl: string
  connectedNodeUrl?: string
  instanceKeyType: string
  sharedPublicKey?: string
  sharedEvmAddress?: string

  constructor(configs?: KeyringKmsConfigs) {
    super({
      provider: 'Keyring',
    })

    this.bootNodeUrl = configs?.bootNodeUrl || 'http://bootnode.keyring.xyz'

    // NOTE: at the moment is supported only this authentication method
    if (configs?.instanceKeyType && configs.instanceKeyType !== 'ecdsa') throw new Error('Invalid identity type')

    this.instanceKeyType = configs?.instanceKeyType ?? 'ecdsa'

    if (!configs?.instancePrivateKey) {
      this._instanceKeyWallet = new ethers.Wallet(Wallet.createRandom().privateKey)
    } else {
      this._instanceKeyWallet = new ethers.Wallet(configs.instancePrivateKey)
    }
  }

  async initialize(): Promise<void> {
    // TODO: starting from bootnode, get a node url
    this.connectedNodeUrl = 'http://localhost:3001'

    const { result: keygenResult } = await (
      await globalThis.fetch(this.connectedNodeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jsonRpcId(),
          jsonrpc: '2.0',
          method: 'keyring_generateKey',
          params: [{ keyType: 'secp256k1', publicKey: stripHexPrefix(this._instanceKeyWallet.signingKey.publicKey) }],
        }),
      })
    ).json()

    this.sharedPublicKey = keygenResult.sharedPublicKey
    this.sharedEvmAddress = keygenResult.sharedEvmAddress
    this._initialized = true
  }

  async sign(data: Buffer): Promise<Signature> {
    await this.checkIfInitialized()

    return data
  }

  private async checkIfInitialized() {
    if (!this._initialized) {
      await this.initialize()
    }
  }
}
