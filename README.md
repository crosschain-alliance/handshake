# Handshake

## Overview
TODO


## Getting Started
### Prerequisites
- Node.js (latest stable version)
- npm or yarn
- TypeScript

### Installation
Install Handshake via npm:
```sh
npm install handshake-ts
```
Or using yarn:
```sh
yarn add handshake-ts
```

### Usage
Import and initialize Handshake in your project: 
```typescript
import { Handshake } from 'handshake-ts';

const handshake = new Handshake()
const savingsWallet = handshake.walletManager.createNewWallet("saving wallet 1")
const tradingWallet = handshake.walletManager.createNewWallet("trading wallet 1")
await handshake.assetsManager.transferToken(savingsWallet, 0.01, "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "arb:0x123..")
```



## Contributing
Contributions are welcome! Please open an issue or submit a pull request with improvements.

## License
This project is licensed under the MIT License.



