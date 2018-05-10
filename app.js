const slurpBlockchain = require('./slurp.js').slurpBlockchain;
const getBlockCount = require('./slurp.js').getBlockCount

// setInterval(async function(){

//     slurpBlockchain(0,99999);
// },60)


//setInterval(main,60*1000);

main()

async function main(){
    const startHeight = 0;
    // get block height
    const stopHeight = await getBlockCount()
    // sync firebase to height
    slurpBlockchain(startHeight, stopHeight)
}