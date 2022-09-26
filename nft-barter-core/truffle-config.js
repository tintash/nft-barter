
// const { MNEMONIC, PROJECT_ID } = process.env;
require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');
const private_keys = [process.env.PRIVATE_KEY];

module.exports = {
  
  plugins: [
    'truffle-plugin-verify',
    'truffle-contract-size'
  ],
  
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  },

  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },

    rinkeby: {
      provider: () => new HDWalletProvider({
        privateKeys: private_keys,
        providerOrUrl: process.env.RINKEBY_URL,
        numberOfAddresses: 1,
      }),
      network_id: 4,       // Rinkeby's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confirmations to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },

    goerli: {
      provider: () => new HDWalletProvider({
        privateKeys: private_keys,
        providerOrUrl: process.env.GOERLI_URL,
        numberOfAddresses: 1,
      }),
      network_id: 5,       // Goerli's id
      gas: 5500000,        // default is 6721975
      confirmations: 2,    // # of confirmations to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      // version: "0.7.5",      // Fetch exact version from solc-bin (default: truffle's version)
      version: "pragma",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      //  evmVersion: "byzantium"
      }
    }
  },
};
