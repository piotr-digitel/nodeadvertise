const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');

const url = process.env.MONGODB_CONNECTION;

const TaskCollectionName = 'tasks';

let db;
let tasksCollection;

const init = () =>
    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
        .then((client) => {
            db = client.db(process.env.MONGODB_DBNAME);
            tasksCollection = db.collection(TaskCollectionName);
        })
        .catch(error => console.log(error));

const getTasks = () => {
    return tasksCollection.find().toArray();
}

const getTask = (id) => {
    return tasksCollection.findOne({ _id: new ObjectId(id) });
}

const deleteTask = (id) => {
    return tasksCollection.deleteOne({ _id: new ObjectId(id) });
}

const addTask = (newTask) => {
    newTask.createdTime = new Date();
    return tasksCollection.insertOne(newTask);
}

const updateTask = (id, isCompleted) => {
    return tasksCollection.updateOne(
        { _id: new ObjectId(id)},
        { $set: { "iscompleted": isCompleted } }
    );
}

module.exports = { init, getTasks, getTask, deleteTask, addTask, updateTask };