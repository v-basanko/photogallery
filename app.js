const express = require('express');
const http = require('http');
const path = require('path');
const url = require('url');
const config = require('./config');
const hbs = require('hbs');
const connectDB = require('./db');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const upload = require('./modules/upload');

app.set('port', config.get('port'));
app.set('views', __dirname+'/templates');
hbs.registerPartials(__dirname+'/templates/partials');
app.set('view engine', 'hbs');

app.use(bodyParser()); 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(upload());

const gallery = require('./routes/gallery')(app, express);

app.use('/', gallery);

app.use((error, request, response, next)=>{
    response.send(500);
});

http.createServer(app)
.listen(config.get('port'), config.get('host'), ()=>{
        console.log('Server running and listening port '+config.get('port'));
});