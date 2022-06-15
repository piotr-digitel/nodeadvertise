require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();

const { init, getAdvs, deleteAll, addAdvs } = require('./mongo');

app.use(express.json());

init().then(() => {

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


//adding new collection of advs
    app.post('/advs', async (req, res, next) => {
        const newCollectionAdv = req.body;
        const result = await addAdvs(newCollectionAdv);
        res.send();
    });

//delete all advs
    app.delete('/advs', async (req, res, next) => {
        const result = await deleteAll();          //delete IT!
        res.statusCode = status.NO_CONTENT;
        res.send();
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