var express = require('express');
var router = express.Router();
var Conn = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../models/database').config;

function conexion(conn) {
    conn.on('connect', function(err) {
        if(err){
            console.log(err)
        }else{
            console.log("Connected"); 
        }
    });
}

var conn = new Conn(config());
try {
    conexion(conn);
} catch (ConnectionError) {
    conexion(conn);
}


/* POST users listing. */
router.post('/', function(req, res) {

    var user = req.body.user;
    var passwd = req.body.passwd;
    var sql = 'SELECT usuario, clave from Huacho.dbo.Users';
    var result = [];

    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        for (let i = 0; i < result.length; i++) {
            var valor = result[i];
            if( user == valor.usuario && passwd == valor.clave){
                console.log("Acceso concedido");
                var a = true;
            }
        }
        if (a) {
            res.redirect("/form");
        }else{
            res.redirect("/");
        }
    });
    request.on("row", function (columns) { 
        var item = {}; 
        columns.forEach(function (column) { 
            item[column.metadata.colName] = column.value; 
        }); 
        result.push(item);
    });

    conn.execSql(request);
});


router.get('/', function(req,res){
    res.redirect("/");
});

module.exports = router;