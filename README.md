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

const handshake = new Handshake() // default kms is Keyring
handshake.sign(Buffer.from("message"), { chainId: 1, protocol: "evm", targetAddress: "0x123" })
```

if you want to specify a different KMS, for example Lit Protocol, you can do in this way:
```typescript
import { Handshake } from 'handshake-ts';

const handshake = new Handshake({
    kms: {
        constructor: LitKms
    }
})
handshake.sign(Buffer.from("message"))
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request with improvements.

## License
This project is licensed under the MIT License.



