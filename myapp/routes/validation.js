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
conexion(conn);


/* POST users listing. */
router.post('/', function(req, res) {

    var user = req.body.user;
    var passwd = req.body.passwd;
    var sql = 'SELECT usuario, clave from unjfsc.dbo.usuarios';
    var result = [];

    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        for (let i = 0; i < result.length; i++) {
            var valor = result[i];
            if( user == valor.usuario && passwd == valor.clave){
                req.session.user = {user: user, password: passwd};
                console.log("Acceso concedido");
            }
        }
        if(!req.session.user){
            console.log(req.session.user);
            res.redirect("/");
        } else {
            res.locals = { user: req.session.user};
            res.redirect('/inicio');
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

router.post("/new-user", function (res,req) {
    var new_user = {
                    "tipo_documento" : req.body.tipo_documento,
                    "documento_identidad" : req.body.documento_identidad,
                    "nombres" : req.body.nombres,
                    "apellido_paterno" : req.body.apellido_paterno,
                    "apellido_materno" : req.body.apellido_materno,
                    "genero" : req.body.genero,
                    "pais" : req.body.pais,
                    "departamento" : req.body.departamento,
                    "provincia" : req.body.provincia,
                    "distrito" : req.body.distrito,
                    "direccion" : req.body.direccion,
                    "fecha_nacimiento" : req.body.fecha_nacimiento,
                    "telefono_movil" : req.body.telefono_movil,
                    "telefono_fijo" : req.body.telefono_fijo,
                    "email" : req.body.email,
                    "email2" : req.body.email2,
                    "docente" : req.body.docente,
                    "usuario" : req.body.usuario,
                    "clave" : req.body.clave,
                    "confirmarClave" : req.body.confirmarClave,
                }
    if(new_user.clave == new_user.confirmarClave){
        var sql = "INSERT INTO [unjfsc].[dbo].[usuario] ([tipo_documento], [documento_identidad], [nombres], [apellido_paterno], [apellido_materno], [genero], [pais], [departamento], [provincia], [distrito], [direccion], [fecha_nacimiento], [telefono_movil], [telefono_fijo], [email], [email2], [docente], [usuario], [clave])" +
        "VALUES (" + req.body.tipo_documento + ", " + new_user.documento_identidad + ", " + new_user.nombres + ", " + new_user.apellido_paterno + ", " + new_user.apellido_materno + ", " + new_user.genero + ", " + new_user.pais + ", " + new_user.departamento + ", " + new_user.provincia + ", " + new_user.distrito + ", " + new_user.direccion + ", " + new_user.fecha_nacimiento + ", " + new_user.telefono_movil + ", " + new_user.telefono_fijo + ", " + new_user.email + ", " + new_user.email2 + ", " + new_user.docente + ", " + new_user.usuario + ", " + new_user.clave+ ")";
    }else{
        res.redirect("/");
    }
});



module.exports = router;