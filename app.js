var express = require("express");
var app = express();

const path = require("path");
const mysql = require("mysql");
var bodyParser = require("body-parser");
var apiRoutes = require('./routes/getAPI');
const multer = require('multer');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var csv = require('csvtojson');
var cors = require('cors');
const directoryExists = require('directory-exists');
const fs = require('fs');
var mkdirp = require('mkdirp');
// garage.js
const mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://127.0.0.1');

/**
 * The state of the garage, defaults to closed
 * Possible states : closed, opening, open, closing
 */
var state = 'closed';

//create db connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bacteriadb'
});

//connect
db.connect((err) => {
    if(err)
    {
        throw err;
    }
    console.log("mySQL connected");
});




//load view engine
app.set('views', path.join(__dirname,'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization,X-Requested-With,Content-Type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use(bodyParser.urlencoded({extended : true}));

app.use(bodyParser.json());

//use session
app.use(session({
    secret: 'keyboard cat',
    resave:true,
    saveUninitialized:true,
    cookie:{maxAge:60000}
}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
});

app.use(expressValidator({
    errorFormatter: function(param,msg,value) {
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg: msg,
            value : value
        };
    }
}));


//set public folder
app.use(express.static(path.join(__dirname, 'public')));



//use api routes
app.use('/',apiRoutes);

app.get('/', function(req,res){
    res.render('index');
});

//multer storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
          mkdirp('C:/xampp/htdocs/csvfiles/' + req.headers.path, function (err) {
            if (err){
              console.error(err);
            } 
            else 
            {
              console.log('success!');
            }
        });
      cb(null, 'C:/xampp/htdocs/csvfiles/' + req.headers.path + '/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname+ '-' + Date.now() + path.extname(file.originalname));
    }
  })
  
var upload = multer({ storage: storage,
                      fileFilter:function(req,file,cb){
                        //checkFileType(file,cb);
                        if (!file.originalname.match(/\.(csv)$/)) {
                            return cb(new Error('Only csv files are allowed!'));
                        }
                        cb(null, true);
                      } 
                    }).single('csvFile');



app.post('/upload', function(req,res) {
   
    upload(req,res, function(err){
        if(err)
        {
            //error occurs
            console.log(err);
        }
        else
        {
            if(req.file == undefined){
                
                console.log("no file selected!");
                res.end('no file selected');
            }
            else{
    
                console.log(req.headers.path);
                req.flash('success', 'Successfully uploaded.');
                res.locals.message = req.flash();   
                directoryExists('C:/xampp/htdocs/csvfiles/' + req.headers.path, (error, result) => {
                  console.log(req.body);
                  console.log(result); // result is a boolean
                  if(result == true){
                    res.send('http://localhost/csvfiles/'+ req.headers.path+ '/' +req.file.filename);
                  }
                  else
                  {
                        mkdirp('C:/xampp/htdocs/csvfiles/' + req.headers.path, function (err) {
                          if (err){
                            console.error(err);
                          } 
                          else 
                          {
                            console.log('pow!');
                            res.send('http://localhost/csvfiles/'+ req.headers.path+ '/' +req.file.filename);
                          }
                      });
                  }
                });
                
            }
        }
        
    });

});









app.listen(8081, function(){
    console.log("server started on port 8081");
});