import 'dotenv/config'
import { ethers, JsonRpcProvider, Wallet } from 'ethers'
import { addHexPrefix, bytesToHex, hexToBytes, stripHexPrefix } from '@ethereumjs/util'
import fs from 'fs'

import { buildSafeTransaction, buildSignatureBytes, safeApproveHash } from './safe'
import { Operation } from './Operation'
import { IKms, Signature } from '../types'
import { Kms } from '../Kms'
import keyringGatewayAbi from './abi/keyring-gateway'
import erc20Abi from './abi/erc20'
import safeAbi from './abi/safe'

export interface KeyringKmsConfigs {
  bootNodeUrl: string
  instanceKeyType: 'ecdsa'
  instancePrivateKey?: string
}

export interface KeyringSignOptions {}

export const jsonRpcId = () => Math.floor(Math.random() * 10000001)

const KEYRING_ADDRESSES: { [key: number]: string } = {
  42161: '0xaA21f3be38b66aa6162A8E30AB712098A30B23E2',
}

export class KeyringKms extends Kms implements IKms<KeyringSignOptions> {
  private _instanceKeyWallet: Wallet
  bootNodeUrl: string
  connectedNodeUrl?: string
  instanceKeyType: string
  sharedPublicKey?: string
  sharedEvmAddress?: string

  constructor(configs?: KeyringKmsConfigs) {
    super({
      name: 'keyring',
    })

    this.bootNodeUrl = configs?.bootNodeUrl || 'http://bootnode.keyring.xyz'

    // NOTE: at the moment is supported only this authentication method
    if (configs?.instanceKeyType && configs.instanceKeyType !== 'ecdsa') throw new Error('Invalid identity type')

    this.instanceKeyType = configs?.instanceKeyType ?? 'ecdsa'

    if (!configs?.instancePrivateKey) {
      let pk
      if (!fs.existsSync('keyring-pk')) {
        pk = Wallet.createRandom().privateKey
        // TODO: store it encrypted or within something secure
        fs.writeFileSync('keyring-pk', pk)
      } else {
        pk = fs.readFileSync('pk').toString()
      }
      this._instanceKeyWallet = new ethers.Wallet(pk)
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
  }

  async prepareTransfer(
    tokenAddress: string,
    amount: string,
    receiver: string,
    provider: JsonRpcProvider
  ): Promise<Buffer> {
    // TODO: Determine a method to securely link the signer address to the Safe address and the KeyringSafeModule.
    // One approach is to use CREATE2 to deterministically generate the Safe address,
    // ensuring a direct association with the signer. This would enforce the linkage.

    const abiCoder = new ethers.AbiCoder()
    const safeAddress = '0xB7511E8434cC206fd75EC150E0b820E61e0d467a'
    const asset = new ethers.Contract(tokenAddress, erc20Abi, provider)
    const safe = new ethers.Contract(safeAddress, safeAbi, provider)

    const tx = buildSafeTransaction({
      to: await asset.getAddress(),
      safeTxGas: 0,
      nonce: await safe.nonce(),
      data: (await asset.transfer.populateTransaction(receiver, amount)).data,
    })

    const signatureBytes = buildSignatureBytes([
      await safeApproveHash(new ethers.Wallet(this._instanceKeyWallet.privateKey, provider), safe, tx, false),
    ])
    const operationData = abiCoder.encode(
      ['address', 'uint256', 'bytes', 'uint8', 'uint256', 'uint256', 'uint256', 'address', 'address', 'bytes'],
      [
        tx.to,
        tx.value,
        tx.data,
        tx.operation,
        tx.safeTxGas,
        tx.baseGas,
        tx.gasPrice,
        tx.gasToken,
        tx.refundReceiver,
        signatureBytes,
      ]
    )

    const operation = new Operation({
      chainId: provider._network.chainId,
      protocol: 'evm',
      data: hexToBytes(operationData),
      targetAddress: hexToBytes('0xc19A224520c21b8ab0BF50D47570d06805262c70'), // KeyringSafeModule
    })
    return Buffer.from(operation.serialize())
  }

  async sign(data: Buffer /*, options?: KeyringSignOptions*/): Promise<Signature> {
    const operation = Operation.from(data)
    const operationSignature = this._instanceKeyWallet.signingKey.sign(ethers.sha256(data)).serialized

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
              chainId: Number(operation.chainId),
              targetAddress: stripHexPrefix(bytesToHex(operation.targetAddress)),
              data: stripHexPrefix(bytesToHex(operation.data)),
              salt: stripHexPrefix(bytesToHex(operation.salt)),
            },
            stripHexPrefix(operationSignature.slice(0, operationSignature.length - 2)),
          ],
        }),
      })
    ).json()

    return Buffer.from(ethers.getBytes(addHexPrefix(result.signature)))
  }

  async postSignature(signature: Signature, data: Buffer, provider: JsonRpcProvider) {
    // NOTE: there will be an api call to propagate the signed

    const gatewayAddress = KEYRING_ADDRESSES[Number(provider._network.chainId)]
    if (!gatewayAddress) throw new Error('invalid network')

    // NOTE: provisional wallet with funds in ordet to be able to relay the tx
    const wallet = new ethers.Wallet(process.env.RELAY_PK as string, provider)

    const gateway = new ethers.Contract(gatewayAddress, keyringGatewayAbi, wallet)
    const serializedOperation = data
    await gateway.executeOperation(serializedOperation, signature)
  }
}
