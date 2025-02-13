# Handshake

Handshake is a Universal SDK for AI Agents to Interact Securely with Web3. It provides a modular and extensible SDK that simplifies key management for AI agents, enabling them to securely interact with blockchain ecosystems. By abstracting the complexities of cryptographic operations, Handshake allows AI frameworks to seamlessly integrate Web3 functionalities without compromising security or flexibility.

Handshake has been integrated within ElizaOS, the integration can be found [here](https://github.com/crosschain-alliance/eliza).


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

If you don't specify anything, the default KMS is [Keyring](https://github.com/allemanfredi/keyring).


## Contributing
Contributions are welcome! Please open an issue or submit a pull request with improvements.


## License
This project is licensed under the MIT License.



