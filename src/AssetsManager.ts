import { JsonRpcProvider, Contract } from 'ethers'
import { Wallet } from './WalletManager'
import erc20Abi from './kms/keyring/abi/erc20'

export type NetworkConfigs = {
  [key: string]: {
    rpc: string
  }
}

export interface AssetsManagerConfigs {
  networkConfigs: NetworkConfigs
}

const DEFAULT_CONFIGS = {
  eth: {
    rpc: 'https://eth.llamarpc.com',
  },
  arb: {
    rpc: 'https://arbitrum.llamarpc.com',
  },
  gno: {
    rpc: 'https://gnosis.drpc.org',
  },
}

export class AssetsManager {
  networkConfigs: NetworkConfigs = DEFAULT_CONFIGS

  constructor(configs?: AssetsManagerConfigs) {
    if (configs) {
      this.networkConfigs = { ...DEFAULT_CONFIGS, ...configs.networkConfigs }
    }
  }

  async transferToken(wallet: Wallet, amount: number, destinationAddressAsEIP3770: string, tokenAddress: string) {
    const [chain, recipient] = destinationAddressAsEIP3770.split(':')

    const networkConfig = this.networkConfigs[chain]
    if (!networkConfig) throw new Error('network configs not supported. You can add it during the initialization')
    const provider = new JsonRpcProvider(networkConfig.rpc)

    const asset = new Contract(tokenAddress, erc20Abi, provider)
    const decimals = (await asset.decimals()) as bigint
    const onchainAmount = (BigInt(amount * 10 ** 18) * BigInt(Math.pow(10, Number(decimals)))) / BigInt(10 ** 18)

    const data = await wallet.kms.prepareTransfer(tokenAddress, onchainAmount.toString(), recipient, provider)
    const signature = await wallet.sign(data)
    await wallet.kms.postSignature(signature, data, provider)
  }
}
