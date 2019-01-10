/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.get(key, function (err, value) {
                if (err) {
                    resolve(err);
                } else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            if (value instanceof Object) {
                value = JSON.stringify(value);
            }
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                } else {
                    resolve();
                }
            })
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let count = 0;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
                .on('data', data => {
                console.log("read data : " + data.value);
                count++;
            }).on('error', err => {
                console.log('Oh my!', err)
                reject(err);
            }).on('close', () => {
                console.log('Stream closed')
            }).on('end', () => {
                console.log('Stream ended')
                resolve(count);
            })
        });
    }
        

}

module.exports.LevelSandbox = LevelSandbox;
