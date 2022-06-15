const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');

const url = process.env.MONGODB_CONNECTION;

const AdvCollectionName = 'advs';  //tu lepiej dać pełną nazwę.

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

const getAdv = (id) => {
    return advsCollection.findOne({ _id: new ObjectId(id) });
}

const findAdvs = (conditions) => {
    return advsCollection.find(conditions).toArray();
}

const deleteAdv = (id, author) => {
    //return advsCollection.deleteOne({ _id: new ObjectId(id) });
    return advsCollection.findOneAndDelete({ _id: new ObjectId(id), author: author });
}

const addAdv = (newAdv) => {
    newAdv.createdTime = new Date();
    return advsCollection.insertOne(newAdv);
}

const updateAdv = (id, collectionToUpdate) => {
    return advsCollection.updateOne(
        { _id: new ObjectId(id)},
        { $set: collectionToUpdate }
    );
}

module.exports = { init, getAdvs, getAdv, findAdvs, deleteAdv, addAdv, updateAdv };