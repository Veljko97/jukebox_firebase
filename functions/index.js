const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.addServer = functions.https.onRequest( async (req, res) => {
    if(req.method !== 'POST'){
        return res.status(405).send(`${req.method} is not allowed. Use POST.`);
    }
    const address = req.body;
    
    const collection = db.collection('servers') 
    if(address.identifier === null){
        const snapshot = await getServer(address.localKey)
        if(snapshot.size !== 0) {
            res.status(400).send(`Local key is taken`)
        }else {
            const writeResult = await collection.add({localKey: address.localKey, location: address.location});
            res.json({identifier: `${writeResult.id}`})
        }
    } else {
        collection.doc(address.identifier).update({location: address.location})
        res.status(200).send()
    }

});


exports.getServerLocation = functions.https.onRequest( async (req, res) => {
    if(req.method !== 'GET'){
        return res.status(405).send(`${req.method} is not allowed. Use GET.`);
    }
    const localKey = req.query.localKey;

    const snapshot = await getServer(localKey)
    if(snapshot.empty) {
        res.status(400).send(`Location dose not exest`)
    }
    
    snapshot.forEach(doc => {
        res.json({location: `${doc.data().location}`})
    })


});


async function getServer(localKey) {

    const collection = db.collection('servers') 
    return await collection.where('localKey', '==', localKey).get()
}