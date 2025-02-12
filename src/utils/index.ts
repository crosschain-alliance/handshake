export const stripHexPrefix = (str: string) => (str.startsWith('0x') ? str.slice(2) : str)

export const addHexPrefix = (str: string) => (!str.startsWith('0x') ? '0x' + str : str)
