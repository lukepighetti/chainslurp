// i pick things up and put them down
const RpcClient = require('bitcoind-rpc');
const firebase = require('./firebase');
const config = require('./config');

const rpc = new RpcClient(config.daemon);


/////////////////////////

async function slurpBlockchain(start, stop){
  const timer = Date.now()
  const returnObject = {}
  const blockHeight = await getBlockCount()
  if(stop > blockHeight) stop = blockHeight

  const lastStoredBlock = await firebase.getLastBlock()
  if(lastStoredBlock && lastStoredBlock.height > start) start = lastStoredBlock.height + 1
  if(start >= stop){
    console.log("error! start is greater than stop... Perhaps we are synced up?")
    return null
  }

  let previousTime = lastStoredBlock ? lastStoredBlock.time: 0;

  for(i=start; i<=stop; i++){
    const blockHash = await getBlockHash(i)
    const blockInfo = await getBlock(blockHash)

    let blockTime = previousTime ? blockInfo.time - previousTime : null

    // todo - make it return an object instead of logging
    // returnObject[blockInfo.time] = { 
    //   height: blockInfo.height,
    //   difficulty: blockInfo.difficulty,
    //   time: blockInfo.time,
    //   blocktime: blockTime
    // }

    previousTime = blockInfo.time
    // save to firebase
    firebase.addBlock(blockInfo.time, {
      height: blockInfo.height,
      difficulty: blockInfo.difficulty,
      time: blockInfo.time,
      blocktime: blockTime,
      retarget: 2016 - (blockInfo.height % 2016),
      hashrate: blockInfo.height ? blockInfo.difficulty * Math.pow(2,32) / blockTime : null
    })
    console.log(`stored block ${blockInfo.height} with time ${blockInfo.time}`)
  }

  console.log(`collected ${stop-start+1} blocks in ${((Date.now()-timer)/1000).toFixed(1)} seconds`)
}


/////////////////////////
/////////////////////////

function getBlock(blockHash){
  return new Promise( resolve => {

    rpc.getBlock(blockHash, (error, response) => {
      if(error) console.log(error)
      if(response) resolve(response.result)

    })

  })
}


function getBlockHash(id){
  return new Promise( resolve => {

    rpc.getBlockHash(id, (error, response) => {
      if(error) console.log(error)
      if(response) resolve(response.result)
    })

  })
}


function getBlockCount(){
  return new Promise( resolve => {

    rpc.getBlockCount((error,response) => {
      if(error) console.log(error)
      if(response) resolve(response.result)
    })

  })
}

module.exports = {
  slurpBlockchain,
  getBlockCount
};
