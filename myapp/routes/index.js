var express = require('express');
var router = express.Router();
var Conn = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;  
var config = require('../models/database').config;
var bcrypt = require('bcrypt');

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


/********************************************             INDEX              *************************************************/
router.get('/', function(req, res, next) {
    req.session.destroy( function (err) {
      if(err){
        console.log(err);
      }else{
        console.log("sesion destruida");
      }
    });
    res.render('index', { title: 'Universidad jfsc' });
  });
  
  router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Registro de usuario' });
  });

  router.get('/visualizar', function(req, res, next) {
    res.send("aqui va el pdf");
  });

/*******************************************************************************************************************************/



/*****************************************             ACTIVE SESSION          *************************************************/
router.get('/inicio' ,function(req, res, next) {
    if(req.session.user){
        res.render('inicio', { 
            title: "Bienvenido | Universidad jfsc", 
            usuario: req.session.user 
        });
    } else {
        res.redirect("/");
    }
});
  
router.get('/nuevoProyecto' ,function(req, res, next) {
    if(req.session.user){
        res.render('nuevoProyecto', { 
            title: "Nuevo Proyecto", 
            usuario: req.session.user 
        });
    } else {
        res.redirect("/");
    }
  });
  
router.get('/change-password' ,function(req, res, next) {
    if(req.session.user){
        res.render('changePassword', { 
            title: "Cambio de Clave", 
            usuario: req.session.user 
        });
    } else {
        res.redirect("/");
  }
  });
  
router.get('/change-data' ,function(req, res, next) {
    if(req.session.user){
        res.render('changeData', { 
            title: "Cambio de Datos", 
            usuario: req.session.user 
        });
    } else {
        res.redirect("/");
  }
});

router.get('/administrar' ,function(req, res, next) {
if(req.session.user){

var sql = 'SELECT titulo, fecha_creacion from unjfsc.dbo.proyecto_usuario';
var result = [];

var request = new Request(sql, function(err) {
    if (err) {
        console.log(err);
    }
    if(!req.session.user){
        console.log(req.session.user);
        res.redirect("/");
    } else {
        res.render('administrar', { 
            title: "Administrar Proyectos", 
            usuario: req.session.user
        });
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
} else {
    res.redirect("/");
}
});
  
/*******************************************************************************************************************************/


/**********************************************         DATABASE             ***************************************************/


/********************************** INICIO DE SESION*****************/
router.post('/validation', function(req, res) {

    var user = req.body.user;
    var passwd = req.body.passwd;
    var sql = 'SELECT id_usuario, nombres, apellido_paterno, usuario, clave from unjfsc.dbo.usuario';
    var result = [];

    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        for (let i = 0; i < result.length; i++) {
            var valor = result[i];
            if( user == valor.usuario && bcrypt.compareSync(passwd, valor.clave)){
                req.session.user = { nombre: valor.nombres , apellido: valor.apellido_paterno };
                console.log("Acceso concedido");
            }
        }
        if(!req.session.user){
            console.log(req.session.user);
            res.redirect("/");
        } else {
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


/*********************************REGISTRO DE NUEVO USUARIO*****************/
router.post("/validation/new-user", function (req,res) {

    var tipo_documento = req.body.tipo_documento;
    var documento_identidad = req.body.documento_identidad;
    var nombres = req.body.nombres;
    var apellido_paterno = req.body.apellido_paterno;
    var apellido_materno = req.body.apellido_materno;
    var genero = req.body.genero;
    var pais = req.body.pais;
    var departamento = req.body.departamento;
    var provincia = req.body.provincia;
    var distrito = req.body.distrito;
    var direccion = req.body.direccion;
    var fecha_nacimiento = req.body.fecha_nacimiento;
    var telefono_movil = req.body.telefono_movil;
    var telefono_fijo = req.body.telefono_fijo;
    var email = req.body.email;
    var email2 = req.body.email2;
    var docente = req.body.docente;
    var usuario = req.body.email;
    var clave = bcrypt.hashSync(req.body.clave,10);
    
   var sql = "INSERT INTO [unjfsc].[dbo].[usuario] ([tipo_documento], [documento_identidad], [nombres], [apellido_paterno], [apellido_materno], [genero], [pais], [departamento], [provincia], [distrito], [direccion], [fecha_nacimiento], [telefono_movil], [telefono_fijo], [email], [email2], [docente], [usuario], [clave]) OUTPUT INSERTED.id_usuario VALUES ( @tipo_documento, @documento_identidad, @nombres, @apellido_paterno, @apellido_materno, @genero, @pais, @departamento, @provincia, @distrito, @direccion, @fecha_nacimiento, @telefono_movil, @telefono_fijo, @email, @email2, @docente, @usuario, @clave)";
    
    request = new Request(sql, function(err) {  
        if (err) {  
           console.log(err);
        }
        req.session.user = usuario;
        console.log("Acceso concedido");
        if(!req.session.user){
            console.log(req.session.user);
            res.redirect("/");
        } else {
            res.redirect('/inicio');
        }

    });

    request.addParameter("tipo_documento" ,         TYPES.Int           , tipo_documento);
    request.addParameter("documento_identidad" ,    TYPES.Int           , documento_identidad);
    request.addParameter("nombres" ,                TYPES.VarChar       , nombres);
    request.addParameter("apellido_paterno" ,       TYPES.VarChar       , apellido_paterno);
    request.addParameter("apellido_materno" ,       TYPES.VarChar       , apellido_materno);
    request.addParameter("genero" ,                 TYPES.Int           , genero);
    request.addParameter("pais" ,                   TYPES.VarChar       , pais);
    request.addParameter("departamento" ,           TYPES.VarChar       , departamento);
    request.addParameter("provincia" ,              TYPES.VarChar       , provincia);
    request.addParameter("distrito" ,               TYPES.VarChar       , distrito);
    request.addParameter("direccion" ,              TYPES.VarChar       , direccion);
    request.addParameter("fecha_nacimiento" ,       TYPES.Date          , fecha_nacimiento);
    request.addParameter("telefono_movil" ,         TYPES.Int           , telefono_movil);
    request.addParameter("telefono_fijo" ,          TYPES.Int           , telefono_fijo);
    request.addParameter("email" ,                  TYPES.VarChar       , email);
    request.addParameter("email2" ,                 TYPES.VarChar       , email2);
    request.addParameter("docente" ,                TYPES.Int           , docente);
    request.addParameter("usuario" ,                TYPES.VarChar       , usuario);
    request.addParameter("clave" ,                  TYPES.VarChar       , clave);
        
    request.on('row', function(columns) {  
        columns.forEach(function(column) {  
            if (column.value === null) {  
                console.log('NULL');  
            } else {  
                console.log("User id is " + column.value);  
            }  
        });  
    });       
    conn.execSql(request);
});



/********************************** CARGA DEL PROYECTO *****************/
router.post('/validation/cargar-proyecto', function(req, res) {
    res.send(req.body);
    
    var user = req.body.user;
    var passwd = req.body.passwd;
    var sql = 'SELECT id_usuario, nombres, apellido_paterno, usuario, clave from unjfsc.dbo.usuario';
    var result = [];

    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        for (let i = 0; i < result.length; i++) {
            var valor = result[i];
            if( user == valor.usuario && bcrypt.compareSync(passwd, valor.clave)){
                req.session.user = { nombre: valor.nombres , apellido: valor.apellido_paterno };
                console.log("Acceso concedido");
            }
        }
        if(!req.session.user){
            console.log(req.session.user);
            res.redirect("/");
        } else {
            res.redirect('/inicio');
        }
    });

    request.addParameter("tipo_documento" ,         TYPES.Int           , tipo_documento);
    request.addParameter("documento_identidad" ,    TYPES.Int           , documento_identidad);
    request.addParameter("nombres" ,                TYPES.VarChar       , nombres);
    request.addParameter("apellido_paterno" ,       TYPES.VarChar       , apellido_paterno);
    request.addParameter("apellido_materno" ,       TYPES.VarChar       , apellido_materno);
    request.addParameter("genero" ,                 TYPES.Int           , genero);
    request.addParameter("pais" ,                   TYPES.VarChar       , pais);
    request.addParameter("departamento" ,           TYPES.VarChar       , departamento);
    request.addParameter("provincia" ,              TYPES.VarChar       , provincia);
    request.addParameter("distrito" ,               TYPES.VarChar       , distrito);
    request.addParameter("direccion" ,              TYPES.VarChar       , direccion);
    request.addParameter("fecha_nacimiento" ,       TYPES.Date          , fecha_nacimiento);
    request.addParameter("telefono_movil" ,         TYPES.Int           , telefono_movil);
    request.addParameter("telefono_fijo" ,          TYPES.Int           , telefono_fijo);
    request.addParameter("email" ,                  TYPES.VarChar       , email);
    request.addParameter("email2" ,                 TYPES.VarChar       , email2);
    request.addParameter("docente" ,                TYPES.Int           , docente);
    request.addParameter("usuario" ,                TYPES.VarChar       , usuario);
    request.addParameter("clave" ,                  TYPES.VarChar       , clave);
        
    request.on('row', function(columns) {  
        columns.forEach(function(column) {  
            if (column.value === null) {  
                console.log('NULL');  
            } else {  
                console.log("User id is " + column.value);  
            }  
        });  
    });       
    conn.execSql(request);
});




/*******************************************             FILTERING          ****************************************************/


router.get('/validation', function(req,res){
  res.redirect("/");
});
router.get('/validation/cargar-proyecto', function(req,res){
    res.redirect("/");
  });
  router.get('/validation/new-user', function(req,res){
    res.redirect("/");
  });
  router.get('/validation', function(req,res){
    res.redirect("/");
  });


/*******************************************************************************************************************************/



module.exports = router;