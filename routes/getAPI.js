var express = require('express');
var router = express.Router();
const mysql = require("mysql");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
var cors = require('cors');
const directoryExists = require('directory-exists');
const mkdirp = require('mkdirp');
var glob = require('glob');
var bodyParser = require('body-parser');
var PDFDocument = require('pdfkit');
var {Base64Encode} = require('base64-stream');
var pdfTable = require('voilab-pdf-table');

router.use(bodyParser.json({extended: true}));
router.use(bodyParser.urlencoded({extended: true}));


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

function read(req, res) {

    reader.on('data', function (chunk) {
        response += chunk;
    });
    reader.on('end', function () {
        console.log(response);
    })
    reader.on('error', function (err) {
        console.log(err.stack);
    });

}

router.post('/api/returnFileDir', function(req,res){
    
    req.body = Object.keys(req.body)[0];
    
    directoryExists('C:/xampp/htdocs/csvfiles/' + req.body, (error, result) => {
        console.log(req.body);
        console.log(result); // result is a boolean
        if(result == true){
            res.send(result);
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
                  res.send(result);
                }
            });
        }

      });
});


router.get('/api/returnCSV', function(req,res){

    res.sendFile( 'Bact_int_pvals.csv', {'root': 'public/csvfiles'});

});

router.post('/api/selectedDir', function(req,res){

    var resJson = res;
    var reqDir = req;
    const folderNames = [];

    console.log(req.body.locality);

    var getDirectories = function (src, callback) {
        glob(src + '/*', callback);
      };

      getDirectories('C:/xampp/htdocs/csvfiles/' + req.body.locality, function (err, res) {
        if (err) {
          console.log('Error', err);
        } else {
          
          res.forEach(function(a){
              
              a = a.toString().replace('C:/xampp/htdocs/csvfiles/' + req.body.locality, '');
              folderNames.push(a);

          });
          resJson.send(folderNames);   
          console.log(folderNames);     
        }
      });

});

router.get('/api/getAllDir', function(req,res){
        var resJson = res;
        var reqDir = req;
        const folderNames = [];

        

        var getDirectories = function (src, callback) {
            glob(src + '/*', callback);
          };
          
      getDirectories('C:/xampp/htdocs/csvfiles/', function (err, res) {
        if (err) {
          console.log('Error', err);
        } else {
          
          res.forEach(function(a){
              
              a = a.toString().replace('C:/xampp/htdocs/csvfiles/', '');
              folderNames.push(a);

          });
          resJson.send(folderNames);   
          console.log(folderNames);     
        }
      });

});

router.get('/api/getJson', function(req,res){
    db.query('SELECT * from bacteriaTable', function(err, rows, fields) {
        if (!err)
        {
           
          res.json(rows);
          
        }
        else
        {
          console.log('Error while performing Query.');
        }
      });
});

router.post('/api/addRows', function(req,res){
    var string = JSON.stringify(req.body);
    var objVal = JSON.parse(string);
    //res.send(objVal['Therapeutic_Class_effect']);
    var sql = "INSERT INTO bacteriaTable (Expt_details, Therapeutic_Class_effect, Compound_Name, Drug, Conc_of_drug_uM) "+
                "VALUES ( " + objVal['Expt_details'] + ","+ objVal['Therapeutic_Class_effect'] +","+ objVal['Compound_Name'] +","
                +objVal['Drug']+","+ objVal['Conc_of_drug_uM'] + ")";
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        
    });
    res.render('index');
});

//returns the array of Expt Details
router.get('/api/getExpt', function(req,res){
    db.query('SELECT DISTINCT Expt_details from bacteriaTable', function(err,rows,fields){
        if(!err)
        {
            var keyArr = [];
            var keys = Object.keys(rows);
            for(var i = 0; i < keys.length; i++)
            {
                keyArr.push(rows[keys[i]].Expt_details);
            }
            res.send(keyArr);
        }
        else
        {
            console.log('error performing query');
        }
    });
});

//returns compound names according to ExptDetails
router.post('/api/getCompoundNames', function(req,res){
    
    var arrLength = req.body.expt_arr.length;

    db.query('SELECT Compound_Name, Drug from bacteriaTable WHERE Expt_details = "'+req.body.expt_arr+'" ',function (err,rows,fields){
        if(!err)
        {
            
            res.send(JSON.stringify(rows));
        }
        else
        {
            console.log('error performing query : ' + err);
        }
    });
});

router.post('/api/renderPDF', function(req,res){
    
    var finalString = '';

    res.setHeader('Content-type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=file.pdf');
    res.type('application/pdf');

    console.log(req.body);
    console.log(req.body.arrLength);
    
    

    var doc = new PDFDocument();
    var table = new pdfTable(doc, {
        bottomMargin:10
    })

   


    doc.pipe(fs.createWriteStream('output.pdf'));
    var stream = doc.pipe(res);

    

    doc.font('Times-Roman', 50);
    doc.text('Bacteria Analysis Report', {
        width: 800,
        align: 'justify',
        height: 300
    });

    
    table
        // add some plugins (here, a 'fit-to-width' for a column)
        .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
            column: 'description'
        }))
        // set defaults to your columns
        .setColumnsDefaults({
            headerBorder: 'B',
            align: 'right'
        })
        // add table columns
        .addColumns([
            {
                id: 'Compound_Name',
                header: 'Compound Name',
                align: 'left',
                width: 350
            },
            {
                id: 'Drug',
                header: 'Drug',
                width: 50
            }
        ])
        .onPageAdded(function (tb) {
            tb.addHeader();
        });
        
        

    //PDF Creation logic goes here
    for(var i = 0; i < req.body.arrLength; i++){

        doc.addPage()
        .font('Times-Roman',20)
        .text('Bacteria Image '+ req.body.arrOfSelection[i],{
            width: 300,
            align: 'left'
        });

        doc.image('public/Bacteria Bar Plots/Bacteria_Imaging_0'+req.body.arrOfSelection[i] +'.jpg', -50,100, {
             fit: [700,1500],
             align: 'left'
        });

        
          doc.text('', 20,440)
          .font('Times-Roman', 15)
          .moveDown()
          
          var x =JSON.parse(req.body.arrOfTables[i]);
          // draw content, by passing data to the addBody method
          table.addBody(x.value);
    }

    

    doc.end();

    stream.on('data', function(chunk) {
        finalString += chunk;
    });
    
    stream.on('end', function() {
        // the stream is at its end, so push the resulting base64 string to the response
        res.json(finalString);
    });

    
    
});


module.exports = router;