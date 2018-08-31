var express = require('express');
var router = express.Router();

/*
var Conn = require('tedious');

var config = {
    userName: 'FTMUser',
    password: 'FTMUser',
    server: 'W2K12XPOC',
    
    options: {
        encrypt: false,
        database: 'FTMetrics2'
    }
};

var conn = new Conn.Connection(config);
conn.on('connect', function(err) {
    if(err){
        res.send(err);
    }else{
        console.log("Connected"); 
    }
});
*/
/* POST users listing. */
router.post('/', function(req, res) {

    var user = req.body.user;
    var passwd = req.body.passwd;

    if( user == "pepito" && passwd == "fuentes"){
        res.redirect("/form");   
    }else{
        res.redirect('/');
    }
});

/*
router.get('/', function(req,res){
    
    var conn = new Conn.Connection(config);
    var request = new Conn.Request("SELECT * FROM FTMetrics2.dbo.RptReportInventory;", function(err) {  
        if (err) {  
            console.log(err);}  
        });  
    conn.on('connect', function(err) {
        if(err){
            res.send(err);
        }else{ 
            request.on('row', function(columns) {    
                var val = columns[0].value; 
                res.send(val);     
            });
            conn.execSql(request);
        }
    });
});
*/

module.exports = router;
