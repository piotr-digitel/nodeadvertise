require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();
const path = require('path')
//const errorPage = require('./404.html');

const { init, getAdvs, getAdv, findAdvs, deleteAdv, addAdv, updateAdv } = require('./db');

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
    password: 'jabłko',
    name: 'Ewa',
}];

function getUser(login, password){
    return users.find(u => u.login === login && u.password === password);
}

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (token && token.includes(":")){
        const [login, password] = token.split(':');
        const user = getUser(login, password);
        if (user != null){
            res.userName = user.name;
            next();
        };
    } else {
        res.status(401);
        res.send("bad token");
    };
};

app.use(express.json());

init().then(() => {

    app.use('*', (req, res, next)=>{
        const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        //tu zrobić zapis do pliku
        console.log("Timestamp: " + new Date().toLocaleString() + ", method: " + req.method + ", address: " + url);  //req.originalUrl);
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
        const validationRegex = new RegExp("^[0-9a-fA-F]{24}$")
        const id = req.query.id;

        try {
            if(validationRegex.test(id)){   
            //    if((id)){  //for test error handling only
                const adv = await getAdv(id);
                if(adv){
                    res.send(adv);
                }else{
                    res.statusCode = status.NOT_FOUND;
                    res.send('Record does not exists.');   
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
        //console.log(newConditions);

        //const test= { "title": { $regex: "Title +[a-zA-Z]" } };
        //const test1= {"title": {'$regex' : '.*' + 'Four' + '.*'}};
        //console.log(test1);

        try {        
            const result = await findAdvs(newConditions);   //return object, if there no records found - keys.length=0
            if(Object.keys(result).length){   
                res.send(result);
            }else{
                res.statusCode = status.NOT_FOUND;
                res.send('Record not exist.');  
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

        console.table(newAdv);
        
        // warto dodać sprawdzenie czy newAdv posiada odpowiednie właściwości, gdy nie to zwracać kod 400 bez dodawania do bazy
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

//edit adv - id from param, data to change from body
    app.patch('/adv', async (req, res, next) => {
        //const { id } = req.params;
        //id musi mieć 24 znaki hex!!!
        const id = req.query.id;

        const modifiedAdv = req.body;

        if (modifiedAdv == null || modifiedAdv.isCompleted == null) {
            res.statusCode = status.BAD_REQUEST;
        } else {
            const result = await updateAdv(id, modifiedAdv.isCompleted);

            if (result.modifiedCount === 1) {
                res.statusCode = status.NO_CONTENT;
            } else if (result.matchedCount === 1) {
                // sytuacja gdy znaleźliśmy taki obiekt w bazie ale nie wykonaliśmy aktualizacji bo nie wymaga zmian
                // można zwrócić 204 - obiekt ma takie wartości jak chcieliśmy
                // można zwrócić 409 - nie wykonano operacji bo obiekt nie wymaga zmian
                // w dokumentacji API należałoby opisać co dokładnie oznaczają statusy błędów w tej operacji
                res.statusCode = status.CONFLICT;
            } else {
                res.statusCode = status.NOT_FOUND;
            };
        };

        res.send();
    });

//delete adv - id from param
    app.delete('/adv', async (req, res, next) => {
        //id musi mieć 24 znaki hex!!!
        const id = req.query.id;
        //const author = req.query.author;
        let [author, password] = req.headers.authorization.split(':');

        //console.log('deleted id: ' + id);
        //const { id } = req.params;

        author = "Pinio";

        try { 
            const result = await deleteAdv(id, author);

            console.table(result)

            if (result.deletedCount == 1){
                res.statusCode = status.NO_CONTENT;
            } else {
                res.statusCode = status.NOT_FOUND;
            };
            res.send(author);
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