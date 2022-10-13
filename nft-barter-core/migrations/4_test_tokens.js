const Atoms = artifacts.require("Atoms")
const Neutrons = artifacts.require("Neutrons")

const { setConfig } = require('./config.js')

module.exports = async function (deployer, network) {
  await deployer.deploy(Atoms)
  await deployer.deploy(Neutrons)

  // if (network !== 'development'){
    setConfig('deployed.' + network + '.Atoms', Atoms.address)
    setConfig('deployed.' + network + '.Neutrons', Neutrons.address)
  // }
};