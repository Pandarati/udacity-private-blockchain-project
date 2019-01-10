/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.count = 0;
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
        let data = {};

        let genesisBlock = new Block.Block('this is the genesis block.');
        this.addBlock(genesisBlock);
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
        this.bd.getLevelDBData(height).then(block => {
            return new Promise(function(resolve, reject) {
                resolve(block.height);
            });
        }).catch(error => {
            return new Promise(function(resolve, reject) {
                reject(error);
            });
        });
    }

    // Add new block
    addBlock(block) {
        // 1. link between the previous and the current block.
        // 2. use block height as a key when getting the previous block from levelDB.
        // 3. send a new block to the persistence layer...
        let self = this;
        block.timeStamp = new Date().getTime().toString().slice(0,-3);
        block.height = this.count;

        return new Promise(function(resolve, reject) {
            if (self._isGenesisBlockToBeAdded()) {
                block.hash = SHA256(JSON.stringify(block)).toString();
                self.bd.addLevelDBData(block.height, block).then(() => {
                    self.count++;
                    resolve(block);
                }).catch(error => {
                    console.log("failed to add to db.");
                    reject(error);
                })
            } else {
                // we need to link between two adjacent blocks.
                self._getPreviousBlock().then(previousBlock => {
                    block.previousHash = previousBlock.hash;
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    return self.bd.addLevelDBData(block.height, block);
                }).then(() => {
                    self.count++;
                    resolve(block);
                }).catch(error => {
                    console.log("fatal : cannot find the previous block.");
                    // TODO how to exit a JavaScript Program?
                    reject(error);
                });

            }
        });
    }

    _isGenesisBlockToBeAdded() {
        return this.count == 0;
    }

    _getPreviousBlock() {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.bd.getLevelDBData(self.count - 1).then(previousBlock => {
                resolve(previousBlock);
            }).catch(error => {
                if (error.notFound) {
                    console.log('not found!');
                }
                reject(error);
            })
        });

        // return this.getBlock(this.count - 1);
    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
        let self = this;
        return new Promise(function(resolve, reject) {
            self.bd.getLevelDBData(height).then(block => {
                resolve(block);
            }).catch(error => {
                if (error.notFound) {
                    console.log('not found!');
                }
                reject(error);
            })
        });
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
        return this.getBlock(height).then(block => {
            var persistentBlockHash = block.hash;
            block.hash = '';
            return persistentBlockHash == SHA256(JSON.stringify(block)).toString();
        });
    }

    // Validate Blockchain
    validateChain() {
        // Add your code here
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

//(function dbTest () {
//    let levelSandbox = new LevelSandbox.LevelSandbox();
//    levelSandbox.getLevelDBData(1).then(value => {
//        console.log('hello world wha is your ? ' + value);
//    });
//
//})();

module.exports.Blockchain = Blockchain;
