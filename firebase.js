const Firebase = require('firebase');
const config = require('./config.json');

Firebase.initializeApp(config.firebase);
const db = Firebase.database().ref('blocks');

db.remove(); // WARNING – UNCOMMENT ONLY IF YOU NEED TO DELETE THE DATABASE

////////////////

function getLastBlock(){
    return new Promise( resolve => {
        db.limitToLast(1).once('value')
        .then(snap => {
            const result = snap.val()
            try{
                const singleObject = result[Object.keys(result)[0]]
                resolve(singleObject)
            }
            catch(error){
                console.log(error)
                resolve(null)
            }
            
            
        });
    })
}


function addBlock(time, blockObject){
    db.child(time).set(
        blockObject
    );
}


module.exports = {
    getLastBlock,
    addBlock
};