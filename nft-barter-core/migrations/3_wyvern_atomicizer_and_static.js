const WyvernAtomicizer = artifacts.require("WyvernAtomicizer")
const WyvernStatic = artifacts.require("WyvernStatic")

const { setConfig } = require('./config.js')

module.exports = async function (deployer, network) {
  await deployer.deploy(WyvernAtomicizer)
  await deployer.deploy(WyvernStatic, WyvernAtomicizer.address)

  // if (network !== 'development'){
    setConfig('deployed.' + network + '.WyvernAtomicizer', WyvernAtomicizer.address)
    setConfig('deployed.' + network + '.WyvernStatic', WyvernStatic.address)
  // }
};