require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();
const path = require('path')
//const errorPage = require('./404.html');

const { init, getAdvs, getAdv, deleteAdv, addAdv, updateAdv } = require('./db');

//autorisation
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

function isVerifiedToken(token){
    if (!token.includes(':')){
        return false;
    };
    const [login, password] = token.split(':');
    return users.some((user) => user.login === login && user.password === password)
};

const authMiddleware = (req, res, next) => {
    const token = req.get("authorization");
    if (isVerifiedToken(token)){
        next();
    } else {
        res.status(401);
        res.send("bad token");
    };
};

app.use(express.json());

init().then(() => {
    app.get('/advs', async (req, res) => {
        const advs = await getAdvs();
        res.send(advs);
    });

    app.get('/advs/:id', async (req, res) => {
        const { id } = req.params;
        const adv = await getAdv(id);

        if (adv) {
            res.send(adv);
        };

        res.statusCode = status.NOT_FOUND;
        res.send();
    });

    app.post('/advs', async (req, res) => {
        const newAdv = req.body;
        
        // warto dodać sprawdzenie czy newAdv posiada odpowiednie właściwości, gdy nie to zwracać kod 400 bez dodawania do bazy

        const result = await addAdv(newAdv);
      
        if (result.insertedCount === 1) {
            res.statusCode = status.CREATED;
        } else {
            res.statusCode = status.INTERNAL_SERVER_ERROR;
        };

        res.send();
    });
    
    app.use(authMiddleware);

    app.patch('/advs/:id', async (req, res) => {
        const { id } = req.params;
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

    app.delete('/advs/:id', async (req, res) => {
        const { id } = req.params;
        const result = await deleteAdv(id);

        if (result.deletedCount == 1){
            res.statusCode = status.NO_CONTENT;
        } else {
            res.statusCode = status.NOT_FOUND;
        };

        res.send();
    });

})
.then(()=>{
    app.get('/heartbeat', (req, res) => {
        res.send(new Date());
    });
})
.finally(() => {
        //catch not exists endpoint will be Error Page
    app.use((req, res)=>{
        const filePath = path.join(__dirname, "./404.html");
        res.sendFile(filePath);
    });
    
    app.listen(process.env.PORT, () => console.log('Advertise server started at port:' + process.env.PORT));
});
