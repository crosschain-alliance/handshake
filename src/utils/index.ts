export const stripHexPrefix = (_str: string) => (_str.startsWith('0x') ? _str.slice(2) : _str)

export const jsonRpcId = () => Math.floor(Math.random() * 10000001)
