const Migrations = artifacts.require("Migrations");
const { setConfig } = require('./config.js');

module.exports = async function (deployer, network) {
  await deployer.deploy(Migrations);
  // if (network !== 'development') {
    setConfig('deployed.' + network + '.Migrations', Migrations.address);
  // }
};
