require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();
const path = require('path');
const fs = require('fs');
const { init, getAdvs, getAdv, findAdvs, deleteAdv, addAdv, updateAdv } = require('./db');

const isDebug  = process.argv[2];     //read parameter from CLI

//autorisation data
const users = [{
    login: 'jan',
    password: 'alamakota',
    name: 'Jan',
}, {
    login: 'adam',
    password: 'cukierki',
    name: 'Adam',
}, {
    login: 'ewa',
    password: 'jablko',
    name: 'Ewa',
}, {
    login: 'Pinio',
    password: 'jablko',
    name: 'Piotr',
}];

function getUser(login, password){
    return users.find(u => u.login === login && u.password === password);
};

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    let badToken = false;
    if (token && token.includes(":")){
        const [login, password] = token.split(':');
        const user = getUser(login, password);
        if (user){
            res.userLogin = login;
            next();
        }else{
            badToken=true;    
        };
    }else{
        badToken=true;
    };
    if(badToken){
        res.status(401);
        res.send("Bad token.");
    };
};

const readDocByIdMiddleware = async(req, res, next) => {
    const id = req.query.id;
    const validationRegex = new RegExp("^[0-9a-fA-F]{24}$");
    if(validationRegex.test(id)){                                               //is id format ok? (must be a string of 24 hex characters)
        try { 
            const adv = await getAdv(id);                                       //document(id) exist in database?
            if(adv){
                if(adv.author===res.userLogin){                                 //logged user === author?
                    next();
                }else{
                    res.statusCode = 401;
                    res.send('The request requires author authentication.');    //logged user has no permition to do that operation
                };
            }else{
                res.statusCode = status.NOT_FOUND;
                res.send('Record does not exist.');   
            };
        } catch (err) {
            console.log("Server " + err);
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Server " + err);      
        }; 
    }else{
        res.statusCode = 411;
        res.send('"id" passed in must be a string of 24 hex characters.'); 
    };
};

app.use(express.json());

init().then(() => {

//node app2 debug -> save time/method/path to a file
    app.use('*', async (req, res, next) => {
        if(isDebug==='debug'){
            const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
            //save to a debug file
            const lineToAppend = "Timestamp: " + new Date().toLocaleString() + ", method: " + req.method + ", address: " + url;
            console.log(lineToAppend);
            try {
                const result = await fs.promises.appendFile('debug.txt', lineToAppend + "\n", {});                                                        //async write data in text to file
            } catch (err) {
                console.error(`An error occurred while trying to write to the output file: ${err.message}`);
                res.statusCode = status.INTERNAL_SERVER_ERROR;
                res.send("Server " + err);   
            };
        };
        next();
    });

//read heartbeat
    app.get('/heartbeat', (req, res, next) => {
        try {       
            res.send(new Date());
        } catch (err) {
            console.log("Server " + err);
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Server " + err);      
        };      
    });

//read all advert's
    app.get('/advs', async (req, res, next) => {
        try {
            const advs = await getAdvs();
            res.send(advs);
        } catch (err) {
            console.log("Server " + err);
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Server " + err);      
        };
    });

//read one adv by id passed as param    
    app.get('/adv', async (req, res, next) => {
        //const { id } = req.params;
        //id must have 24 char hex!!!
        const validationRegex = new RegExp("^[0-9a-fA-F]{24}$");
        const id = req.query.id;

        try {
            if(validationRegex.test(id)){   
            //    if((id)){  //for test error handling only
                const adv = await getAdv(id);
                if(adv){
                    res.send(adv);
                }else{
                    res.statusCode = status.NOT_FOUND;
                    res.send('Record does not exist.');   
                };
            }else{
                res.statusCode = 411;
                res.send('"id" passed in must be a string of 24 hex characters.'); 
            };
        } catch (err) {
            console.log("Server " + err);
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Server " + err);      
            //next();
        };
    });

//find adv's - parameters from body - in text fields finds words
    app.get('/findadvs', async (req, res, next) => {
        let newConditions = req.body;

        if(newConditions.title) newConditions.title =  {$regex:  ".*" + newConditions.title + ".*"};
        if(newConditions.description) newConditions.description =  {$regex:  ".*" + newConditions.description + ".*"};
        if(newConditions.author) newConditions.author =  {$regex:  ".*" + newConditions.author + ".*"};
        if(newConditions.category) newConditions.category =  {$regex:  ".*" + newConditions.category + ".*"};
      //  if(!newConditions.createdTime.$lt) newConditions.createdTime.$lt = '2099-01-01';
      //  if(!newConditions.createdTime.$gt) newConditions.createdTime.$gt = '1970-01-01';
       // if(newConditions.createdTime) newConditions.createdTime = {$gt: new Date(newConditions.createdTime.$gt), $lt: new Date(newConditions.createdTime.$lt)};
        
        try {        
            const result = await findAdvs(newConditions);   //return object, if there no records found - keys.length=0
            if(Object.keys(result).length){   
                res.send(result);
            }else{
                res.statusCode = status.NOT_FOUND;
                res.send('Record does not exist.');  
            };
        } catch (err) {
            console.log("Server " + err);
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Server " + err);      
        };
    });

//adding new adv
    app.post('/adv', async (req, res, next) => {
        const newAdv = req.body;
        const testArray=[
            'id',
            'title',
            'description',
            'author',
            'category',
            'price',
            'new',
            'aproved',
            'published',
            'inactive'
        ];
        // warto dodać sprawdzenie czy newAdv posiada odpowiednie właściwości, gdy nie to zwracać kod 400 bez dodawania do bazy
        let countProp = 0;
        for (let prop in testArray){
            if(newAdv.hasOwnProperty(testArray[prop])) countProp++;
        };
        if(countProp!==testArray.length){
            res.statusCode = 400;
            res.send();
        };
        
        try { 
            const result = await addAdv(newAdv);
            if (result.insertedCount === 1) {
                res.statusCode = status.CREATED;
            } else {
                res.statusCode = status.INTERNAL_SERVER_ERROR;
            };
            res.send();
        } catch (err) {
            console.log("Server " + err);
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Server " + err);      
        };
    });

//not found endpoint unauthorized handler
    app.get('*', (req, res, next)=>{
        const token = req.headers.authorization;
        if (token){
            next();
        }else{
            const filePath = path.join(__dirname, "./404.jpg");
            res.statusCode = status.NOT_FOUND;
            res.sendFile(filePath);
        };
    });  

//authorisation middelware
    app.use(authMiddleware);

    app.use(readDocByIdMiddleware);

//edit adv - id from param, data to change from body
    app.patch('/adv', async (req, res, next) => {
        const id = req.query.id;
        const modifiedAdv = req.body;
        delete modifiedAdv._id;                                             //remove _id from data to change!!!
            try { 
                if (modifiedAdv == null) {
                    res.statusCode = status.BAD_REQUEST;                    //no body/data to update
                } else {
                    const result = await updateAdv(id, modifiedAdv);
                    if (result.modifiedCount === 1) {
                        res.statusCode = status.NO_CONTENT;                 //update done!
                    } else if (result.matchedCount === 1) {
                        res.statusCode = status.CONFLICT;                   //no update is neded
                    } else {
                        res.statusCode = status.NOT_FOUND;
                    };
                };
                res.send();
            } catch (err) {
                console.log("Server " + err);
                res.statusCode = status.INTERNAL_SERVER_ERROR;
                res.send("Server " + err);      
            };    
    });

//delete adv - id from param
    app.delete('/adv', async (req, res, next) => {
        const id = req.query.id;
        try { 
            const result = await deleteAdv(id, res.userLogin);          //delete IT!
            res.statusCode = status.NO_CONTENT;
            res.send();
        } catch (err) {
            console.log("Server " + err);
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Server " + err);      
        };    
    });

//not found endpoint Authorized handler    
    app.get('*', (req, res, next)=>{
        const filePath = path.join(__dirname, "./404.jpg");
        res.statusCode = status.NOT_FOUND;
        res.sendFile(filePath);
    }); 
    
})
.finally(() => {
    app.listen(process.env.PORT, () => console.log('Advertise server started at port:' + process.env.PORT));
});