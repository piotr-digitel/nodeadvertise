require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();
const path = require('path')
//const errorPage = require('./404.html');

const { init, getAdvs, getAdv, deleteAdv, addAdv, updateAdv } = require('./db');

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
        console.log("Time: " + new Date() + " - method: " + req.method + "  - address: " + url);  //req.originalUrl);
        next();
    }); 

    app.get('/heartbeat', (req, res) => {
        res.send(new Date());
    });

    app.get('/advs', async (req, res) => {
        const advs = await getAdvs();
        res.send(advs);
    });

    app.get('/adv', async (req, res) => {
        //const { id } = req.params;
        //id musi mieć 24 znaki!!!
        const id = req.query.id.toString();

        //id = "6298eabd50ca9725d4f1ceee";

        console.log("get adv id: "+ id);
        
        
        const adv = await getAdv(id);

        if (adv) {
            res.send(adv);
        }else{
            res.statusCode = status.NOT_FOUND;
            res.send('Record not exist.');   
        };
    });

    app.post('/adv', async (req, res) => {
        const newAdv = req.body;

        //console.table(newAdv);
        
        // warto dodać sprawdzenie czy newAdv posiada odpowiednie właściwości, gdy nie to zwracać kod 400 bez dodawania do bazy

        const result = await addAdv(newAdv);
      
        if (result.insertedCount === 1) {
            res.statusCode = status.CREATED;
        } else {
            res.statusCode = status.INTERNAL_SERVER_ERROR;
        };

        res.send();
    });


    app.get('*', (req, res, next)=>{
        const token = req.headers.authorization;
        if (token){
            next();
        }else{
          const filePath = path.join(__dirname, "./404.html");
            res.statusCode = status.NOT_FOUND;
            res.sendFile(filePath);
        };
    });  


    app.use(authMiddleware);



    app.patch('/adv', async (req, res) => {
        //const { id } = req.params;
        //id musi mieć 24 znaki!!!
        const id = req.query.id.toString();

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

    app.delete('/adv', async (req, res) => {
        //id musi mieć 24 znaki!!!
        const id = req.query.id.toString();
        console.log('deleted id: ' + id);
        //const { id } = req.params;

        const result = await deleteAdv(id);

        if (result.deletedCount == 1){
            res.statusCode = status.NO_CONTENT;
        } else {
            res.statusCode = status.NOT_FOUND;
        };

        res.send();
    });

    app.get('*', (req, res)=>{
        const filePath = path.join(__dirname, "./404.html");
        res.statusCode = status.NOT_FOUND;
        res.sendFile(filePath);
    });  

})
.finally(() => {
    app.listen(process.env.PORT, () => console.log('Advertise server started at port:' + process.env.PORT));
});