import { ethers, hexlify, Wallet } from 'ethers'

import { addHexPrefix, jsonRpcId, stripHexPrefix } from '../../utils'
import { Operation, Protocol } from './Operation'
import { IKms, Signature } from '../types'

export interface KeyringKmsConfigs {
  bootNodeUrl: string
  instanceKeyType: 'ecdsa'
  instancePrivateKey?: string
}

export interface KeyringSignOptions {
  chainId: number
  protocol: Protocol
  targetAddress: string
}

export class KeyringKms implements IKms<KeyringSignOptions> {
  private _initialized: boolean = false
  private _instanceKeyWallet: Wallet
  bootNodeUrl: string
  connectedNodeUrl?: string
  instanceKeyType: string
  sharedPublicKey?: string
  sharedEvmAddress?: string

  constructor(configs?: KeyringKmsConfigs) {
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

    const { result } = await (
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

    this.sharedPublicKey = result.sharedPublicKey
    this.sharedEvmAddress = result.sharedEvmAddress
    this._initialized = true
  }

  async sign(data: Buffer, options: KeyringSignOptions): Promise<Signature> {
    await this.checkIfInitialized()

    const operation = new Operation({
      chainId: options.chainId,
      protocol: options.protocol,
      data,
      targetAddress: options.targetAddress,
    })

    const serializedOperation = operation.serialize()
    const operationSignature = this._instanceKeyWallet.signingKey.sign(ethers.sha256(serializedOperation)).serialized

    const { result } = await (
      await globalThis.fetch(this.connectedNodeUrl as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jsonRpcId(),
          jsonrpc: '2.0',
          method: 'keyring_sign',
          params: [
            stripHexPrefix(this.sharedPublicKey as string),
            {
              protocol: operation.protocol,
              chainId: operation.chainId,
              targetAddress: stripHexPrefix(operation.targetAddress),
              data: stripHexPrefix(hexlify(operation.data)),
              salt: stripHexPrefix(operation.salt),
            },
            stripHexPrefix(operationSignature.slice(0, operationSignature.length - 2)),
          ],
        }),
      })
    ).json()

    return Buffer.from(ethers.getBytes(addHexPrefix(result.signature)))
  }

  private async checkIfInitialized() {
    if (!this._initialized) {
      await this.initialize()
    }
  }
}
