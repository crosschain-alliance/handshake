import * as borsh from 'borsh'
import crypto from 'crypto'

export const PROTOCOLS_LABELS = {
  0: 'evm',
}

export const PROTOCOLS_ENUM = {
  evm: 0,
}

export type Protocol = 'evm'

interface OperationConfigs {
  protocol: Protocol
  chainId: bigint
  targetAddress: Uint8Array
  data: Uint8Array
  salt?: Uint8Array
}

export class Operation {
  protocol: Protocol
  chainId: bigint
  targetAddress: Uint8Array
  data: Uint8Array
  salt: Uint8Array

  constructor({ protocol, chainId, targetAddress, data, salt }: OperationConfigs) {
    this.protocol = protocol
    this.chainId = chainId
    this.targetAddress = targetAddress
    this.data = data
    this.salt = salt || crypto.randomBytes(10)
  }

  serialize(): Uint8Array {
    return borsh.serialize(
      {
        struct: {
          protocol: 'u8', // ENUM
          chainId: 'u64',
          targetAddress: { array: { type: 'u8' } },
          data: { array: { type: 'u8' } },
          salt: { array: { type: 'u8' } },
        },
      },
      {
        protocol: PROTOCOLS_ENUM[this.protocol],
        chainId: this.chainId,
        targetAddress: this.targetAddress,
        data: this.data,
        salt: this.salt,
      }
    )
  }

  static from(operation: Buffer): Operation {
    const deserialized = borsh.deserialize(
      {
        struct: {
          protocol: 'u8', // ENUM
          chainId: 'u64',
          targetAddress: { array: { type: 'u8' } },
          data: { array: { type: 'u8' } },
          salt: { array: { type: 'u8' } },
        },
      },
      operation
    ) as any

    if (!deserialized) {
      throw new Error('Failed to deserialize operation')
    }

    const protocolKey = deserialized.protocol as keyof typeof PROTOCOLS_LABELS
    return new Operation({
      protocol: PROTOCOLS_LABELS[protocolKey] as Protocol,
      chainId: deserialized.chainId,
      targetAddress: deserialized.targetAddress,
      data: deserialized.data,
      salt: deserialized.salt,
    })
  }

  encode() {
    return [this.protocol, this.chainId, this.targetAddress, this.data, this.salt]
  }
}
