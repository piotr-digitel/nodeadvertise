const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');

const url = process.env.MONGODB_CONNECTION;

const AdvCollectionName = 'advs';

let db;
let advsCollection;

const init = () =>
    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
        .then((client) => {
            db = client.db(process.env.MONGODB_DBNAME);
            advsCollection = db.collection(AdvCollectionName);
        })
        .catch(error => console.log(error));

const getAdvs = () => {
    return advsCollection.find().toArray();
}

const deleteAll = () => {
    return advsCollection.deleteMany();               //deleta all documents
}

const addAdvs = (newCollection) => {           
    return advsCollection.insertMany(newCollection,   //insert many documents to test db
        {
            ordered: true
        });
}

module.exports = { init, getAdvs, deleteAll, addAdvs };