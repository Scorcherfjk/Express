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


/********************************************             INDEX              ****************************************************************************/

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

/*******************************************************************************************************************************/

/*****************************************             ACTIVE SESSION          *********************************************************************************/

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

/* CREACION DE UN NUEVO PROYECTO ********************************************************************************************************************** */

router.get('/nuevo' ,function(req, res, next) {
    if(req.session.user){
        res.render('nuevo', { 
            title: "Nuevo", 
            usuario: req.session.user 
        });
    } else {
        res.redirect("/");
  }
  });

/* CAMBIAR LA CLAVE DE ACCESO *************************************************************************************************************************** */

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

router.post('/validation/change-password' ,function(req, res, next) {
    if(req.session.user){

        var sql = `UPDATE [unjfsc].[dbo].[usuario]
                SET [clave] = @clave
                WHERE id_usuario = @id_usuario`;

        var request = new Request(sql, function(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/inicio');
        });

        request.addParameter("id_usuario" ,         TYPES.Int,              req.session.user.id);
        request.addParameter("clave" ,             TYPES.VarChar,          bcrypt.hashSync(req.body.clave,10));

        conn.execSql(request);
    } else {
        res.redirect("/");
    }
});

/* CAMBIAR LOS DATOS PERSONALES  ******************************************************************************************************************* */

router.get('/change-data' ,function(req, res, next) {
    if(req.session.user){
        
        var sql = 'SELECT TOP 1 * from unjfsc.dbo.usuario WHERE id_usuario = @id_usuario';
        var result = {};

        var request = new Request(sql, function(err) {
            if (err) {
                console.log(err);
            }
            if(!req.session.user){
                console.log(req.session.user);
                res.redirect("/");
            } else {
                res.render('changeData', { 
                    title: "Cambio de Datos", 
                    usuario: req.session.user,
                    lista: result
                });
            }
        });

        request.addParameter("id_usuario" ,    TYPES.Int,    req.session.user.id);

        request.on("row", function (columns) { 
            var item = {}; 
            columns.forEach(function (column) { 
                item[column.metadata.colName] = column.value; 
            }); 
            result = item;
        });

        conn.execSql(request);

    } else {
        res.redirect("/");
    }
});

router.post('/validation/change-data' ,function(req, res, next) {
    if(req.session.user){
        

        var sql = `UPDATE [unjfsc].[dbo].[usuario]
            SET [pais] = @pais
                ,[departamento] =  @departamento
                ,[provincia] = @provincia
                ,[distrito] = @distrito
                ,[direccion] =  @direccion
                ,[telefono_movil] = @telefono_movil
                ,[telefono_fijo] =  @telefono_fijo
                ,[email2] =  @email2
                WHERE id_usuario = @id_usuario`;

        var request = new Request(sql, function(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/change-data');
        });

        request.addParameter("id_usuario" ,         TYPES.Int,              req.session.user.id);
        request.addParameter("pais" ,               TYPES.VarChar,          req.body.pais);
        request.addParameter("departamento" ,       TYPES.VarChar,          req.body.departamento);
        request.addParameter("provincia" ,          TYPES.VarChar,          req.body.provincia);
        request.addParameter("distrito" ,           TYPES.VarChar,          req.body.distrito);
        request.addParameter("direccion" ,          TYPES.VarChar,          req.body.direccion);
        request.addParameter("telefono_movil" ,     TYPES.Int,              req.body.telefono_movil);
        request.addParameter("telefono_fijo" ,      TYPES.Int,              req.body.telefono_fijo);
        request.addParameter("email2" ,             TYPES.VarChar,          req.body.email2);

        conn.execSql(request);

    } else {
        res.redirect("/");
    }
});

/* ADMINISTRACION DE LOS PROYECTOS **************************************************************************************************************************** */

router.get('/administrar' ,function(req, res, next) {
    if(req.session.user){

        var sql = 'SELECT id_proyecto, titulo, fecha_creacion from unjfsc.dbo.proyectos WHERE id_usuario = @id_usuario';
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
                    usuario: req.session.user,
                    lista: result
                });
            }
        });

        request.addParameter("id_usuario" ,    TYPES.Int,    req.session.user.id);

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

/* CREACION DE UN NUEVO PROYECTO ********************************************************************************************************************************** */

router.post('/editar-proyecto' ,function(req, res, next) {
    if(req.session.user){
        
        var sql = `SELECT usuario.*, proyectos.*, 
        tabla1.*, tabla2.*, 
        tabla3.*, tabla4.*, tabla5.* from unjfsc.dbo.proyectos 
        INNER JOIN unjfsc.dbo.usuario 
        ON usuario.id_usuario = @id_usuario and proyectos.id_proyecto = @idproyecto
        INNER JOIN unjfsc.dbo.tabla1 ON tabla1.id_proyecto = @idproyecto
        INNER JOIN unjfsc.dbo.tabla2 ON tabla2.id_proyecto = @idproyecto
        INNER JOIN unjfsc.dbo.tabla3 ON tabla3.id_proyecto = @idproyecto
        INNER JOIN unjfsc.dbo.tabla4 ON tabla4.id_proyecto = @idproyecto
        INNER JOIN unjfsc.dbo.tabla5 ON tabla5.id_proyecto = @idproyecto`;
        var result = {};

        var request = new Request(sql, function(err) {
            if (err) {
                console.log(err);
            }
            if(!req.session.user){
                console.log(req.session.user);
                res.redirect("/");
            } else {
                res.render('editarProyecto', { 
                    title: "Editar Proyecto", 
                    usuario: req.session.user,
                    lista: result 
                });
            }
        });

        request.addParameter("id_usuario" ,    TYPES.Int,    req.session.user.id);
        request.addParameter("idproyecto" ,    TYPES.Int,    req.body.idproyecto);

        request.on("row", function (columns) { 
            var item = {}; 
            columns.forEach(function (column) { 
                item[column.metadata.colName] = column.value; 
            }); 
            result = item;
        });

        conn.execSql(request);

    } else {
        res.redirect("/");
    }
});

/******************************************************************************************************************************************************/

/**********************************************         DATABASE             ********************************************************************************/

/* INICIO DE SESION *******************************************************************************************************************************/

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
                req.session.user = { nombre: valor.nombres , apellido: valor.apellido_paterno , id: valor.id_usuario };
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

/* REGISTRO DE NUEVO USUARIO *******************************************************************************************************************************/

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
                console.log("Ha sido creado el usuario nro: " + column.value);  
            }  
        });  
    });       
    conn.execSql(request);
});

/* CARGA DEL PROYECTO NUEVO *******************************************************************************************************************************/

router.post('/validation/nuevo', function(req, res) {

    
    var sql = `
    INSERT INTO [unjfsc].[dbo].[proyectos] ([id_usuario], [titulo]) 
    OUTPUT INSERTED.id_proyecto VALUES ( @id_usuario, @titulo)
    INSERT INTO [unjfsc].[dbo].[tabla1] ([id_proyecto]) VALUES 
    ((SELECT max(id_proyecto) from dbo.proyectos))
    INSERT INTO [unjfsc].[dbo].[tabla2] ([id_proyecto]) VALUES 
    ((SELECT max(id_proyecto) from dbo.proyectos))
    INSERT INTO [unjfsc].[dbo].[tabla3] ([id_proyecto]) VALUES 
    ((SELECT max(id_proyecto) from dbo.proyectos))
    INSERT INTO [unjfsc].[dbo].[tabla4] ([id_proyecto]) VALUES 
    ((SELECT max(id_proyecto) from dbo.proyectos))
    INSERT INTO [unjfsc].[dbo].[tabla5] ([id_proyecto]) VALUES 
    ((SELECT max(id_proyecto) from dbo.proyectos))
    `;

    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/administrar');
    });

    request.addParameter("id_usuario" ,         TYPES.Int             ,req.session.user.id);    
    request.addParameter("titulo" ,             TYPES.Text            ,req.body.titulo);

    request.on('row', function(columns) {
        columns.forEach(function (column) {
            if (column.value === null) {  
                console.log('NULL');  
            } else {  
                console.log("Se ha registrado el proyecto nro: " + column.value);
            }
        });    
    });       
    conn.execSql(request);

});

/* CARGA DEL PROYECTO NUEVO *********************************************************************************************************************/

router.post('/validation/editar-proyecto', function(req, res) {

    var sql = `UPDATE [unjfsc].[dbo].[proyectos] 
    SET 
    [titulo] = @titulo, 
    [palabras_clave] = @palabrasClave,
    [area_innovacion_area] = @area_innovacion_area, [area_innovacion_subarea] = @area_innovacion_subarea, [area_innovacion_tematica] = @area_innovacion_tematica,
    [aplicacion_area] = @aplicacion_area, [aplicacion_subarea] = @aplicacion_subarea,
    [localizacion_departamento] = @localizacion_departamento, [localizacion_provincia] = @localizacion_provincia, 
    [localizacion_distrito] = @localizacion_distrito, [localizacion_ubigeo] = @localizacion_ubigeo,
    [a22_1_1] = @a22_1_1, [a22_2_1] = @a22_2_1, [a22_3_1] = @a22_3_1, [a22_4_1] = @a22_4_1, [a22_5_1] = @a22_5_1,
    [a22_1_2] = @a22_1_2, [a22_2_2] = @a22_2_2, [a22_3_2] = @a22_3_2, [a22_4_2] = @a22_4_2, [a22_5_2] = @a22_5_2,
    [a22_1_3] = @a22_1_3, [a22_2_3] = @a22_2_3, [a22_3_3] = @a22_3_3, [a22_4_3] = @a22_4_3, [a22_5_3] = @a22_5_3,
    [a31_1_1] = @a31_1_1, [a31_2_1] = @a31_2_1,
    [a31_1_2] = @a31_1_2, [a31_2_2] = @a31_2_2,
    [a31_1_3] = @a31_1_3, [a31_2_3] = @a31_2_3,
    [a32_1_1] = @a32_1_1, [a32_2_1] = @a32_2_1,
    [a32_1_2] = @a32_1_2, [a32_2_2] = @a32_2_2,
    [a32_1_3] = @a32_1_3, [a32_2_3] = @a32_2_3,
    [a33_1_1] = @a33_1_1, [a33_2_1] = @a33_2_1,
    [a33_1_2] = @a33_1_2, [a33_2_2] = @a33_2_2,
    [a33_1_3] = @a33_1_3, [a33_2_3] = @a33_2_3,
    [a34_1_1] = @a34_1_1, [a34_2_1] = @a34_2_1, [a34_3_1] = @a34_3_1, [a34_4_1] = @a34_4_1, [a34_5_1] = @a34_5_1,
    [a34_1_2] = @a34_1_2, [a34_2_2] = @a34_2_2, [a34_3_2] = @a34_3_2, [a34_4_2] = @a34_4_2, [a34_5_2] = @a34_5_2,
    [a34_1_3] = @a34_1_3, [a34_2_3] = @a34_2_3, [a34_3_3] = @a34_3_3, [a34_4_3] = @a34_4_3, [a34_5_3] = @a34_5_3,
    [a35_1_1] = @a35_1_1, [a35_2_1] = @a35_2_1, [a35_3_1] = @a35_3_1, [a35_4_1] = @a35_4_1, [a35_5_1] = @a35_5_1, [a35_6_1] = @a35_6_1, [a35_7_1] = @a35_7_1,
    [a35_1_2] = @a35_1_2, [a35_2_2] = @a35_2_2, [a35_3_2] = @a35_3_2, [a35_4_2] = @a35_4_2, [a35_5_2] = @a35_5_2, [a35_6_2] = @a35_6_2, [a35_7_2] = @a35_7_2,
    [a35_1_3] = @a35_1_3, [a35_2_3] = @a35_2_3, [a35_3_3] = @a35_3_3, [a35_4_3] = @a35_4_3, [a35_5_3] = @a35_5_3, [a35_6_3] = @a35_6_3, [a35_7_3] = @a35_7_3,
    [duracion_proyecto] = @duracionDelProyecto, [fecha_estimada_inicio] = @fechaEstimadaDeInicioDelProyecto, 
    [cgp_tipo_documento] = @cgptipoDeDocumento, 
    [cgp_nro_documento] = @cgpnumeroDeDocumento, [cgp_ruc] = @cgpruc, 
    [cgp_nombre] = @cgpnombresYApellidos, [cgp_fecha_nac] = @cgpfechaDeNacimiento, [cgp_sexo] = @cgpsexo, 
    [cgp_email] = @cgpemail, [cgp_telefono] = @cgptelefono, [cgp_celular] = @cgpcelular, 
    [cap_tipo_documento] = @captipoDeDocumento, 
    [cap_nro_documento] = @capnumeroDeDocumento, [cap_ruc] = @capruc, 
    [cap_nombre] = @capnombresYApellidos, [cap_fecha_nac] = @capfechaDeNacimiento, [cap_sexo] = @capsexo, 
    [cap_email] = @capemail, [cap_telefono] = @captelefono, [cap_celular] = @capcelular, 
    [es_tipo] = @estipoDeEntidad,  
    [es_tamano] = @estamañoDeLaEmpresa,  [es_nro_trabajadores] = @esnroDeTrabajadores,  
    [es_ruc] = @esrucRazonSocial,  [es_ciiu] = @esciiu,  [es_direccion] = @esdireccion,  
    [es_fecha_constitucion] = @esfechaDeConstitucion,  [es_inicio_actividades] = @esinicioDeActividades,  
    [es_nro_partida] = @esnumeroDePartida,  [es_oficina_registral] = @esoficinaRegistral,  [es_telefono] = @estelefonoCelular,  
    [es_correo] = @esemail,  [es_pagina_web] = @espaginaWeb,  [es_ventas2016] = @esventas2016,  [es_ventas2017] = @esventas2017, 
    [rl_tipo_documento] = @rptipoDeDocumento, 
    [rl_nro_documento] = @rpnumeroDeDocumento, [rl_ruc] = @rpruc, [rl_nombre] = @rpnombresYApellidos, [rl_sexo] =@rpsexo, 
    [rl_email] = @rpemail, [rl_telefono] = @rptelefono, [rl_productos_comercializados] = @rpproductosComerciales, 
    [rl_actividades_relacionadas] = @rpactividadesRelacionadas, [rl_infraestructura_es] = @rpinfraestructuraDelSolicitante 
    WHERE  [id_proyecto] = @id_proyecto;
    UPDATE [unjfsc].[dbo].[tabla1] 
    SET 
    [entorno_empresarial] = @entornoEmpresarial, 
    [situacion_actual] =@situacionActual, 
    [identificacion_mercado] = @identificacionDelMercado, 
    [competidores] =  @competidores, 
    [modelo_negocio] = @modeloDeNegocio, 
    [capacidad_financiera] = @capacidadFinanciera, 
    [rentabilidad_econimica] = @rentabilidadEconomica, 
    [problemas_identificados] = @problemaIdentificado, 
    [consecuencias_efectos] = @consecuenciasEfectos, 
    [causas] = @causas, 
    [tipo_innovacion] = @tipoDeInnovacion, 
    [funcion_innovacion] = @describirFuncion, 
    [tecnologia] = @describirTecnologia, 
    [forma_resultado] = @describirForma, 
    [antecedentes] =  @antecedentes, 
    [tipo_conocimiento] = @libreRestrigido, 
    [c41og_1] = @c41og_1, [c41og_2] = @c41og_2, [c41og_3] = @c41og_3, 
    [c41oe_1_1] = @c41oe_1_1, [c41oe_2_1] = @c41oe_2_1, [c41oe_3_1] = @c41oe_3_1, [c41oe_1_2] = @c41oe_1_2, 
    [c41oe_2_2] = @c41oe_2_2, [c41oe_3_2] = @c41oe_3_2, [c41oe_1_3] = @c41oe_1_3, [c41oe_2_3] = @c41oe_2_3, 
    [c41oe_3_3] = @c41oe_3_3, [c41oe_1_4] = @c41oe_1_4, [c41oe_2_4] = @c41oe_2_4, [c41oe_3_4] = @c41oe_3_4,
    [c41oe_1_5] = @c41oe_1_5, [c41oe_2_5] = @c41oe_2_5, [c41oe_3_5] = @c41oe_3_5,
    [plan_metodologico] = @planMetodologico, 
    [propiedad_intelectual] = @propiedadIntelectual, 
    [impactos_economicos] = @impactosEconomicos, 
    [impactos_sociales] = @impactosSociales,
    [impactos_formacion] = @impactosEnLaFormacion,  
    [potencialidad] = @pontencialidad, 
    [impactos_tecnologico] = @impactosDeLaTecnologia, 
    [impactos_ambientales] = @impactosAmbientales, 
    [medidas_mitigacion] = @medidasDeMitigacion, 
    [impactos_empresa] = @impactosEnLaEmpresa,
    [c8_1_1] = @c8_1_1, [c8_2_1] = @c8_2_1, [c8_3_1] = @c8_3_1, [c8_4_1] = @c8_4_1, 
    [c8_5_1] = @c8_5_1, [c8_6_1] = @c8_6_1, [c8_7_1] = @c8_7_1, [c8_8_1] = @c8_8_1, 
    [c8_9_1] = @c8_9_1, [c8_10_1] = @c8_10_1, [c8_11_1] = @c8_11_1,
    [c8_1_2] = @c8_1_2, [c8_2_2] = @c8_2_2, [c8_3_2] = @c8_3_2, [c8_4_2] = @c8_4_2, 
    [c8_5_2] = @c8_5_2, [c8_6_2] = @c8_6_2, [c8_7_2] = @c8_7_2, [c8_8_2] = @c8_8_2, 
    [c8_9_2] = @c8_9_2, [c8_10_2] = @c8_10_2, [c8_11_2] = @c8_11_2,
    [c8_1_3] = @c8_1_3, [c8_2_3] = @c8_2_3, [c8_3_3] = @c8_3_3, [c8_4_3] = @c8_4_3, 
    [c8_5_3] = @c8_5_3, [c8_6_3] = @c8_6_3, [c8_7_3] = @c8_7_3, [c8_8_3] = @c8_8_3, 
    [c8_9_3] = @c8_9_3, [c8_10_3] = @c8_10_3, [c8_11_3] = @c8_11_3,
    [c8_1_4] = @c8_1_4, [c8_2_4] = @c8_2_4, [c8_3_4] = @c8_3_4, [c8_4_4] = @c8_4_4, 
    [c8_5_4] = @c8_5_4, [c8_6_4] = @c8_6_4, [c8_7_4] = @c8_7_4, [c8_8_4] = @c8_8_4, 
    [c8_9_4] = @c8_9_4, [c8_10_4] = @c8_10_4, [c8_11_4] = @c8_11_4,
    [c8_1_5] = @c8_1_5, [c8_2_5] = @c8_2_5, [c8_3_5] = @c8_3_5, [c8_4_5] = @c8_4_5, 
    [c8_5_5] = @c8_5_5, [c8_6_5] = @c8_6_5, [c8_7_5] = @c8_7_5, [c8_8_5] = @c8_8_5, 
    [c8_9_5] = @c8_9_5, [c8_10_5] = @c8_10_5, [c8_11_5] = @c8_11_5,
    [tipo_moneda] = @monedaDelProyecto
    WHERE  [id_proyecto] = @id_proyecto;
    
    UPDATE [unjfsc].[dbo].[tabla2] 
    SET
    [d11_1_1] = @d11_1_1, [d11_2_1] = @d11_2_1, [d11_3_1] = @d11_3_1, [d11_4_1] = @d11_4_1, [d11_5_1] = @d11_5_1, [d11_6_1] = @d11_6_1, [d11_7_1] = @d11_7_1, [d11_8_1] = @d11_8_1, [d11_9_1] = @d11_9_1, [d11_10_1] = @d11_10_1, [d11_11_1] = @d11_11_1, [d11_12_1] = @d11_12_1,
    [d11_1_2] = @d11_1_2, [d11_2_2] = @d11_2_2, [d11_3_2] = @d11_3_2, [d11_4_2] = @d11_4_2, [d11_5_2] = @d11_5_2, [d11_6_2] = @d11_6_2, [d12_7_2] = @d12_7_2, [d12_8_2] = @d12_8_2, [d12_9_2] = @d12_9_2, [d12_10_2] = @d12_10_2,
    [d12_1_3] = @d12_1_3, [d12_2_3] = @d12_2_3, [d12_3_3] = @d12_3_3, [d12_4_3] = @d12_4_3, [d12_5_3] = @d12_5_3, [d12_6_3] = @d12_6_3, [d12_7_3] = @d12_7_3, [d12_8_3] = @d12_8_3, [d12_9_3] = @d12_9_3, [d12_10_3] = @d12_10_3,
    [d12_1_4] = @d12_1_4, [d12_2_4] = @d12_2_4, [d12_3_4] = @d12_3_4, [d12_4_4] = @d12_4_4, [d12_5_4] = @d12_5_4, [d12_6_4 ] = @d12_6_4, [d12_7_4] = @d12_7_4, [d12_8_4] = @d12_8_4, [d12_9_4 ] = @d12_9_4, [d12_10_4] = @d12_10_4,
    [d12_1_5] = @d12_1_5, [d12_2_5] = @d12_2_5, [d12_3_5] = @d12_3_5, [d12_4_5] = @d12_4_5, [d12_5_5] = @d12_5_5, [d12_6_5] = @d12_6_5, [d12_7_5] = @d12_7_5, [d12_8_5] = @d12_8_5, [d12_9_5] = @d12_9_5, [d12_10_5] = @d12_10_5
    WHERE  [id_proyecto] = @id_proyecto;
    UPDATE [unjfsc].[dbo].[tabla3] 
    SET
    [d13_1_1] = @d13_1_1, [d13_2_1] = @d13_2_1, [d13_3_1] = @d13_3_1, [d13_4_1] = @d13_4_1, [d13_5_1] = @d13_5_1, [d13_6_1] = @d13_6_1, [d13_7_1] = @d13_7_1, [d13_8_1] = @d13_8_1, [d13_9_1] = @d13_9_1,
    [d13_1_2] = @d13_1_2, [d13_2_2] = @d13_2_2, [d13_3_2] = @d13_3_2, [d13_4_2] = @d13_4_2, [d13_5_2] = @d13_5_2, [d13_6_2] = @d13_6_2, [d13_7_2] = @d13_7_2, [d13_8_2] = @d13_8_2, [d13_9_2] = @d13_9_2,
    [d13_1_3] = @d13_1_3, [d13_2_3] = @d13_2_3, [d13_3_3] = @d13_3_3, [d13_4_3] = @d13_4_3, [d13_5_3] = @d13_5_3, [d13_6_3] = @d13_6_3, [d13_7_3] = @d13_7_3, [d13_8_3] = @d13_8_3, [d13_9_3] = @d13_9_3,
    [d13_1_4] = @d13_1_4, [d13_2_4] = @d13_2_4, [d13_3_4] = @d13_3_4, [d13_4_4] = @d13_4_4, [d13_5_4] = @d13_5_4, [d13_6_4] = @d13_6_4, [d13_7_4] = @d13_7_4, [d13_8_4] = @d13_8_4, [d13_9_4] = @d13_9_4,
    [d13_1_5] = @d13_1_5, [d13_2_5] = @d13_2_5, [d13_3_5] = @d13_3_5, [d13_4_5] = @d13_4_5, [d13_5_5] = @d13_5_5, [d13_6_5] = @d13_6_5, [d13_7_5] = @d13_7_5, [d13_8_5] = @d13_8_5, [d13_9_5] = @d13_9_5,
    [d14_1_1] = @d14_1_1, [d14_2_1] = @d14_2_1, [d14_3_1] = @d14_3_1, [d14_4_1] = @d14_4_1, [d14_5_1] = @d14_5_1, [d14_6_1] = @d14_6_1, [d14_7_1] = @d14_7_1, [d14_8_1] = @d14_8_1, [d14_9_1] = @d14_9_1,
    [d14_1_2] = @d14_1_2, [d14_2_2] = @d14_2_2, [d14_3_2] = @d14_3_2, [d14_4_2] = @d14_4_2, [d14_5_2] = @d14_5_2, [d14_6_2] = @d14_6_2, [d14_7_2] = @d14_7_2, [d14_8_2] = @d14_8_2, [d14_9_2] = @d14_9_2,
    [d14_1_3] = @d14_1_3, [d14_2_3] = @d14_2_3, [d14_3_3] = @d14_3_3, [d14_4_3] = @d14_4_3, [d14_5_3] = @d14_5_3, [d14_6_3] = @d14_6_3, [d14_7_3] = @d14_7_3, [d14_8_3] = @d14_8_3, [d14_9_3] = @d14_9_3,
    [d14_1_4] = @d14_1_4, [d14_2_4] = @d14_2_4, [d14_3_4] = @d14_3_4, [d14_4_4] = @d14_4_4, [d14_5_4] = @d14_5_4, [d14_6_4] = @d14_6_4, [d14_7_4] = @d14_7_4, [d14_8_4] = @d14_8_4, [d14_9_4] = @d14_9_4,
    [d14_1_5] = @d14_1_5, [d14_2_5] = @d14_2_5, [d14_3_5] = @d14_3_5, [d14_4_5] = @d14_4_5, [d14_5_5] = @d14_5_5, [d14_6_5] = @d14_6_5, [d14_7_5] = @d14_7_5, [d14_8_5] = @d14_8_5, [d14_9_5] = @d14_9_5
    WHERE  [id_proyecto] = @id_proyecto;
    UPDATE [unjfsc].[dbo].[tabla4] 
    SET 
    [d15_1_1] = @d15_1_1, [d15_2_1] = @d15_2_1, [d15_3_1] = @d15_3_1, [d15_4_1] = @d15_4_1, [d15_5_1] = @d15_5_1, [d15_6_1] = @d15_6_1, [d15_7_1] = @d15_7_1, [d15_8_1] = @d15_8_1, [d15_9_1] = @d15_9_1, [d15_10_1] = @d15_10_1, [d15_11_1] = @d15_11_1, [d15_12_1] = @d15_12_1, [d15_13_1] = @d15_13_1,
    [d15_1_2] = @d15_1_2, [d15_2_2] = @d15_2_2, [d15_3_2] = @d15_3_2, [d15_4_2] = @d15_4_2, [d15_5_2] = @d15_5_2, [d15_6_2] = @d15_6_2, [d15_7_2] = @d15_7_2, [d15_8_2] = @d15_8_2, [d15_9_2] = @d15_9_2, [d15_10_2] = @d15_10_2, [d15_11_2] = @d15_11_2, [d15_12_2] = @d15_12_2, [d15_13_2] = @d15_13_2,
    [d15_1_3] = @d15_1_3, [d15_2_3] = @d15_2_3, [d15_3_3] = @d15_3_3, [d15_4_3] = @d15_4_3, [d15_5_3] = @d15_5_3, [d15_6_3] = @d15_6_3, [d15_7_3] = @d15_7_3, [d15_8_3] = @d15_8_3, [d15_9_3] = @d15_9_3, [d15_10_3] = @d15_10_3, [d15_11_3] = @d15_11_3, [d15_12_3] = @d15_12_3, [d15_13_3] = @d15_13_3,
    [d15_1_4] = @d15_1_4, [d15_2_4] = @d15_2_4, [d15_3_4] = @d15_3_4, [d15_4_4] = @d15_4_4, [d15_5_4] = @d15_5_4, [d15_6_4] = @d15_6_4, [d15_7_4] = @d15_7_4, [d15_8_4] = @d15_8_4, [d15_9_4] = @d15_9_4, [d15_10_4] = @d15_10_4, [d15_11_4] = @d15_11_4, [d15_12_4] = @d15_12_4, [d15_13_4] = @d15_13_4,
    [d15_1_5] = @d15_1_5, [d15_2_5] = @d15_2_5, [d15_3_5] = @d15_3_5, [d15_4_5] = @d15_4_5, [d15_5_5] = @d15_5_5, [d15_6_5] = @d15_6_5, [d15_7_5] = @d15_7_5, [d15_8_5] = @d15_8_5, [d15_9_5] = @d15_9_5, [d15_10_5] = @d15_10_5, [d15_11_5] = @d15_11_5, [d15_12_5] = @d15_12_5, [d15_13_5] = @d15_13_5,
    [d16_1_1] = @d16_1_1, [d16_2_1] = @d16_2_1, [d16_3_1] = @d16_3_1, [d16_4_1] = @d16_4_1, [d16_5_1] = @d16_5_1, [d16_6_1] = @d16_6_1, [d16_7_1] = @d16_7_1, [d16_8_1] = @d16_8_1, [d16_9_1] = @d16_9_1, [d16_10_1] = @d16_10_1, [d16_11_1] = @d16_11_1, [d16_12_1] = @d16_12_1,
    [d16_1_2] = @d16_1_2, [d16_2_2] = @d16_2_2, [d16_3_2] = @d16_3_2, [d16_4_2] = @d16_4_2, [d16_5_2] = @d16_5_2, [d16_6_2] = @d16_6_2, [d16_7_2] = @d16_7_2, [d16_8_2] = @d16_8_2, [d16_9_2] = @d16_9_2, [d16_10_2] = @d16_10_2, [d16_11_2] = @d16_11_2, [d16_12_2] = @d16_12_2,
    [d16_1_3] = @d16_1_3, [d16_2_3] = @d16_2_3, [d16_3_3] = @d16_3_3, [d16_4_3] = @d16_4_3, [d16_5_3] = @d16_5_3, [d16_6_3] = @d16_6_3, [d16_7_3] = @d16_7_3, [d16_8_3] = @d16_8_3, [d16_9_3] = @d16_9_3, [d16_10_3] = @d16_10_3, [d16_11_3] = @d16_11_3, [d16_12_3] = @d16_12_3,
    [d16_1_4] = @d16_1_4, [d16_2_4] = @d16_2_4, [d16_3_4] = @d16_3_4, [d16_4_4] = @d16_4_4, [d16_5_4] = @d16_5_4, [d16_6_4] = @d16_6_4, [d16_7_4] = @d16_7_4, [d16_8_4] = @d16_8_4, [d16_9_4] = @d16_9_4, [d16_10_4] = @d16_10_4, [d16_11_4] = @d16_11_4, [d16_12_4] = @d16_12_4,
    [d16_1_5] = @d16_1_5, [d16_2_5] = @d16_2_5, [d16_3_5] = @d16_3_5, [d16_4_5] = @d16_4_5, [d16_5_5] = @d16_5_5, [d16_6_5] = @d16_6_5, [d16_7_5] = @d16_7_5, [d16_8_5] = @d16_8_5, [d16_9_5] = @d16_9_5, [d16_10_5] = @d16_10_5, [d16_11_5] = @d16_11_5, [d16_12_5] = @d16_12_5
    WHERE  [id_proyecto] = @id_proyecto;
    UPDATE [unjfsc].[dbo].[tabla5] 
    SET
    [d17_1_1] = @d17_1_1, [d17_2_1] = @d17_2_1, [d17_3_1] = @d17_3_1, [d17_4_1] = @d17_4_1, [d17_5_1] = @d17_5_1, [d17_6_1] = @d17_6_1, [d17_7_1] = @d17_7_1, [d17_8_1] = @d17_8_1, [d17_9_1] = @d17_9_1, [d17_10_1] = @d17_10_1,
    [d17_1_2] = @d17_1_2, [d17_2_2] = @d17_2_2, [d17_3_2] = @d17_3_2, [d17_4_2] = @d17_4_2, [d17_5_2] = @d17_5_2, [d17_6_2] = @d17_6_2, [d17_7_2] = @d17_7_2, [d17_8_2] = @d17_8_2, [d17_9_2] = @d17_9_2, [d17_10_2] = @d17_10_2,
    [d17_1_3] = @d17_1_3, [d17_2_3] = @d17_2_3, [d17_3_3] = @d17_3_3, [d17_4_3] = @d17_4_3, [d17_5_3] = @d17_5_3, [d17_6_3] = @d17_6_3, [d17_7_3] = @d17_7_3, [d17_8_3] = @d17_8_3, [d17_9_3] = @d17_9_3, [d17_10_3] = @d17_10_3,
    [d17_1_4] = @d17_1_4, [d17_2_4] = @d17_2_4, [d17_3_4] = @d17_3_4, [d17_4_4] = @d17_4_4, [d17_5_4] = @d17_5_4, [d17_6_4] = @d17_6_4, [d17_7_4] = @d17_7_4, [d17_8_4] = @d17_8_4, [d17_9_4] = @d17_9_4, [d17_10_4] = @d17_10_4,
    [d17_1_5] = @d17_1_5, [d17_2_5] = @d17_2_5, [d17_3_5] = @d17_3_5, [d17_4_5] = @d17_4_5, [d17_5_5] = @d17_5_5, [d17_6_5] = @d17_6_5, [d17_7_5] = @d17_7_5, [d17_8_5] = @d17_8_5, [d17_9_5] = @d17_9_5, [d17_10_5] = @d17_10_5,
    [d18_1_1] = @d18_1_1, [d18_2_1] = @d18_2_1, [d18_3_1] = @d18_3_1, [d18_4_1] = @d18_4_1, [d18_5_1] = @d18_5_1, [d18_6_1] = @d18_6_1, [d18_7_1] = @d18_7_1, [d18_8_1] = @d18_8_1, [d18_9_1] = @d18_9_1,
    [d18_1_2] = @d18_1_2, [d18_2_2] = @d18_2_2, [d18_3_2] = @d18_3_2, [d18_4_2] = @d18_4_2, [d18_5_2] = @d18_5_2, [d18_6_2] = @d18_6_2, [d18_7_2] = @d18_7_2, [d18_8_2] = @d18_8_2, [d18_9_2] = @d18_9_2,
    [d18_1_3] = @d18_1_3, [d18_2_3] = @d18_2_3, [d18_3_3] = @d18_3_3, [d18_4_3] = @d18_4_3, [d18_5_3] = @d18_5_3, [d18_6_3] = @d18_6_3, [d18_7_3] = @d18_7_3, [d18_8_3] = @d18_8_3, [d18_9_3] = @d18_9_3,
    [d18_1_4] = @d18_1_4, [d18_2_4] = @d18_2_4, [d18_3_4] = @d18_3_4, [d18_4_4] = @d18_4_4, [d18_5_4] = @d18_5_4, [d18_6_4] = @d18_6_4, [d18_7_4] = @d18_7_4, [d18_8_4] = @d18_8_4, [d18_9_4] = @d18_9_4,
    [d18_1_5] = @d18_1_5, [d18_2_5] = @d18_2_5, [d18_3_5] = @d18_3_5, [d18_4_5] = @d18_4_5, [d18_5_5] = @d18_5_5, [d18_6_5] = @d18_6_5, [d18_7_5] = @d18_7_5, [d18_8_5] = @d18_8_5, [d18_9_5] = @d18_9_5,
    [d19_1_1] = @d19_1_1, [d19_2_1] = @d19_2_1, [d19_3_1] = @d19_3_1, [d19_4_1] = @d19_4_1, [d19_5_1] = @d19_5_1, [d19_6_1] = @d19_6_1, [d19_7_1] = @d19_7_1,
    [d19_1_2] = @d19_1_2, [d19_2_2] = @d19_2_2, [d19_3_2] = @d19_3_2, [d19_4_2] = @d19_4_2, [d19_5_2] = @d19_5_2, [d19_6_2] = @d19_6_2, [d19_7_2] = @d19_7_2,
    [d19_1_3] = @d19_1_3, [d19_2_3] = @d19_2_3, [d19_3_3] = @d19_3_3, [d19_4_3] = @d19_4_3, [d19_5_3] = @d19_5_3, [d19_6_3] = @d19_6_3, [d19_7_3] = @d19_7_3,
    [d19_1_4] = @d19_1_4, [d19_2_4] = @d19_2_4, [d19_3_4] = @d19_3_4, [d19_4_4] = @d19_4_4, [d19_5_4] = @d19_5_4, [d19_6_4] = @d19_6_4, [d19_7_4] = @d19_7_4,
    [d19_1_5] = @d19_1_5, [d19_2_5] = @d19_2_5, [d19_3_5] = @d19_3_5, [d19_4_5] = @d19_4_5, [d19_5_5] = @d19_5_5, [d19_6_5] = @d19_6_5, [d19_7_5] = @d19_7_5
    WHERE  [id_proyecto] = @id_proyecto
    `;
    
    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/administrar');
    });

    request.addParameter("id_usuario",                           TYPES.Int            ,req.session.user.id);    
    request.addParameter("titulo",                               TYPES.Text           ,req.body.titulo);
    request.addParameter("id_proyecto",                          TYPES.Int            ,req.body.id_proyecto);
    request.addParameter( "palabrasClave" ,                      TYPES.Text           ,req.body.palabrasClave ? req.body.palabrasClave : null);
    request.addParameter( "area_innovacion_area" ,               TYPES.Text           ,req.body.area_innovacion_area ? req.body.area_innovacion_area : null);
    request.addParameter( "area_innovacion_subarea" ,            TYPES.Text           ,req.body.area_innovacion_subarea ? req.body.area_innovacion_subarea : null);
    request.addParameter( "area_innovacion_tematica" ,           TYPES.Text           ,req.body.area_innovacion_tematica ? req.body.area_innovacion_tematica : null);
    request.addParameter( "aplicacion_area" ,                    TYPES.Text           ,req.body.aplicacion_area ? req.body.aplicacion_area : null);
    request.addParameter( "aplicacion_subarea" ,                 TYPES.Text           ,req.body.aplicacion_subarea ? req.body.aplicacion_subarea : null);
    request.addParameter( "localizacion_departamento"  ,         TYPES.Text           ,req.body.localizacion_departamento ? req.body.localizacion_departamento : null);
    request.addParameter( "localizacion_provincia"  ,            TYPES.Text           ,req.body.localizacion_provincia ? req.body.localizacion_provincia : null);
    request.addParameter( "localizacion_distrito"  ,             TYPES.Text           ,req.body.localizacion_distrito ? req.body.localizacion_distrito : null);
    request.addParameter( "localizacion_ubigeo"  ,               TYPES.Int            ,req.body.localizacion_ubigeo ? req.body.localizacion_ubigeo : null);
    request.addParameter("a22_1_1",           TYPES.Text           ,req.body.a22_1_1 ? req.body.a22_1_1 : null);
    request.addParameter("a22_2_1",           TYPES.Text           ,req.body.a22_2_1 ? req.body.a22_2_1 : null);
    request.addParameter("a22_3_1",           TYPES.Text           ,req.body.a22_3_1 ? req.body.a22_3_1 : null);
    request.addParameter("a22_4_1",           TYPES.Text           ,req.body.a22_4_1 ? req.body.a22_4_1 : null);
    request.addParameter("a22_5_1",           TYPES.Text           ,req.body.a22_5_1 ? req.body.a22_5_1 : null);
    request.addParameter("a22_1_2",           TYPES.Text           ,req.body.a22_1_2 ? req.body.a22_1_2 : null);
    request.addParameter("a22_2_2",           TYPES.Text           ,req.body.a22_2_2 ? req.body.a22_2_2 : null);
    request.addParameter("a22_3_2",           TYPES.Text           ,req.body.a22_3_2 ? req.body.a22_3_2 : null);
    request.addParameter("a22_4_2",           TYPES.Text           ,req.body.a22_4_2 ? req.body.a22_4_2 : null);
    request.addParameter("a22_5_2",           TYPES.Text           ,req.body.a22_5_2 ? req.body.a22_5_2 : null);
    request.addParameter("a22_1_3",           TYPES.Text           ,req.body.a22_1_3 ? req.body.a22_1_3 : null);
    request.addParameter("a22_2_3",           TYPES.Text           ,req.body.a22_2_3 ? req.body.a22_2_3 : null);
    request.addParameter("a22_3_3",           TYPES.Text           ,req.body.a22_3_3 ? req.body.a22_3_3 : null);
    request.addParameter("a22_4_3",           TYPES.Text           ,req.body.a22_4_3 ? req.body.a22_4_3 : null);
    request.addParameter("a22_5_3",           TYPES.Text           ,req.body.a22_5_3 ? req.body.a22_5_3 : null);
    request.addParameter("a31_1_1",           TYPES.Text           ,req.body.a31_1_1 ? req.body.a31_1_1 : null);
    request.addParameter("a31_2_1",           TYPES.Text            ,req.body.a31_2_1 ? req.body.a31_2_1 : null);
    request.addParameter("a31_1_2" ,           TYPES.Text            ,req.body.a31_1_2 ? req.body.a31_1_2 : null);
    request.addParameter("a31_2_2" ,           TYPES.Text            ,req.body.a31_2_2 ? req.body.a31_2_2 : null);
    request.addParameter("a31_1_3" ,           TYPES.Text            ,req.body.a31_1_3 ? req.body.a31_1_3 : null);
    request.addParameter("a31_2_3" ,           TYPES.Text            ,req.body.a31_2_3 ? req.body.a31_2_3 : null);
    request.addParameter("a32_1_1" ,           TYPES.Text            ,req.body.a32_1_1 ? req.body.a32_1_1 : null);
    request.addParameter("a32_2_1" ,           TYPES.Text            ,req.body.a32_2_1 ? req.body.a32_2_1 : null);
    request.addParameter("a32_1_2" ,           TYPES.Text            ,req.body.a32_1_2 ? req.body.a32_1_2 : null);
    request.addParameter("a32_2_2" ,           TYPES.Text            ,req.body.a32_2_2 ? req.body.a32_2_2 : null);
    request.addParameter("a32_1_3" ,           TYPES.Text            ,req.body.a32_1_3 ? req.body.a32_1_3 : null);
    request.addParameter("a32_2_3" ,           TYPES.Text            ,req.body.a32_2_3 ? req.body.a32_2_3 : null);
    request.addParameter("a33_1_1" ,           TYPES.Text            ,req.body.a33_1_1 ? req.body.a33_1_1 : null);
    request.addParameter("a33_2_1" ,           TYPES.Text            ,req.body.a33_2_1 ? req.body.a33_2_1 : null);
    request.addParameter("a33_1_2" ,           TYPES.Text            ,req.body.a33_1_2 ? req.body.a33_1_2 : null);
    request.addParameter("a33_2_2" ,           TYPES.Text            ,req.body.a33_2_2 ? req.body.a33_2_2 : null);
    request.addParameter("a33_1_3" ,           TYPES.Text            ,req.body.a33_1_3 ? req.body.a33_1_3 : null);
    request.addParameter("a33_2_3" ,           TYPES.Text            ,req.body.a33_2_3 ? req.body.a33_2_3 : null);
    request.addParameter("a34_1_1" ,           TYPES.Text            ,req.body.a34_1_1 ? req.body.a34_1_1 : null);
    request.addParameter("a34_2_1" ,           TYPES.Text            ,req.body.a34_2_1 ? req.body.a34_2_1 : null);
    request.addParameter("a34_3_1" ,           TYPES.Text            ,req.body.a34_3_1 ? req.body.a34_3_1 : null);
    request.addParameter("a34_4_1" ,           TYPES.Date            ,req.body.a34_4_1 ? req.body.a34_4_1 : null);
    request.addParameter("a34_5_1" ,           TYPES.Date            ,req.body.a34_5_1 ? req.body.a34_5_1 : null);
    request.addParameter("a34_1_2" ,           TYPES.Text            ,req.body.a34_1_2 ? req.body.a34_1_2 : null);
    request.addParameter("a34_2_2" ,           TYPES.Text            ,req.body.a34_2_2 ? req.body.a34_2_2 : null);
    request.addParameter("a34_3_2" ,           TYPES.Text            ,req.body.a34_3_2 ? req.body.a34_3_2 : null);
    request.addParameter("a34_4_2" ,           TYPES.Date            ,req.body.a34_4_2 ? req.body.a34_4_2 : null);
    request.addParameter("a34_5_2" ,           TYPES.Date            ,req.body.a34_5_2 ? req.body.a34_5_2 : null);
    request.addParameter("a34_1_3" ,           TYPES.Text            ,req.body.a34_1_3 ? req.body.a34_1_3 : null);
    request.addParameter("a34_2_3" ,           TYPES.Text            ,req.body.a34_2_3 ? req.body.a34_2_3 : null);
    request.addParameter("a34_3_3" ,           TYPES.Text            ,req.body.a34_3_3 ? req.body.a34_3_3 : null);
    request.addParameter("a34_4_3" ,           TYPES.Date            ,req.body.a34_4_3 ? req.body.a34_4_3 : null);
    request.addParameter("a34_5_3" ,           TYPES.Date            ,req.body.a34_5_3 ? req.body.a34_5_3 : null);    
    request.addParameter("a35_1_1" ,           TYPES.Text            ,req.body.a35_1_1 ? req.body.a35_1_1 : null);
    request.addParameter("a35_2_1" ,           TYPES.Text            ,req.body.a35_2_1 ? req.body.a35_2_1 : null);
    request.addParameter("a35_3_1" ,           TYPES.Text            ,req.body.a35_3_1 ? req.body.a35_3_1 : null);
    request.addParameter("a35_4_1" ,           TYPES.Date            ,req.body.a35_4_1 ? req.body.a35_4_1 : null);
    request.addParameter("a35_5_1" ,           TYPES.Date            ,req.body.a35_5_1 ? req.body.a35_5_1 : null);
    request.addParameter("a35_6_1" ,           TYPES.Text            ,req.body.a35_6_1 ? req.body.a35_6_1 : null);
    request.addParameter("a35_7_1" ,           TYPES.Text            ,req.body.a35_7_1 ? req.body.a35_7_1 : null);
    request.addParameter("a35_1_2" ,           TYPES.Text            ,req.body.a35_1_2 ? req.body.a35_1_2 : null);
    request.addParameter("a35_2_2" ,           TYPES.Text            ,req.body.a35_2_2 ? req.body.a35_2_2 : null);
    request.addParameter("a35_3_2" ,           TYPES.Text            ,req.body.a35_3_2 ? req.body.a35_3_2 : null);
    request.addParameter("a35_4_2" ,           TYPES.Date            ,req.body.a35_4_2 ? req.body.a35_4_2 : null);
    request.addParameter("a35_5_2" ,           TYPES.Date            ,req.body.a35_5_2 ? req.body.a35_5_2 : null);
    request.addParameter("a35_6_2" ,           TYPES.Text            ,req.body.a35_6_2 ? req.body.a35_6_2 : null);
    request.addParameter("a35_7_2" ,           TYPES.Text            ,req.body.a35_7_2 ? req.body.a35_7_2 : null);
    request.addParameter("a35_1_3" ,           TYPES.Text            ,req.body.a35_1_3 ? req.body.a35_1_3 : null);
    request.addParameter("a35_2_3" ,           TYPES.Text            ,req.body.a35_2_3 ? req.body.a35_2_3 : null);
    request.addParameter("a35_3_3" ,           TYPES.Text            ,req.body.a35_3_3 ? req.body.a35_3_3 : null);
    request.addParameter("a35_4_3" ,           TYPES.Date            ,req.body.a35_4_3 ? req.body.a35_4_3 : null);
    request.addParameter("a35_5_3" ,           TYPES.Date            ,req.body.a35_5_3 ? req.body.a35_5_3 : null);
    request.addParameter("a35_6_3" ,           TYPES.Text            ,req.body.a35_6_3 ? req.body.a35_6_3 : null);
    request.addParameter("a35_7_3" ,           TYPES.Text            ,req.body.a35_7_3 ? req.body.a35_7_3 : null);
    request.addParameter( "duracionDelProyecto",                  TYPES.Int             ,req.body.duracionDelProyecto ? req.body.duracionDelProyecto : null);
    request.addParameter( "fechaEstimadaDeInicioDelProyecto",     TYPES.Date            ,req.body.fechaEstimadaDeInicioDelProyecto ? req.body.fechaEstimadaDeInicioDelProyecto : null);
    request.addParameter( "cgptipoDeDocumento" ,                  TYPES.Int             ,req.body.cgptipoDeDocumento ? req.body.cgptipoDeDocumento : null);
    request.addParameter( "cgpnumeroDeDocumento"   ,              TYPES.Int             ,req.body.cgpnumeroDeDocumento ? req.body.cgpnumeroDeDocumento : null);
    request.addParameter( "cgpruc" ,                              TYPES.Int             ,req.body.cgpruc ? req.body.cgpruc : null);
    request.addParameter( "cgpnombresYApellidos"   ,              TYPES.Text            ,req.body.cgpnombresYApellidos ? req.body.cgpnombresYApellidos : null);
    request.addParameter( "cgpfechaDeNacimiento"   ,              TYPES.Date            ,req.body.cgpfechaDeNacimiento ? req.body.cgpfechaDeNacimiento : null);
    request.addParameter( "cgpsexo",                              TYPES.Int             ,req.body.cgpsexo ? req.body.cgpsexo : null);
    request.addParameter( "cgpemail"   ,                          TYPES.Text            ,req.body.cgpemail ? req.body.cgpemail : null);
    request.addParameter( "cgptelefono",                          TYPES.Int             ,req.body.cgptelefono ? req.body.cgptelefono : null);
    request.addParameter( "cgpcelular" ,                          TYPES.Int             ,req.body.cgpcelular ? req.body.cgpcelular : null);
    request.addParameter( "captipoDeDocumento" ,                  TYPES.Int             ,req.body.captipoDeDocumento ? req.body.captipoDeDocumento : null);
    request.addParameter( "capnumeroDeDocumento"   ,              TYPES.Int             ,req.body.capnumeroDeDocumento ? req.body.capnumeroDeDocumento : null);
    request.addParameter( "capruc" ,                              TYPES.Int             ,req.body.capruc ? req.body.capruc : null);
    request.addParameter( "capnombresYApellidos"   ,              TYPES.Text            ,req.body.capnombresYApellidos ? req.body.capnombresYApellidos : null);
    request.addParameter( "capfechaDeNacimiento"   ,              TYPES.Date            ,req.body.capfechaDeNacimiento ? req.body.capfechaDeNacimiento : null);
    request.addParameter( "capsexo",                              TYPES.Int             ,req.body.capsexo ? req.body.capsexo : null);
    request.addParameter( "capemail"   ,                          TYPES.Text            ,req.body.capemail ? req.body.capemail : null);
    request.addParameter( "captelefono",                          TYPES.Int             ,req.body.captelefono ? req.body.captelefono : null);
    request.addParameter( "capcelular" ,                          TYPES.Int             ,req.body.capcelular ? req.body.capcelular : null);
    request.addParameter( "estipoDeEntidad",                      TYPES.Int             ,req.body.estipoDeEntidad ? req.body.estipoDeEntidad : null);
    request.addParameter( "estamañoDeLaEmpresa",                  TYPES.Text            ,req.body.estamañoDeLaEmpresa ? req.body.estamañoDeLaEmpresa : null);
    request.addParameter( "esnroDeTrabajadores",                  TYPES.Int             ,req.body.esnroDeTrabajadores ? req.body.esnroDeTrabajadores : null);
    request.addParameter( "esrucRazonSocial"   ,                  TYPES.Text            ,req.body.esrucRazonSocial ? req.body.esrucRazonSocial : null);
    request.addParameter( "esciiu" ,                              TYPES.Text            ,req.body.esciiu ? req.body.esciiu : null);
    request.addParameter( "esdireccion",                          TYPES.Text            ,req.body.esdireccion ? req.body.esdireccion : null);
    request.addParameter( "esfechaDeConstitucion"  ,              TYPES.Date            ,req.body.esfechaDeConstitucion ? req.body.esfechaDeConstitucion : null);
    request.addParameter( "esinicioDeActividades"  ,              TYPES.Date            ,req.body.esinicioDeActividades ? req.body.esinicioDeActividades : null);
    request.addParameter( "esnumeroDePartida"  ,                  TYPES.Text            ,req.body.esnumeroDePartida ? req.body.esnumeroDePartida : null);
    request.addParameter( "esoficinaRegistral" ,                  TYPES.Text            ,req.body.esoficinaRegistral ? req.body.esoficinaRegistral : null);
    request.addParameter( "estelefonoCelular"  ,                  TYPES.Text            ,req.body.estelefonoCelular ? req.body.estelefonoCelular : null);
    request.addParameter( "esemail",                              TYPES.Text            ,req.body.esemail ? req.body.esemail : null);
    request.addParameter( "espaginaWeb",                          TYPES.Text            ,req.body.espaginaWeb ? req.body.espaginaWeb : null);
    request.addParameter( "esventas2016"   ,                      TYPES.Int             ,req.body.esventas2016 ? req.body.esventas2016 : null);
    request.addParameter( "esventas2017"   ,                      TYPES.Int             ,req.body.esventas2017 ? req.body.esventas2017 : null);
    request.addParameter( "rptipoDeDocumento"  ,                  TYPES.Int             ,req.body.rptipoDeDocumento ? req.body.rptipoDeDocumento : null);
    request.addParameter( "rpnumeroDeDocumento",                  TYPES.Int             ,req.body.rpnumeroDeDocumento ? req.body.rpnumeroDeDocumento : null);
    request.addParameter( "rpruc"  ,                              TYPES.Int             ,req.body.rpruc ? req.body.rpruc : null);
    request.addParameter( "rpnombresYApellidos",                  TYPES.Text            ,req.body.rpnombresYApellidos ? req.body.rpnombresYApellidos : null);
    request.addParameter( "rpsexo" ,                              TYPES.Int             ,req.body.rpsexo ? req.body.rpsexo : null );
    request.addParameter( "rpemail",                              TYPES.Text            ,req.body.rpemail ? req.body.rpemail : null );
    request.addParameter( "rptelefono" ,                          TYPES.Int             ,req.body.rptelefono ? req.body.rptelefono : null );
    request.addParameter( "rpproductosComerciales" ,              TYPES.Text            ,req.body.rpproductosComerciales ? req.body.rpproductosComerciales : null );
    request.addParameter( "rpactividadesRelacionadas"  ,          TYPES.Text            ,req.body.rpactividadesRelacionadas ? req.body.rpactividadesRelacionadas : null );
    request.addParameter( "rpinfraestructuraDelSolicitante",      TYPES.Text            ,req.body.rpinfraestructuraDelSolicitante ? req.body.rpinfraestructuraDelSolicitante : null );
    request.addParameter( "entornoEmpresarial" ,                  TYPES.Text            ,req.body.entornoEmpresarial ? req.body.entornoEmpresarial : null );
    request.addParameter( "situacionActual",                      TYPES.Text            ,req.body.situacionActual ? req.body.situacionActual : null );
    request.addParameter( "identificacionDelMercado"   ,          TYPES.Text            ,req.body.identificacionDelMercado ? req.body.identificacionDelMercado : null );
    request.addParameter( "competidores"   ,                      TYPES.Text            ,req.body.competidores ? req.body.competidores : null );
    request.addParameter( "modeloDeNegocio",                      TYPES.Text            ,req.body.modeloDeNegocio ? req.body.modeloDeNegocio : null );
    request.addParameter( "capacidadFinanciera",                  TYPES.Text            ,req.body.capacidadFinanciera ? req.body.capacidadFinanciera : null );
    request.addParameter( "rentabilidadEconomica"  ,              TYPES.Text            ,req.body.rentabilidadEconomica ? req.body.rentabilidadEconomica : null );
    request.addParameter( "problemaIdentificado"   ,              TYPES.Text            ,req.body.problemaIdentificado ? req.body.problemaIdentificado : null );
    request.addParameter( "consecuenciasEfectos"   ,              TYPES.Text            ,req.body.consecuenciasEfectos ? req.body.consecuenciasEfectos : null );
    request.addParameter( "causas" ,                              TYPES.Text            ,req.body.causas ? req.body.causas : null );
    request.addParameter( "tipoDeInnovacion"   ,                  TYPES.Int             ,req.body.tipoDeInnovacion ? req.body.tipoDeInnovacion : null );
    request.addParameter( "describirFuncion"   ,                  TYPES.Text            ,req.body.describirFuncion ? req.body.describirFuncion : null );
    request.addParameter( "describirTecnologia",                  TYPES.Text            ,req.body.describirTecnologia ? req.body.describirTecnologia : null );
    request.addParameter( "describirForma" ,                      TYPES.Text            ,req.body.describirForma ? req.body.describirForma : null );
    request.addParameter( "antecedentes"   ,                      TYPES.Text            ,req.body.antecedentes ? req.body.antecedentes : null );
    request.addParameter( "libreRestrigido",                      TYPES.Text            ,req.body.libreRestrigido ? req.body.libreRestrigido : null );
    request.addParameter("c41og_1" ,             TYPES.Text            ,req.body.c41og_1   ? req.body.c41og_1   : null);
    request.addParameter("c41og_2" ,             TYPES.Text            ,req.body.c41og_2   ? req.body.c41og_2   : null);
    request.addParameter("c41og_3" ,             TYPES.Text            ,req.body.c41og_3   ? req.body.c41og_3   : null);
    request.addParameter("c41oe_1_1" ,           TYPES.Text            ,req.body.c41oe_1_1 ? req.body.c41oe_1_1 : null);
    request.addParameter("c41oe_2_1" ,           TYPES.Text            ,req.body.c41oe_2_1 ? req.body.c41oe_2_1 : null);
    request.addParameter("c41oe_3_1" ,           TYPES.Text            ,req.body.c41oe_3_1 ? req.body.c41oe_3_1 : null);
    request.addParameter("c41oe_1_2" ,           TYPES.Text            ,req.body.c41oe_1_2 ? req.body.c41oe_1_2 : null);
    request.addParameter("c41oe_2_2" ,           TYPES.Text            ,req.body.c41oe_2_2 ? req.body.c41oe_2_2 : null);
    request.addParameter("c41oe_3_2" ,           TYPES.Text            ,req.body.c41oe_3_2 ? req.body.c41oe_3_2 : null);
    request.addParameter("c41oe_1_3" ,           TYPES.Text            ,req.body.c41oe_1_3 ? req.body.c41oe_1_3 : null);
    request.addParameter("c41oe_2_3" ,           TYPES.Text            ,req.body.c41oe_2_3 ? req.body.c41oe_2_3 : null);
    request.addParameter("c41oe_3_3" ,           TYPES.Text            ,req.body.c41oe_3_3 ? req.body.c41oe_3_3 : null);
    request.addParameter("c41oe_1_4" ,           TYPES.Text            ,req.body.c41oe_1_4 ? req.body.c41oe_1_4 : null);
    request.addParameter("c41oe_2_4" ,           TYPES.Text            ,req.body.c41oe_2_4 ? req.body.c41oe_2_4 : null);
    request.addParameter("c41oe_3_4" ,           TYPES.Text            ,req.body.c41oe_3_4 ? req.body.c41oe_3_4 : null);
    request.addParameter("c41oe_1_5" ,           TYPES.Text            ,req.body.c41oe_1_5 ? req.body.c41oe_1_5 : null);
    request.addParameter("c41oe_2_5" ,           TYPES.Text            ,req.body.c41oe_2_5 ? req.body.c41oe_2_5 : null);
    request.addParameter("c41oe_3_5" ,           TYPES.Text            ,req.body.c41oe_3_5 ? req.body.c41oe_3_5 : null);
    request.addParameter( "planMetodologico"   ,                  TYPES.Text            ,req.body.planMetodologico ? req.body.planMetodologico : null );
    request.addParameter( "propiedadIntelectual"   ,              TYPES.Text            ,req.body.propiedadIntelectual ? req.body.propiedadIntelectual : null );
    request.addParameter( "impactosEconomicos" ,                  TYPES.Text            ,req.body.impactosEconomicos ? req.body.impactosEconomicos : null );
    request.addParameter( "impactosSociales"   ,                  TYPES.Text            ,req.body.impactosSociales ? req.body.impactosSociales : null );
    request.addParameter( "impactosEnLaFormacion"  ,              TYPES.Text            ,req.body.impactosEnLaFormacion ? req.body.impactosEnLaFormacion : null );
    request.addParameter( "pontencialidad" ,                      TYPES.Text            ,req.body.pontencialidad ? req.body.pontencialidad : null );
    request.addParameter( "impactosDeLaTecnologia" ,              TYPES.Text            ,req.body.impactosDeLaTecnologia ? req.body.impactosDeLaTecnologia : null );
    request.addParameter( "impactosAmbientales",                  TYPES.Text            ,req.body.impactosAmbientales ? req.body.impactosAmbientales : null );
    request.addParameter( "medidasDeMitigacion",                  TYPES.Text            ,req.body.medidasDeMitigacion ? req.body.medidasDeMitigacion : null );
    request.addParameter( "impactosEnLaEmpresa",                  TYPES.Text            ,req.body.impactosEnLaEmpresa ? req.body.impactosEnLaEmpresa : null );
    request.addParameter( "c8_1_1" ,           TYPES.Text            ,req.body.c8_1_1 ? req.body.c8_1_1 : null );
    request.addParameter( "c8_2_1" ,           TYPES.Text            ,req.body.c8_2_1 ? req.body.c8_2_1 : null );
    request.addParameter( "c8_3_1" ,           TYPES.Text            ,req.body.c8_3_1 ? req.body.c8_3_1 : null );
    request.addParameter( "c8_4_1" ,           TYPES.Text            ,req.body.c8_4_1 ? req.body.c8_4_1 : null );
    request.addParameter( "c8_5_1" ,           TYPES.Text            ,req.body.c8_5_1 ? req.body.c8_5_1 : null );
    request.addParameter( "c8_6_1" ,           TYPES.Text            ,req.body.c8_6_1 ? req.body.c8_6_1 : null );
    request.addParameter( "c8_7_1" ,           TYPES.Text            ,req.body.c8_7_1 ? req.body.c8_7_1 : null );
    request.addParameter( "c8_8_1" ,           TYPES.Text            ,req.body.c8_8_1 ? req.body.c8_8_1 : null );
    request.addParameter( "c8_9_1" ,           TYPES.Text            ,req.body.c8_9_1 ? req.body.c8_9_1 : null );
    request.addParameter( "c8_10_1" ,          TYPES.Text            ,req.body.c8_10_1 ? req.body.c8_10_1 : null );
    request.addParameter( "c8_11_1" ,          TYPES.Text            ,req.body.c8_11_1 ? req.body.c8_11_1 : null );
    request.addParameter( "c8_1_2" ,           TYPES.Text            ,req.body.c8_1_2 ? req.body.c8_1_2 : null );
    request.addParameter( "c8_2_2" ,           TYPES.Text            ,req.body.c8_2_2 ? req.body.c8_2_2 : null );
    request.addParameter( "c8_3_2" ,           TYPES.Text            ,req.body.c8_3_2 ? req.body.c8_3_2 : null );
    request.addParameter( "c8_4_2" ,           TYPES.Text            ,req.body.c8_4_2 ? req.body.c8_4_2 : null );
    request.addParameter( "c8_5_2" ,           TYPES.Text            ,req.body.c8_5_2 ? req.body.c8_5_2 : null );
    request.addParameter( "c8_6_2" ,           TYPES.Text            ,req.body.c8_6_2 ? req.body.c8_6_2 : null );
    request.addParameter( "c8_7_2" ,           TYPES.Text            ,req.body.c8_7_2 ? req.body.c8_7_2 : null );
    request.addParameter( "c8_8_2" ,           TYPES.Text            ,req.body.c8_8_2 ? req.body.c8_8_2 : null );
    request.addParameter( "c8_9_2" ,           TYPES.Text            ,req.body.c8_9_2 ? req.body.c8_9_2 : null );
    request.addParameter( "c8_10_2" ,          TYPES.Text            ,req.body.c8_10_2 ? req.body.c8_10_2 : null );
    request.addParameter( "c8_11_2" ,          TYPES.Text            ,req.body.c8_11_2 ? req.body.c8_11_2 : null );
    request.addParameter( "c8_1_3" ,           TYPES.Text            ,req.body.c8_1_3 ? req.body.c8_1_3 : null );
    request.addParameter( "c8_2_3" ,           TYPES.Text            ,req.body.c8_2_3 ? req.body.c8_2_3 : null );
    request.addParameter( "c8_3_3" ,           TYPES.Text            ,req.body.c8_3_3 ? req.body.c8_3_3 : null );
    request.addParameter( "c8_4_3" ,           TYPES.Text            ,req.body.c8_4_3 ? req.body.c8_4_3 : null );
    request.addParameter( "c8_5_3" ,           TYPES.Text            ,req.body.c8_5_3 ? req.body.c8_5_3 : null );
    request.addParameter( "c8_6_3" ,           TYPES.Text            ,req.body.c8_6_3 ? req.body.c8_6_3 : null );
    request.addParameter( "c8_7_3" ,           TYPES.Text            ,req.body.c8_7_3 ? req.body.c8_7_3 : null );
    request.addParameter( "c8_8_3" ,           TYPES.Text            ,req.body.c8_8_3 ? req.body.c8_8_3 : null );
    request.addParameter( "c8_9_3" ,           TYPES.Text            ,req.body.c8_9_3 ? req.body.c8_9_3 : null );
    request.addParameter( "c8_10_3" ,          TYPES.Text            ,req.body.c8_10_3 ? req.body.c8_10_3 : null );
    request.addParameter( "c8_11_3" ,          TYPES.Text            ,req.body.c8_11_3 ? req.body.c8_11_3 : null );
    request.addParameter( "c8_1_4" ,           TYPES.Text            ,req.body.c8_1_4 ? req.body.c8_1_4 : null );
    request.addParameter( "c8_2_4" ,           TYPES.Text            ,req.body.c8_2_4 ? req.body.c8_2_4 : null );
    request.addParameter( "c8_3_4" ,           TYPES.Text            ,req.body.c8_3_4 ? req.body.c8_3_4 : null );
    request.addParameter( "c8_4_4" ,           TYPES.Text            ,req.body.c8_4_4 ? req.body.c8_4_4 : null );
    request.addParameter( "c8_5_4" ,           TYPES.Text            ,req.body.c8_5_4 ? req.body.c8_5_4 : null );
    request.addParameter( "c8_6_4" ,           TYPES.Text            ,req.body.c8_6_4 ? req.body.c8_6_4 : null );
    request.addParameter( "c8_7_4" ,           TYPES.Text            ,req.body.c8_7_4 ? req.body.c8_7_4 : null );
    request.addParameter( "c8_8_4" ,           TYPES.Text            ,req.body.c8_8_4 ? req.body.c8_8_4 : null );
    request.addParameter( "c8_9_4" ,           TYPES.Text            ,req.body.c8_9_4 ? req.body.c8_9_4 : null );
    request.addParameter( "c8_10_4" ,          TYPES.Text            ,req.body.c8_10_4 ? req.body.c8_10_4 : null );
    request.addParameter( "c8_11_4" ,          TYPES.Text            ,req.body.c8_11_4 ? req.body.c8_11_4 : null );
    request.addParameter( "c8_1_5" ,           TYPES.Text            ,req.body.c8_1_5 ? req.body.c8_1_5 : null );
    request.addParameter( "c8_2_5" ,           TYPES.Text            ,req.body.c8_2_5 ? req.body.c8_2_5 : null );
    request.addParameter( "c8_3_5" ,           TYPES.Text            ,req.body.c8_3_5 ? req.body.c8_3_5 : null );
    request.addParameter( "c8_4_5" ,           TYPES.Text            ,req.body.c8_4_5 ? req.body.c8_4_5 : null );
    request.addParameter( "c8_5_5" ,           TYPES.Text            ,req.body.c8_5_5 ? req.body.c8_5_5 : null );
    request.addParameter( "c8_6_5" ,           TYPES.Text            ,req.body.c8_6_5 ? req.body.c8_6_5 : null );
    request.addParameter( "c8_7_5" ,           TYPES.Text            ,req.body.c8_7_5 ? req.body.c8_7_5 : null );
    request.addParameter( "c8_8_5" ,           TYPES.Text            ,req.body.c8_8_5 ? req.body.c8_8_5 : null );
    request.addParameter( "c8_9_5" ,           TYPES.Text            ,req.body.c8_9_5 ? req.body.c8_9_5 : null );
    request.addParameter( "c8_10_5" ,          TYPES.Text            ,req.body.c8_10_5 ? req.body.c8_10_5 : null );
    request.addParameter( "c8_11_5" ,          TYPES.Text            ,req.body.c8_11_5 ? req.body.c8_11_5 : null );
    request.addParameter( "monedaDelProyecto", TYPES.Int             ,req.body.monedaDelProyecto ? req.body.monedaDelProyecto : null );
    request.addParameter( "d11_1_1 " ,         TYPES.Text            ,req.body.d11_1_1  ? req.body.d11_1_1  : null );
    request.addParameter( "d11_2_1 " ,         TYPES.Text            ,req.body.d11_2_1 ? req.body.d11_2_1 : null );
    request.addParameter( "d11_3_1 " ,         TYPES.Text            ,req.body.d11_3_1 ? req.body.d11_3_1  : null );
    request.addParameter( "d11_4_1" ,          TYPES.Text            ,req.body.d11_4_1 ? req.body.d11_4_1 : null );
    request.addParameter( "d11_5_1" ,          TYPES.Text            ,req.body.d11_5_1 ? req.body.d11_5_1 : null );
    request.addParameter( "d11_6_1 " ,         TYPES.Text            ,req.body.d11_6_1 ? req.body.d11_6_1  : null );
    request.addParameter( "d11_7_1" ,          TYPES.Text            ,req.body.d11_7_1 ? req.body.d11_7_1 : null );
    request.addParameter( "d11_8_1" ,          TYPES.Text            ,req.body.d11_8_1 ? req.body.d11_8_1 : null );
    request.addParameter( "d11_9_1 " ,         TYPES.Text            ,req.body.d11_9_1 ? req.body.d11_9_1  : null );
    request.addParameter( "d11_10_1" ,         TYPES.Text            ,req.body.d11_10_1? req.body.d11_10_1 : null );
    request.addParameter( "d11_11_1" ,         TYPES.Text            ,req.body.d11_11_1? req.body.d11_11_1 : null );
    request.addParameter( "d11_12_1" ,         TYPES.Text            ,req.body.d11_12_1? req.body.d11_12_1 : null );
    request.addParameter( "d11_1_2" ,          TYPES.Text            ,req.body.d11_1_2 ? req.body.d11_1_2 : null );
    request.addParameter( "d11_2_2" ,          TYPES.Text            ,req.body.d11_2_2 ? req.body.d11_2_2 : null );
    request.addParameter( "d11_3_2" ,          TYPES.Text            ,req.body.d11_3_2 ? req.body.d11_3_2 : null );
    request.addParameter( "d11_4_2" ,          TYPES.Text            ,req.body.d11_4_2 ? req.body.d11_4_2 : null );
    request.addParameter( "d11_5_2" ,          TYPES.Text            ,req.body.d11_5_2 ? req.body.d11_5_2 : null );
    request.addParameter( "d11_6_2" ,          TYPES.Text            ,req.body.d11_6_2 ? req.body.d11_6_2 : null );
    request.addParameter( "d11_7_2" ,          TYPES.Text            ,req.body.d11_7_2 ? req.body.d11_7_2 : null );
    request.addParameter( "d11_8_2" ,          TYPES.Text            ,req.body.d11_8_2 ? req.body.d11_8_2 : null );
    request.addParameter( "d11_9_2" ,          TYPES.Text            ,req.body.d11_9_2 ? req.body.d11_9_2 : null );
    request.addParameter( "d11_10_2" ,         TYPES.Text            ,req.body.d11_10_2? req.body.d11_10_2 : null );
    request.addParameter( "d11_11_2" ,         TYPES.Text            ,req.body.d11_11_2? req.body.d11_11_2 : null );
    request.addParameter( "d11_12_2" ,         TYPES.Text            ,req.body.d11_12_2? req.body.d11_12_2 : null );
    request.addParameter( "d11_1_3" ,          TYPES.Text            ,req.body.d11_1_3 ? req.body.d11_1_3 : null );
    request.addParameter( "d11_2_3" ,          TYPES.Text            ,req.body.d11_2_3 ? req.body.d11_2_3 : null );
    request.addParameter( "d11_3_3" ,          TYPES.Text            ,req.body.d11_3_3 ? req.body.d11_3_3 : null );
    request.addParameter( "d11_4_3" ,          TYPES.Text            ,req.body.d11_4_3 ? req.body.d11_4_3 : null );
    request.addParameter( "d11_5_3" ,          TYPES.Text            ,req.body.d11_5_3 ? req.body.d11_5_3 : null );
    request.addParameter( "d11_6_3" ,          TYPES.Text            ,req.body.d11_6_3 ? req.body.d11_6_3 : null );
    request.addParameter( "d11_7_3" ,          TYPES.Text            ,req.body.d11_7_3 ? req.body.d11_7_3 : null );
    request.addParameter( "d11_8_3" ,          TYPES.Text            ,req.body.d11_8_3 ? req.body.d11_8_3 : null );
    request.addParameter( "d11_9_3" ,          TYPES.Text            ,req.body.d11_9_3 ? req.body.d11_9_3 : null );
    request.addParameter( "d11_10_3" ,         TYPES.Text            ,req.body.d11_10_3? req.body.d11_10_3 : null );
    request.addParameter( "d11_11_3" ,         TYPES.Text            ,req.body.d11_11_3? req.body.d11_11_3 : null );
    request.addParameter( "d11_12_3" ,         TYPES.Text            ,req.body.d11_12_3? req.body.d11_12_3 : null );
    request.addParameter( "d11_1_4" ,          TYPES.Text            ,req.body.d11_1_4 ? req.body.d11_1_4 : null );
    request.addParameter( "d11_2_4" ,          TYPES.Text            ,req.body.d11_2_4 ? req.body.d11_2_4 : null );
    request.addParameter( "d11_3_4" ,          TYPES.Text            ,req.body.d11_3_4 ? req.body.d11_3_4 : null );
    request.addParameter( "d11_4_4" ,          TYPES.Text            ,req.body.d11_4_4 ? req.body.d11_4_4 : null );
    request.addParameter( "d11_5_4" ,          TYPES.Text            ,req.body.d11_5_4 ? req.body.d11_5_4 : null );
    request.addParameter( "d11_6_4" ,          TYPES.Text            ,req.body.d11_6_4 ? req.body.d11_6_4 : null );
    request.addParameter( "d11_7_4" ,          TYPES.Text            ,req.body.d11_7_4 ? req.body.d11_7_4 : null );
    request.addParameter( "d11_8_4" ,          TYPES.Text            ,req.body.d11_8_4 ? req.body.d11_8_4 : null );
    request.addParameter( "d11_9_4" ,          TYPES.Text            ,req.body.d11_9_4 ? req.body.d11_9_4 : null );
    request.addParameter( "d11_10_4" ,         TYPES.Text            ,req.body.d11_10_4? req.body.d11_10_4 : null );
    request.addParameter( "d11_11_4" ,         TYPES.Text            ,req.body.d11_11_4? req.body.d11_11_4 : null );
    request.addParameter( "d11_12_4" ,         TYPES.Text            ,req.body.d11_12_4? req.body.d11_12_4 : null );
    request.addParameter( "d11_1_5 " ,         TYPES.Text            ,req.body.d11_1_5 ? req.body.d11_1_5  : null );
    request.addParameter( "d11_2_5" ,          TYPES.Text            ,req.body.d11_2_5 ? req.body.d11_2_5 : null );
    request.addParameter( "d11_3_5 " ,         TYPES.Text            ,req.body.d11_3_5 ? req.body.d11_3_5  : null );
    request.addParameter( "d11_4_5" ,          TYPES.Text            ,req.body.d11_4_5 ? req.body.d11_4_5 : null );
    request.addParameter( "d11_5_5" ,          TYPES.Text            ,req.body.d11_5_5 ? req.body.d11_5_5 : null );
    request.addParameter( "d11_6_5 " ,         TYPES.Text            ,req.body.d11_6_5 ? req.body.d11_6_5  : null );
    request.addParameter( "d11_7_5" ,          TYPES.Text            ,req.body.d11_7_5 ? req.body.d11_7_5 : null );
    request.addParameter( "d11_8_5" ,          TYPES.Text            ,req.body.d11_8_5 ? req.body.d11_8_5 : null );
    request.addParameter( "d11_9_5 " ,         TYPES.Text            ,req.body.d11_9_5 ? req.body.d11_9_5  : null );
    request.addParameter( "d11_10_5" ,         TYPES.Text            ,req.body.d11_10_5? req.body.d11_10_5 : null );
    request.addParameter( "d11_11_5" ,         TYPES.Text            ,req.body.d11_11_5? req.body.d11_11_5 : null );
    request.addParameter( "d11_12_5" ,         TYPES.Text            ,req.body.d11_12_5? req.body.d11_12_5 : null );
    request.addParameter( "d12_1_1 " ,         TYPES.Text            ,req.body.d12_1_1 ? req.body.d12_1_1  : null );
    request.addParameter( "d12_2_1" ,          TYPES.Text            ,req.body.d12_2_1 ? req.body.d12_2_1 : null );
    request.addParameter( "d12_3_1 " ,         TYPES.Text            ,req.body.d12_3_1 ? req.body.d12_3_1  : null );
    request.addParameter( "d12_4_1" ,          TYPES.Text            ,req.body.d12_4_1 ? req.body.d12_4_1 : null );
    request.addParameter( "d12_5_1" ,          TYPES.Text            ,req.body.d12_5_1 ? req.body.d12_5_1 : null );
    request.addParameter( "d12_6_1 " ,         TYPES.Text            ,req.body.d12_6_1 ? req.body.d12_6_1  : null );
    request.addParameter( "d12_7_1" ,          TYPES.Text            ,req.body.d12_7_1 ? req.body.d12_7_1 : null );
    request.addParameter( "d12_8_1" ,          TYPES.Text            ,req.body.d12_8_1 ? req.body.d12_8_1 : null );
    request.addParameter( "d12_9_1 " ,         TYPES.Text            ,req.body.d12_9_1 ? req.body.d12_9_1  : null );
    request.addParameter( "d12_10_1" ,         TYPES.Text            ,req.body.d12_10_1? req.body.d12_10_1 : null );
    request.addParameter( "d12_1_2 " ,         TYPES.Text            ,req.body.d12_1_2 ? req.body.d12_1_2  : null );
    request.addParameter( "d12_2_2" ,          TYPES.Text            ,req.body.d12_2_2 ? req.body.d12_2_2 : null );
    request.addParameter( "d12_3_2 " ,         TYPES.Text            ,req.body.d12_3_2 ? req.body.d12_3_2  : null );
    request.addParameter( "d12_4_2" ,          TYPES.Text            ,req.body.d12_4_2 ? req.body.d12_4_2 : null );
    request.addParameter( "d12_5_2" ,          TYPES.Text            ,req.body.d12_5_2 ? req.body.d12_5_2 : null );
    request.addParameter( "d12_6_2 " ,         TYPES.Text            ,req.body.d12_6_2 ? req.body.d12_6_2  : null );
    request.addParameter( "d12_7_2" ,          TYPES.Text            ,req.body.d12_7_2 ? req.body.d12_7_2 : null );
    request.addParameter( "d12_8_2" ,          TYPES.Text            ,req.body.d12_8_2 ? req.body.d12_8_2 : null );
    request.addParameter( "d12_9_2 " ,         TYPES.Text            ,req.body.d12_9_2 ? req.body.d12_9_2  : null );
    request.addParameter( "d12_10_2" ,         TYPES.Text            ,req.body.d12_10_2? req.body.d12_10_2 : null );
    request.addParameter( "d12_1_3" ,          TYPES.Text            ,req.body.d12_1_3 ? req.body.d12_1_3 : null );
    request.addParameter( "d12_2_3" ,          TYPES.Text            ,req.body.d12_2_3 ? req.body.d12_2_3 : null );
    request.addParameter( "d12_3_3" ,          TYPES.Text            ,req.body.d12_3_3 ? req.body.d12_3_3 : null );
    request.addParameter( "d12_4_3" ,          TYPES.Text            ,req.body.d12_4_3 ? req.body.d12_4_3 : null );
    request.addParameter( "d12_5_3" ,          TYPES.Text            ,req.body.d12_5_3 ? req.body.d12_5_3 : null );
    request.addParameter( "d12_6_3" ,          TYPES.Text            ,req.body.d12_6_3 ? req.body.d12_6_3 : null );
    request.addParameter( "d12_7_3" ,          TYPES.Text            ,req.body.d12_7_3 ? req.body.d12_7_3 : null );
    request.addParameter( "d12_8_3" ,          TYPES.Text            ,req.body.d12_8_3 ? req.body.d12_8_3 : null );
    request.addParameter( "d12_9_3" ,          TYPES.Text            ,req.body.d12_9_3 ? req.body.d12_9_3 : null );
    request.addParameter( "d12_10_3" ,         TYPES.Text            ,req.body.d12_10_3? req.body.d12_10_3 : null );
    request.addParameter( "d12_1_4 " ,         TYPES.Text            ,req.body.d12_1_4 ? req.body.d12_1_4  : null );
    request.addParameter( "d12_2_4" ,          TYPES.Text            ,req.body.d12_2_4 ? req.body.d12_2_4 : null );
    request.addParameter( "d12_3_4 " ,         TYPES.Text            ,req.body.d12_3_4 ? req.body.d12_3_4  : null );
    request.addParameter( "d12_4_4" ,          TYPES.Text            ,req.body.d12_4_4 ? req.body.d12_4_4 : null );
    request.addParameter( "d12_5_4" ,          TYPES.Text            ,req.body.d12_5_4 ? req.body.d12_5_4 : null );
    request.addParameter( "d12_6_4 " ,         TYPES.Text            ,req.body.d12_6_4 ? req.body.d12_6_4  : null );
    request.addParameter( "d12_7_4" ,          TYPES.Text            ,req.body.d12_7_4 ? req.body.d12_7_4 : null );
    request.addParameter( "d12_8_4" ,          TYPES.Text            ,req.body.d12_8_4 ? req.body.d12_8_4 : null );
    request.addParameter( "d12_9_4 " ,         TYPES.Text            ,req.body.d12_9_4 ? req.body.d12_9_4  : null );
    request.addParameter( "d12_10_4" ,         TYPES.Text            ,req.body.d12_10_4? req.body.d12_10_4 : null );
    request.addParameter( "d12_1_5" ,          TYPES.Text            ,req.body.d12_1_5 ? req.body.d12_1_5 : null );
    request.addParameter( "d12_2_5" ,          TYPES.Text            ,req.body.d12_2_5 ? req.body.d12_2_5 : null );
    request.addParameter( "d12_3_5" ,          TYPES.Text            ,req.body.d12_3_5 ? req.body.d12_3_5 : null );
    request.addParameter( "d12_4_5" ,          TYPES.Text            ,req.body.d12_4_5 ? req.body.d12_4_5 : null );
    request.addParameter( "d12_5_5" ,          TYPES.Text            ,req.body.d12_5_5 ? req.body.d12_5_5 : null );
    request.addParameter( "d12_6_5" ,          TYPES.Text            ,req.body.d12_6_5 ? req.body.d12_6_5 : null );
    request.addParameter( "d12_7_5" ,          TYPES.Text            ,req.body.d12_7_5 ? req.body.d12_7_5 : null );
    request.addParameter( "d12_8_5" ,          TYPES.Text            ,req.body.d12_8_5 ? req.body.d12_8_5 : null );
    request.addParameter( "d12_9_5" ,          TYPES.Text            ,req.body.d12_9_5 ? req.body.d12_9_5 : null );
    request.addParameter( "d12_10_5" ,         TYPES.Text            ,req.body.d12_10_5? req.body.d12_10_5 : null );
    request.addParameter( "d13_1_1" ,          TYPES.Text            ,req.body.d13_1_1 ? req.body.d13_1_1 : null );
    request.addParameter( "d13_2_1" ,          TYPES.Text            ,req.body.d13_2_1 ? req.body.d13_2_1 : null );
    request.addParameter( "d13_3_1" ,          TYPES.Text            ,req.body.d13_3_1 ? req.body.d13_3_1 : null );
    request.addParameter( "d13_4_1" ,          TYPES.Text            ,req.body.d13_4_1 ? req.body.d13_4_1 : null );
    request.addParameter( "d13_5_1" ,          TYPES.Text            ,req.body.d13_5_1 ? req.body.d13_5_1 : null );
    request.addParameter( "d13_6_1" ,          TYPES.Text            ,req.body.d13_6_1 ? req.body.d13_6_1 : null );
    request.addParameter( "d13_7_1" ,          TYPES.Text            ,req.body.d13_7_1 ? req.body.d13_7_1 : null );
    request.addParameter( "d13_8_1" ,          TYPES.Text            ,req.body.d13_8_1 ? req.body.d13_8_1 : null );
    request.addParameter( "d13_9_1" ,          TYPES.Text            ,req.body.d13_9_1 ? req.body.d13_9_1 : null );
    request.addParameter( "d13_1_2" ,          TYPES.Text            ,req.body.d13_1_2 ? req.body.d13_1_2 : null );
    request.addParameter( "d13_2_2" ,          TYPES.Text            ,req.body.d13_2_2 ? req.body.d13_2_2 : null );
    request.addParameter( "d13_3_2" ,          TYPES.Text            ,req.body.d13_3_2 ? req.body.d13_3_2 : null );
    request.addParameter( "d13_4_2" ,          TYPES.Text            ,req.body.d13_4_2 ? req.body.d13_4_2 : null );
    request.addParameter( "d13_5_2" ,          TYPES.Text            ,req.body.d13_5_2 ? req.body.d13_5_2 : null );
    request.addParameter( "d13_6_2" ,          TYPES.Text            ,req.body.d13_6_2 ? req.body.d13_6_2 : null );
    request.addParameter( "d13_7_2" ,          TYPES.Text            ,req.body.d13_7_2 ? req.body.d13_7_2 : null );
    request.addParameter( "d13_8_2" ,          TYPES.Text            ,req.body.d13_8_2 ? req.body.d13_8_2 : null );
    request.addParameter( "d13_9_2" ,          TYPES.Text            ,req.body.d13_9_2 ? req.body.d13_9_2 : null );
    request.addParameter( "d13_1_3" ,          TYPES.Text            ,req.body.d13_1_3 ? req.body.d13_1_3 : null );
    request.addParameter( "d13_2_3" ,          TYPES.Text            ,req.body.d13_2_3 ? req.body.d13_2_3 : null );
    request.addParameter( "d13_3_3" ,          TYPES.Text            ,req.body.d13_3_3 ? req.body.d13_3_3 : null );
    request.addParameter( "d13_4_3" ,          TYPES.Text            ,req.body.d13_4_3 ? req.body.d13_4_3 : null );
    request.addParameter( "d13_5_3" ,          TYPES.Text            ,req.body.d13_5_3 ? req.body.d13_5_3 : null );
    request.addParameter( "d13_6_3" ,          TYPES.Text            ,req.body.d13_6_3 ? req.body.d13_6_3 : null );
    request.addParameter( "d13_7_3" ,          TYPES.Text            ,req.body.d13_7_3 ? req.body.d13_7_3 : null );
    request.addParameter( "d13_8_3" ,          TYPES.Text            ,req.body.d13_8_3 ? req.body.d13_8_3 : null );
    request.addParameter( "d13_9_3" ,          TYPES.Text            ,req.body.d13_9_3 ? req.body.d13_9_3 : null );
    request.addParameter( "d13_1_4" ,          TYPES.Text            ,req.body.d13_1_4 ? req.body.d13_1_4 : null );
    request.addParameter( "d13_2_4" ,          TYPES.Text            ,req.body.d13_2_4 ? req.body.d13_2_4 : null );
    request.addParameter( "d13_3_4" ,          TYPES.Text            ,req.body.d13_3_4 ? req.body.d13_3_4 : null );
    request.addParameter( "d13_4_4" ,          TYPES.Text            ,req.body.d13_4_4 ? req.body.d13_4_4 : null );
    request.addParameter( "d13_5_4" ,          TYPES.Text            ,req.body.d13_5_4 ? req.body.d13_5_4 : null );
    request.addParameter( "d13_6_4" ,          TYPES.Text            ,req.body.d13_6_4 ? req.body.d13_6_4 : null );
    request.addParameter( "d13_7_4" ,          TYPES.Text            ,req.body.d13_7_4 ? req.body.d13_7_4 : null );
    request.addParameter( "d13_8_4" ,          TYPES.Text            ,req.body.d13_8_4 ? req.body.d13_8_4 : null );
    request.addParameter( "d13_9_4" ,          TYPES.Text            ,req.body.d13_9_4 ? req.body.d13_9_4 : null );
    request.addParameter( "d13_1_5" ,          TYPES.Text            ,req.body.d13_1_5 ? req.body.d13_1_5 : null );
    request.addParameter( "d13_2_5" ,          TYPES.Text            ,req.body.d13_2_5 ? req.body.d13_2_5 : null );
    request.addParameter( "d13_3_5 " ,          TYPES.Text            ,req.body.d13_3_5 ? req.body.d13_3_5  : null );
    request.addParameter( "d13_4_5" ,          TYPES.Text            ,req.body.d13_4_5 ? req.body.d13_4_5 : null );
    request.addParameter( "d13_5_5" ,          TYPES.Text            ,req.body.d13_5_5 ? req.body.d13_5_5 : null );
    request.addParameter( "d13_6_5 " ,          TYPES.Text            ,req.body.d13_6_5 ? req.body.d13_6_5  : null );
    request.addParameter( "d13_7_5" ,          TYPES.Text            ,req.body.d13_7_5 ? req.body.d13_7_5 : null );
    request.addParameter( "d13_8_5" ,          TYPES.Text            ,req.body.d13_8_5 ? req.body.d13_8_5 : null );
    request.addParameter( "d13_9_5 " ,          TYPES.Text            ,req.body.d13_9_5  ? req.body.d13_9_5  : null );
    request.addParameter( "d14_1_1" ,          TYPES.Text            ,req.body.d14_1_1 ? req.body.d14_1_1 : null );
    request.addParameter( "d14_2_1" ,          TYPES.Text            ,req.body.d14_2_1 ? req.body.d14_2_1 : null );
    request.addParameter( "d14_3_1" ,          TYPES.Text            ,req.body.d14_3_1 ? req.body.d14_3_1 : null );
    request.addParameter( "d14_4_1" ,          TYPES.Text            ,req.body.d14_4_1 ? req.body.d14_4_1 : null );
    request.addParameter( "d14_5_1" ,          TYPES.Text            ,req.body.d14_5_1 ? req.body.d14_5_1 : null );
    request.addParameter( "d14_6_1" ,          TYPES.Text            ,req.body.d14_6_1 ? req.body.d14_6_1 : null );
    request.addParameter( "d14_7_1" ,          TYPES.Text            ,req.body.d14_7_1 ? req.body.d14_7_1 : null );
    request.addParameter( "d14_8_1" ,          TYPES.Text            ,req.body.d14_8_1 ? req.body.d14_8_1 : null );
    request.addParameter( "d14_9_1" ,          TYPES.Text            ,req.body.d14_9_1 ? req.body.d14_9_1 : null );
    request.addParameter( "d14_1_2" ,          TYPES.Text            ,req.body.d14_1_2 ? req.body.d14_1_2 : null );
    request.addParameter( "d14_2_2" ,          TYPES.Text            ,req.body.d14_2_2 ? req.body.d14_2_2 : null );
    request.addParameter( "d14_3_2" ,          TYPES.Text            ,req.body.d14_3_2 ? req.body.d14_3_2 : null );
    request.addParameter( "d14_4_2" ,          TYPES.Text            ,req.body.d14_4_2 ? req.body.d14_4_2 : null );
    request.addParameter( "d14_5_2" ,          TYPES.Text            ,req.body.d14_5_2 ? req.body.d14_5_2 : null );
    request.addParameter( "d14_6_2" ,          TYPES.Text            ,req.body.d14_6_2 ? req.body.d14_6_2 : null );
    request.addParameter( "d14_7_2" ,          TYPES.Text            ,req.body.d14_7_2 ? req.body.d14_7_2 : null );
    request.addParameter( "d14_8_2" ,          TYPES.Text            ,req.body.d14_8_2 ? req.body.d14_8_2 : null );
    request.addParameter( "d14_9_2" ,          TYPES.Text            ,req.body.d14_9_2 ? req.body.d14_9_2 : null );
    request.addParameter( "d14_1_3" ,          TYPES.Text            ,req.body.d14_1_3 ? req.body.d14_1_3 : null );
    request.addParameter( "d14_2_3" ,          TYPES.Text            ,req.body.d14_2_3 ? req.body.d14_2_3 : null );
    request.addParameter( "d14_3_3" ,          TYPES.Text            ,req.body.d14_3_3 ? req.body.d14_3_3 : null );
    request.addParameter( "d14_4_3" ,          TYPES.Text            ,req.body.d14_4_3 ? req.body.d14_4_3 : null );
    request.addParameter( "d14_5_3" ,          TYPES.Text            ,req.body.d14_5_3 ? req.body.d14_5_3 : null );
    request.addParameter( "d14_6_3" ,          TYPES.Text            ,req.body.d14_6_3 ? req.body.d14_6_3 : null );
    request.addParameter( "d14_7_3" ,          TYPES.Text            ,req.body.d14_7_3 ? req.body.d14_7_3 : null );
    request.addParameter( "d14_8_3" ,          TYPES.Text            ,req.body.d14_8_3 ? req.body.d14_8_3 : null );
    request.addParameter( "d14_9_3" ,          TYPES.Text            ,req.body.d14_9_3 ? req.body.d14_9_3 : null );
    request.addParameter( "d14_1_4" ,          TYPES.Text            ,req.body.d14_1_4 ? req.body.d14_1_4 : null );
    request.addParameter( "d14_2_4" ,          TYPES.Text            ,req.body.d14_2_4 ? req.body.d14_2_4 : null );
    request.addParameter( "d14_3_4" ,          TYPES.Text            ,req.body.d14_3_4 ? req.body.d14_3_4 : null );
    request.addParameter( "d14_4_4" ,          TYPES.Text            ,req.body.d14_4_4 ? req.body.d14_4_4 : null );
    request.addParameter( "d14_5_4" ,          TYPES.Text            ,req.body.d14_5_4 ? req.body.d14_5_4 : null );
    request.addParameter( "d14_6_4" ,          TYPES.Text            ,req.body.d14_6_4 ? req.body.d14_6_4 : null );
    request.addParameter( "d14_7_4" ,          TYPES.Text            ,req.body.d14_7_4 ? req.body.d14_7_4 : null );
    request.addParameter( "d14_8_4" ,          TYPES.Text            ,req.body.d14_8_4 ? req.body.d14_8_4 : null );
    request.addParameter( "d14_9_4" ,          TYPES.Text            ,req.body.d14_9_4 ? req.body.d14_9_4 : null );
    request.addParameter( "d14_1_5" ,          TYPES.Text            ,req.body.d14_1_5 ? req.body.d14_1_5 : null );
    request.addParameter( "d14_2_5" ,          TYPES.Text            ,req.body.d14_2_5 ? req.body.d14_2_5 : null );
    request.addParameter( "d14_3_5" ,          TYPES.Text            ,req.body.d14_3_5 ? req.body.d14_3_5 : null );
    request.addParameter( "d14_4_5" ,          TYPES.Text            ,req.body.d14_4_5 ? req.body.d14_4_5 : null );
    request.addParameter( "d14_5_5" ,          TYPES.Text            ,req.body.d14_5_5 ? req.body.d14_5_5 : null );
    request.addParameter( "d14_6_5" ,          TYPES.Text            ,req.body.d14_6_5 ? req.body.d14_6_5 : null );
    request.addParameter( "d14_7_5" ,          TYPES.Text            ,req.body.d14_7_5 ? req.body.d14_7_5 : null );
    request.addParameter( "d14_8_5" ,          TYPES.Text            ,req.body.d14_8_5 ? req.body.d14_8_5 : null );
    request.addParameter( "d14_9_5" ,          TYPES.Text            ,req.body.d14_9_5 ? req.body.d14_9_5 : null );
    request.addParameter( "d15_1_1 " ,          TYPES.Text            ,req.body.d15_1_1  ? req.body.d15_1_1  : null );
    request.addParameter( "d15_2_1" ,          TYPES.Text            ,req.body.d15_2_1 ? req.body.d15_2_1 : null );
    request.addParameter( "d15_3_1 " ,          TYPES.Text            ,req.body.d15_3_1  ? req.body.d15_3_1  : null );
    request.addParameter( "d15_4_1" ,          TYPES.Text            ,req.body.d15_4_1 ? req.body.d15_4_1 : null );
    request.addParameter( "d15_5_1" ,          TYPES.Text            ,req.body.d15_5_1 ? req.body.d15_5_1 : null );
    request.addParameter( "d15_6_1 " ,          TYPES.Text            ,req.body.d15_6_1  ? req.body.d15_6_1  : null );
    request.addParameter( "d15_7_1" ,          TYPES.Text            ,req.body.d15_7_1 ? req.body.d15_7_1 : null );
    request.addParameter( "d15_8_1" ,          TYPES.Text            ,req.body.d15_8_1 ? req.body.d15_8_1 : null );
    request.addParameter( "d15_9_1 " ,          TYPES.Text            ,req.body.d15_9_1  ? req.body.d15_9_1  : null );
    request.addParameter( "d15_10_1" ,          TYPES.Text            ,req.body.d15_10_1 ? req.body.d15_10_1 : null );
    request.addParameter( "d15_11_1" ,          TYPES.Text            ,req.body.d15_11_1 ? req.body.d15_11_1 : null );
    request.addParameter( "d15_12_1" ,          TYPES.Text            ,req.body.d15_12_1 ? req.body.d15_12_1 : null );
    request.addParameter( "d15_13_1" ,          TYPES.Text            ,req.body.d15_13_1 ? req.body.d15_13_1 : null );
    request.addParameter( "d15_1_2 " ,          TYPES.Text            ,req.body.d15_1_2  ? req.body.d15_1_2  : null );
    request.addParameter( "d15_2_2" ,          TYPES.Text            ,req.body.d15_2_2 ? req.body.d15_2_2 : null );
    request.addParameter( "d15_3_2 " ,          TYPES.Text            ,req.body.d15_3_2  ? req.body.d15_3_2  : null );
    request.addParameter( "d15_4_2" ,          TYPES.Text            ,req.body.d15_4_2 ? req.body.d15_4_2 : null );
    request.addParameter( "d15_5_2" ,          TYPES.Text            ,req.body.d15_5_2 ? req.body.d15_5_2 : null );
    request.addParameter( "d15_6_2 " ,          TYPES.Text            ,req.body.d15_6_2  ? req.body.d15_6_2  : null );
    request.addParameter( "d15_7_2" ,          TYPES.Text            ,req.body.d15_7_2 ? req.body.d15_7_2 : null );
    request.addParameter( "d15_8_2" ,          TYPES.Text            ,req.body.d15_8_2 ? req.body.d15_8_2 : null );
    request.addParameter( "d15_9_2 " ,          TYPES.Text            ,req.body.d15_9_2  ? req.body.d15_9_2  : null );
    request.addParameter( "d15_10_2" ,          TYPES.Text            ,req.body.d15_10_2 ? req.body.d15_10_2 : null );
    request.addParameter( "d15_11_2" ,          TYPES.Text            ,req.body.d15_11_2 ? req.body.d15_11_2 : null );
    request.addParameter( "d15_12_2" ,          TYPES.Text            ,req.body.d15_12_2 ? req.body.d15_12_2 : null );
    request.addParameter( "d15_13_2" ,          TYPES.Text            ,req.body.d15_13_2 ? req.body.d15_13_2 : null );
    request.addParameter( "d15_1_3" ,          TYPES.Text            ,req.body.d15_1_3 ? req.body.d15_1_3 : null );
    request.addParameter( "d15_2_3" ,          TYPES.Text            ,req.body.d15_2_3 ? req.body.d15_2_3 : null );
    request.addParameter( "d15_3_3" ,          TYPES.Text            ,req.body.d15_3_3 ? req.body.d15_3_3 : null );
    request.addParameter( "d15_4_3" ,          TYPES.Text            ,req.body.d15_4_3 ? req.body.d15_4_3 : null );
    request.addParameter( "d15_5_3" ,          TYPES.Text            ,req.body.d15_5_3 ? req.body.d15_5_3 : null );
    request.addParameter( "d15_6_3" ,          TYPES.Text            ,req.body.d15_6_3 ? req.body.d15_6_3 : null );
    request.addParameter( "d15_7_3" ,          TYPES.Text            ,req.body.d15_7_3 ? req.body.d15_7_3 : null );
    request.addParameter( "d15_8_3" ,          TYPES.Text            ,req.body.d15_8_3 ? req.body.d15_8_3 : null );
    request.addParameter( "d15_9_3" ,          TYPES.Text            ,req.body.d15_9_3 ? req.body.d15_9_3 : null );
    request.addParameter( "d15_10_3" ,         TYPES.Text           ,req.body.d15_10_3 ? req.body.d15_10_3 : null );
    request.addParameter( "d15_11_3" ,         TYPES.Text           ,req.body.d15_11_3 ? req.body.d15_11_3 : null );
    request.addParameter( "d15_12_3" ,         TYPES.Text           ,req.body.d15_12_3 ? req.body.d15_12_3 : null );
    request.addParameter( "d15_13_3" ,         TYPES.Text           ,req.body.d15_13_3 ? req.body.d15_13_3 : null );
    request.addParameter( "d15_1_4 " ,         TYPES.Text            ,req.body.d15_1_4  ? req.body.d15_1_4  : null );
    request.addParameter( "d15_2_4" ,          TYPES.Text            ,req.body.d15_2_4 ? req.body.d15_2_4 : null );
    request.addParameter( "d15_3_4 " ,         TYPES.Text            ,req.body.d15_3_4  ? req.body.d15_3_4  : null );
    request.addParameter( "d15_4_4" ,          TYPES.Text            ,req.body.d15_4_4 ? req.body.d15_4_4 : null );
    request.addParameter( "d15_5_4" ,          TYPES.Text            ,req.body.d15_5_4 ? req.body.d15_5_4 : null );
    request.addParameter( "d15_6_4 " ,         TYPES.Text            ,req.body.d15_6_4  ? req.body.d15_6_4  : null );
    request.addParameter( "d15_7_4" ,          TYPES.Text            ,req.body.d15_7_4 ? req.body.d15_7_4 : null );
    request.addParameter( "d15_8_4" ,          TYPES.Text            ,req.body.d15_8_4 ? req.body.d15_8_4 : null );
    request.addParameter( "d15_9_4 " ,         TYPES.Text            ,req.body.d15_9_4  ? req.body.d15_9_4  : null );
    request.addParameter( "d15_10_4" ,         TYPES.Text           ,req.body.d15_10_4 ? req.body.d15_10_4 : null );
    request.addParameter( "d15_11_4" ,         TYPES.Text           ,req.body.d15_11_4 ? req.body.d15_11_4 : null );
    request.addParameter( "d15_12_4" ,         TYPES.Text           ,req.body.d15_12_4 ? req.body.d15_12_4 : null );
    request.addParameter( "d15_13_4" ,         TYPES.Text           ,req.body.d15_13_4 ? req.body.d15_13_4 : null );
    request.addParameter( "d15_1_5" ,          TYPES.Text            ,req.body.d15_1_5 ? req.body.d15_1_5 : null );
    request.addParameter( "d15_2_5" ,          TYPES.Text            ,req.body.d15_2_5 ? req.body.d15_2_5 : null );
    request.addParameter( "d15_3_5" ,          TYPES.Text            ,req.body.d15_3_5 ? req.body.d15_3_5 : null );
    request.addParameter( "d15_4_5" ,          TYPES.Text            ,req.body.d15_4_5 ? req.body.d15_4_5 : null );
    request.addParameter( "d15_5_5" ,          TYPES.Text            ,req.body.d15_5_5 ? req.body.d15_5_5 : null );
    request.addParameter( "d15_6_5" ,          TYPES.Text            ,req.body.d15_6_5 ? req.body.d15_6_5 : null );
    request.addParameter( "d15_7_5" ,          TYPES.Text            ,req.body.d15_7_5 ? req.body.d15_7_5 : null );
    request.addParameter( "d15_8_5" ,          TYPES.Text            ,req.body.d15_8_5 ? req.body.d15_8_5 : null );
    request.addParameter( "d15_9_5" ,          TYPES.Text            ,req.body.d15_9_5 ? req.body.d15_9_5 : null );
    request.addParameter( "d15_10_5" ,         TYPES.Text           ,req.body.d15_10_5 ? req.body.d15_10_5 : null );
    request.addParameter( "d15_11_5" ,         TYPES.Text           ,req.body.d15_11_5 ? req.body.d15_11_5 : null );
    request.addParameter( "d15_12_5" ,         TYPES.Text           ,req.body.d15_12_5 ? req.body.d15_12_5 : null );
    request.addParameter( "d15_13_5" ,         TYPES.Text           ,req.body.d15_13_5 ? req.body.d15_13_5 : null );
    request.addParameter( "d16_1_1" ,          TYPES.Text            ,req.body.d16_1_1 ? req.body.d16_1_1 : null );
    request.addParameter( "d16_2_1" ,          TYPES.Text            ,req.body.d16_2_1 ? req.body.d16_2_1 : null );
    request.addParameter( "d16_3_1" ,          TYPES.Text            ,req.body.d16_3_1 ? req.body.d16_3_1 : null );
    request.addParameter( "d16_4_1" ,          TYPES.Text            ,req.body.d16_4_1 ? req.body.d16_4_1 : null );
    request.addParameter( "d16_5_1" ,          TYPES.Text            ,req.body.d16_5_1 ? req.body.d16_5_1 : null );
    request.addParameter( "d16_6_1" ,          TYPES.Text            ,req.body.d16_6_1 ? req.body.d16_6_1 : null );
    request.addParameter( "d16_7_1" ,          TYPES.Text            ,req.body.d16_7_1 ? req.body.d16_7_1 : null );
    request.addParameter( "d16_8_1" ,          TYPES.Text            ,req.body.d16_8_1 ? req.body.d16_8_1 : null );
    request.addParameter( "d16_9_1" ,          TYPES.Text            ,req.body.d16_9_1 ? req.body.d16_9_1 : null );
    request.addParameter( "d16_10_1" ,         TYPES.Text           ,req.body.d16_10_1 ? req.body.d16_10_1 : null );
    request.addParameter( "d16_11_1" ,         TYPES.Text           ,req.body.d16_11_1 ? req.body.d16_11_1 : null );
    request.addParameter( "d16_12_1" ,         TYPES.Text           ,req.body.d16_12_1 ? req.body.d16_12_1 : null );
    request.addParameter( "d16_1_2" ,          TYPES.Text            ,req.body.d16_1_2 ? req.body.d16_1_2 : null );
    request.addParameter( "d16_2_2" ,          TYPES.Text            ,req.body.d16_2_2 ? req.body.d16_2_2 : null );
    request.addParameter( "d16_3_2" ,          TYPES.Text            ,req.body.d16_3_2 ? req.body.d16_3_2 : null );
    request.addParameter( "d16_4_2" ,          TYPES.Text            ,req.body.d16_4_2 ? req.body.d16_4_2 : null );
    request.addParameter( "d16_5_2" ,          TYPES.Text            ,req.body.d16_5_2 ? req.body.d16_5_2 : null );
    request.addParameter( "d16_6_2" ,          TYPES.Text            ,req.body.d16_6_2 ? req.body.d16_6_2 : null );
    request.addParameter( "d16_7_2" ,          TYPES.Text            ,req.body.d16_7_2 ? req.body.d16_7_2 : null );
    request.addParameter( "d16_8_2" ,          TYPES.Text            ,req.body.d16_8_2 ? req.body.d16_8_2 : null );
    request.addParameter( "d16_9_2" ,          TYPES.Text            ,req.body.d16_9_2 ? req.body.d16_9_2 : null );
    request.addParameter( "d16_10_2" ,         TYPES.Text           ,req.body.d16_10_2 ? req.body.d16_10_2 : null );
    request.addParameter( "d16_11_2" ,         TYPES.Text           ,req.body.d16_11_2 ? req.body.d16_11_2 : null );
    request.addParameter( "d16_12_2" ,         TYPES.Text           ,req.body.d16_12_2 ? req.body.d16_12_2 : null );
    request.addParameter( "d16_1_3" ,          TYPES.Text            ,req.body.d16_1_3 ? req.body.d16_1_3 : null );
    request.addParameter( "d16_2_3" ,          TYPES.Text            ,req.body.d16_2_3 ? req.body.d16_2_3 : null );
    request.addParameter( "d16_3_3" ,          TYPES.Text            ,req.body.d16_3_3 ? req.body.d16_3_3 : null );
    request.addParameter( "d16_4_3" ,          TYPES.Text            ,req.body.d16_4_3 ? req.body.d16_4_3 : null );
    request.addParameter( "d16_5_3" ,          TYPES.Text            ,req.body.d16_5_3 ? req.body.d16_5_3 : null );
    request.addParameter( "d16_6_3" ,          TYPES.Text            ,req.body.d16_6_3 ? req.body.d16_6_3 : null );
    request.addParameter( "d16_7_3" ,          TYPES.Text            ,req.body.d16_7_3 ? req.body.d16_7_3 : null );
    request.addParameter( "d16_8_3" ,          TYPES.Text            ,req.body.d16_8_3 ? req.body.d16_8_3 : null );
    request.addParameter( "d16_9_3" ,          TYPES.Text            ,req.body.d16_9_3 ? req.body.d16_9_3 : null );
    request.addParameter( "d16_10_3" ,         TYPES.Text           ,req.body.d16_10_3 ? req.body.d16_10_3 : null );
    request.addParameter( "d16_11_3" ,         TYPES.Text           ,req.body.d16_11_3 ? req.body.d16_11_3 : null );
    request.addParameter( "d16_12_3" ,         TYPES.Text           ,req.body.d16_12_3 ? req.body.d16_12_3 : null );
    request.addParameter( "d16_1_4" ,          TYPES.Text            ,req.body.d16_1_4 ? req.body.d16_1_4 : null );
    request.addParameter( "d16_2_4" ,          TYPES.Text            ,req.body.d16_2_4 ? req.body.d16_2_4 : null );
    request.addParameter( "d16_3_4" ,          TYPES.Text            ,req.body.d16_3_4 ? req.body.d16_3_4 : null );
    request.addParameter( "d16_4_4" ,          TYPES.Text            ,req.body.d16_4_4 ? req.body.d16_4_4 : null );
    request.addParameter( "d16_5_4" ,          TYPES.Text            ,req.body.d16_5_4 ? req.body.d16_5_4 : null );
    request.addParameter( "d16_6_4" ,          TYPES.Text            ,req.body.d16_6_4 ? req.body.d16_6_4 : null );
    request.addParameter( "d16_7_4" ,          TYPES.Text            ,req.body.d16_7_4 ? req.body.d16_7_4 : null );
    request.addParameter( "d16_8_4" ,          TYPES.Text            ,req.body.d16_8_4 ? req.body.d16_8_4 : null );
    request.addParameter( "d16_9_4" ,          TYPES.Text            ,req.body.d16_9_4 ? req.body.d16_9_4 : null );
    request.addParameter( "d16_10_4" ,         TYPES.Text           ,req.body.d16_10_4 ? req.body.d16_10_4 : null );
    request.addParameter( "d16_11_4" ,         TYPES.Text           ,req.body.d16_11_4 ? req.body.d16_11_4 : null );
    request.addParameter( "d16_12_4" ,         TYPES.Text           ,req.body.d16_12_4 ? req.body.d16_12_4 : null );
    request.addParameter( "d16_1_5" ,          TYPES.Text            ,req.body.d16_1_5 ? req.body.d16_1_5 : null );
    request.addParameter( "d16_2_5" ,          TYPES.Text            ,req.body.d16_2_5 ? req.body.d16_2_5 : null );
    request.addParameter( "d16_3_5" ,          TYPES.Text            ,req.body.d16_3_5 ? req.body.d16_3_5 : null );
    request.addParameter( "d16_4_5" ,          TYPES.Text            ,req.body.d16_4_5 ? req.body.d16_4_5 : null );
    request.addParameter( "d16_5_5" ,          TYPES.Text            ,req.body.d16_5_5 ? req.body.d16_5_5 : null );
    request.addParameter( "d16_6_5" ,          TYPES.Text            ,req.body.d16_6_5 ? req.body.d16_6_5 : null );
    request.addParameter( "d16_7_5" ,          TYPES.Text            ,req.body.d16_7_5 ? req.body.d16_7_5 : null );
    request.addParameter( "d16_8_5" ,          TYPES.Text            ,req.body.d16_8_5 ? req.body.d16_8_5 : null );
    request.addParameter( "d16_9_5" ,          TYPES.Text            ,req.body.d16_9_5 ? req.body.d16_9_5 : null );
    request.addParameter( "d16_10_5" ,         TYPES.Text           ,req.body.d16_10_5 ? req.body.d16_10_5 : null );
    request.addParameter( "d16_11_5" ,         TYPES.Text           ,req.body.d16_11_5 ? req.body.d16_11_5 : null );
    request.addParameter( "d16_12_5" ,         TYPES.Text           ,req.body.d16_12_5 ? req.body.d16_12_5 : null );
    request.addParameter( "d17_1_1" ,          TYPES.Text            ,req.body.d17_1_1 ? req.body.d17_1_1 : null );
    request.addParameter( "d17_2_1" ,          TYPES.Text            ,req.body.d17_2_1 ? req.body.d17_2_1 : null );
    request.addParameter( "d17_3_1" ,          TYPES.Text            ,req.body.d17_3_1 ? req.body.d17_3_1 : null );
    request.addParameter( "d17_4_1" ,          TYPES.Text            ,req.body.d17_4_1 ? req.body.d17_4_1 : null );
    request.addParameter( "d17_5_1" ,          TYPES.Text            ,req.body.d17_5_1 ? req.body.d17_5_1 : null );
    request.addParameter( "d17_6_1" ,          TYPES.Text            ,req.body.d17_6_1 ? req.body.d17_6_1 : null );
    request.addParameter( "d17_7_1" ,          TYPES.Text            ,req.body.d17_7_1 ? req.body.d17_7_1 : null );
    request.addParameter( "d17_8_1" ,          TYPES.Text            ,req.body.d17_8_1 ? req.body.d17_8_1 : null );
    request.addParameter( "d17_9_1" ,          TYPES.Text            ,req.body.d17_9_1 ? req.body.d17_9_1 : null );
    request.addParameter( "d17_10_1" ,         TYPES.Text           ,req.body.d17_10_1 ? req.body.d17_10_1 : null );
    request.addParameter( "d17_1_2" ,          TYPES.Text            ,req.body.d17_1_2 ? req.body.d17_1_2 : null );
    request.addParameter( "d17_2_2" ,          TYPES.Text            ,req.body.d17_2_2 ? req.body.d17_2_2 : null );
    request.addParameter( "d17_3_2" ,          TYPES.Text            ,req.body.d17_3_2 ? req.body.d17_3_2 : null );
    request.addParameter( "d17_4_2" ,          TYPES.Text            ,req.body.d17_4_2 ? req.body.d17_4_2 : null );
    request.addParameter( "d17_5_2" ,          TYPES.Text            ,req.body.d17_5_2 ? req.body.d17_5_2 : null );
    request.addParameter( "d17_6_2" ,          TYPES.Text            ,req.body.d17_6_2 ? req.body.d17_6_2 : null );
    request.addParameter( "d17_7_2" ,          TYPES.Text            ,req.body.d17_7_2 ? req.body.d17_7_2 : null );
    request.addParameter( "d17_8_2" ,          TYPES.Text            ,req.body.d17_8_2 ? req.body.d17_8_2 : null );
    request.addParameter( "d17_9_2" ,          TYPES.Text            ,req.body.d17_9_2 ? req.body.d17_9_2 : null );
    request.addParameter( "d17_10_2" ,         TYPES.Text           ,req.body.d17_10_2 ? req.body.d17_10_2 : null );
    request.addParameter( "d17_1_3" ,          TYPES.Text            ,req.body.d17_1_3 ? req.body.d17_1_3 : null );
    request.addParameter( "d17_2_3" ,          TYPES.Text            ,req.body.d17_2_3 ? req.body.d17_2_3 : null );
    request.addParameter( "d17_3_3" ,          TYPES.Text            ,req.body.d17_3_3 ? req.body.d17_3_3 : null );
    request.addParameter( "d17_4_3" ,          TYPES.Text            ,req.body.d17_4_3 ? req.body.d17_4_3 : null );
    request.addParameter( "d17_5_3" ,          TYPES.Text            ,req.body.d17_5_3 ? req.body.d17_5_3 : null );
    request.addParameter( "d17_6_3" ,          TYPES.Text            ,req.body.d17_6_3 ? req.body.d17_6_3 : null );
    request.addParameter( "d17_7_3" ,          TYPES.Text            ,req.body.d17_7_3 ? req.body.d17_7_3 : null );
    request.addParameter( "d17_8_3" ,          TYPES.Text            ,req.body.d17_8_3 ? req.body.d17_8_3 : null );
    request.addParameter( "d17_9_3" ,          TYPES.Text            ,req.body.d17_9_3 ? req.body.d17_9_3 : null );
    request.addParameter( "d17_10_3" ,         TYPES.Text           ,req.body.d17_10_3 ? req.body.d17_10_3 : null );
    request.addParameter( "d17_1_4" ,          TYPES.Text            ,req.body.d17_1_4  ? req.body.d17_1_4  : null );
    request.addParameter( "d17_2_4" ,          TYPES.Text            ,req.body.d17_2_4 ? req.body.d17_2_4 : null );
    request.addParameter( "d17_3_4" ,          TYPES.Text            ,req.body.d17_3_4  ? req.body.d17_3_4  : null );
    request.addParameter( "d17_4_4" ,          TYPES.Text            ,req.body.d17_4_4 ? req.body.d17_4_4 : null );
    request.addParameter( "d17_5_4" ,          TYPES.Text            ,req.body.d17_5_4 ? req.body.d17_5_4 : null );
    request.addParameter( "d17_6_4" ,          TYPES.Text            ,req.body.d17_6_4  ? req.body.d17_6_4  : null );
    request.addParameter( "d17_7_4" ,          TYPES.Text            ,req.body.d17_7_4 ? req.body.d17_7_4 : null );
    request.addParameter( "d17_8_4" ,          TYPES.Text            ,req.body.d17_8_4 ? req.body.d17_8_4 : null );
    request.addParameter( "d17_9_4" ,          TYPES.Text            ,req.body.d17_9_4  ? req.body.d17_9_4  : null );
    request.addParameter( "d17_10_4" ,         TYPES.Text           ,req.body.d17_10_4 ? req.body.d17_10_4 : null );
    request.addParameter( "d17_1_5" ,          TYPES.Text            ,req.body.d17_1_5  ? req.body.d17_1_5  : null );
    request.addParameter( "d17_2_5" ,          TYPES.Text            ,req.body.d17_2_5 ? req.body.d17_2_5 : null );
    request.addParameter( "d17_3_5" ,          TYPES.Text            ,req.body.d17_3_5  ? req.body.d17_3_5  : null );
    request.addParameter( "d17_4_5" ,          TYPES.Text            ,req.body.d17_4_5 ? req.body.d17_4_5 : null );
    request.addParameter( "d17_5_5" ,          TYPES.Text            ,req.body.d17_5_5 ? req.body.d17_5_5 : null );
    request.addParameter( "d17_6_5" ,          TYPES.Text            ,req.body.d17_6_5  ? req.body.d17_6_5  : null );
    request.addParameter( "d17_7_5" ,          TYPES.Text            ,req.body.d17_7_5 ? req.body.d17_7_5 : null );
    request.addParameter( "d17_8_5" ,          TYPES.Text            ,req.body.d17_8_5 ? req.body.d17_8_5 : null );
    request.addParameter( "d17_9_5" ,          TYPES.Text            ,req.body.d17_9_5  ? req.body.d17_9_5  : null );
    request.addParameter( "d17_10_5" ,         TYPES.Text           ,req.body.d17_10_5 ? req.body.d17_10_5 : null );
    request.addParameter( "d18_1_1" ,          TYPES.Text            ,req.body.d18_1_1  ? req.body.d18_1_1  : null );
    request.addParameter( "d18_2_1" ,          TYPES.Text            ,req.body.d18_2_1 ? req.body.d18_2_1 : null );
    request.addParameter( "d18_3_1" ,          TYPES.Text            ,req.body.d18_3_1  ? req.body.d18_3_1  : null );
    request.addParameter( "d18_4_1" ,          TYPES.Text            ,req.body.d18_4_1 ? req.body.d18_4_1 : null );
    request.addParameter( "d18_5_1" ,          TYPES.Text            ,req.body.d18_5_1 ? req.body.d18_5_1 : null );
    request.addParameter( "d18_6_1" ,          TYPES.Text            ,req.body.d18_6_1  ? req.body.d18_6_1  : null );
    request.addParameter( "d18_7_1" ,          TYPES.Text            ,req.body.d18_7_1 ? req.body.d18_7_1 : null );
    request.addParameter( "d18_8_1" ,          TYPES.Text            ,req.body.d18_8_1 ? req.body.d18_8_1 : null );
    request.addParameter( "d18_9_1" ,          TYPES.Text            ,req.body.d18_9_1  ? req.body.d18_9_1  : null );
    request.addParameter( "d18_1_2" ,          TYPES.Text            ,req.body.d18_1_2  ? req.body.d18_1_2  : null );
    request.addParameter( "d18_2_2" ,          TYPES.Text            ,req.body.d18_2_2 ? req.body.d18_2_2 : null );
    request.addParameter( "d18_3_2" ,          TYPES.Text            ,req.body.d18_3_2  ? req.body.d18_3_2  : null );
    request.addParameter( "d18_4_2" ,          TYPES.Text            ,req.body.d18_4_2 ? req.body.d18_4_2 : null );
    request.addParameter( "d18_5_2" ,          TYPES.Text            ,req.body.d18_5_2 ? req.body.d18_5_2 : null );
    request.addParameter( "d18_6_2" ,          TYPES.Text            ,req.body.d18_6_2  ? req.body.d18_6_2  : null );
    request.addParameter( "d18_7_2" ,          TYPES.Text            ,req.body.d18_7_2 ? req.body.d18_7_2 : null );
    request.addParameter( "d18_8_2" ,          TYPES.Text            ,req.body.d18_8_2 ? req.body.d18_8_2 : null );
    request.addParameter( "d18_9_2" ,          TYPES.Text            ,req.body.d18_9_2  ? req.body.d18_9_2  : null );
    request.addParameter( "d18_1_3" ,          TYPES.Text            ,req.body.d18_1_3 ? req.body.d18_1_3 : null );
    request.addParameter( "d18_2_3" ,          TYPES.Text            ,req.body.d18_2_3 ? req.body.d18_2_3 : null );
    request.addParameter( "d18_3_3" ,          TYPES.Text            ,req.body.d18_3_3 ? req.body.d18_3_3 : null );
    request.addParameter( "d18_4_3" ,          TYPES.Text            ,req.body.d18_4_3 ? req.body.d18_4_3 : null );
    request.addParameter( "d18_5_3" ,          TYPES.Text            ,req.body.d18_5_3 ? req.body.d18_5_3 : null );
    request.addParameter( "d18_6_3" ,          TYPES.Text            ,req.body.d18_6_3 ? req.body.d18_6_3 : null );
    request.addParameter( "d18_7_3" ,          TYPES.Text            ,req.body.d18_7_3 ? req.body.d18_7_3 : null );
    request.addParameter( "d18_8_3" ,          TYPES.Text            ,req.body.d18_8_3 ? req.body.d18_8_3 : null );
    request.addParameter( "d18_9_3" ,          TYPES.Text            ,req.body.d18_9_3 ? req.body.d18_9_3 : null );
    request.addParameter( "d18_1_4" ,          TYPES.Text            ,req.body.d18_1_4  ? req.body.d18_1_4  : null );
    request.addParameter( "d18_2_4" ,          TYPES.Text            ,req.body.d18_2_4 ? req.body.d18_2_4 : null );
    request.addParameter( "d18_3_4" ,          TYPES.Text            ,req.body.d18_3_4  ? req.body.d18_3_4  : null );
    request.addParameter( "d18_4_4" ,          TYPES.Text            ,req.body.d18_4_4 ? req.body.d18_4_4 : null );
    request.addParameter( "d18_5_4" ,          TYPES.Text            ,req.body.d18_5_4 ? req.body.d18_5_4 : null );
    request.addParameter( "d18_6_4" ,          TYPES.Text            ,req.body.d18_6_4  ? req.body.d18_6_4  : null );
    request.addParameter( "d18_7_4" ,          TYPES.Text            ,req.body.d18_7_4 ? req.body.d18_7_4 : null );
    request.addParameter( "d18_8_4" ,          TYPES.Text            ,req.body.d18_8_4 ? req.body.d18_8_4 : null );
    request.addParameter( "d18_9_4" ,          TYPES.Text            ,req.body.d18_9_4 ? req.body.d18_9_4 : null );
    request.addParameter( "d18_1_5" ,          TYPES.Text            ,req.body.d18_1_5 ? req.body.d18_1_5 : null );
    request.addParameter( "d18_2_5" ,          TYPES.Text            ,req.body.d18_2_5 ? req.body.d18_2_5 : null );
    request.addParameter( "d18_3_5" ,          TYPES.Text            ,req.body.d18_3_5  ? req.body.d18_3_5  : null );
    request.addParameter( "d18_4_5" ,          TYPES.Text            ,req.body.d18_4_5 ? req.body.d18_4_5 : null );
    request.addParameter( "d18_5_5" ,          TYPES.Text            ,req.body.d18_5_5 ? req.body.d18_5_5 : null );
    request.addParameter( "d18_6_5" ,          TYPES.Text            ,req.body.d18_6_5  ? req.body.d18_6_5  : null );
    request.addParameter( "d18_7_5" ,          TYPES.Text            ,req.body.d18_7_5 ? req.body.d18_7_5 : null );
    request.addParameter( "d18_8_5" ,          TYPES.Text            ,req.body.d18_8_5 ? req.body.d18_8_5 : null );
    request.addParameter( "d18_9_5" ,          TYPES.Text            ,req.body.d18_9_5 ? req.body.d18_9_5 : null );
    request.addParameter( "d19_1_1" ,          TYPES.Text            ,req.body.d19_1_1  ? req.body.d19_1_1  : null );
    request.addParameter( "d19_2_1" ,          TYPES.Text            ,req.body.d19_2_1 ? req.body.d19_2_1 : null );
    request.addParameter( "d19_3_1" ,          TYPES.Text            ,req.body.d19_3_1  ? req.body.d19_3_1  : null );
    request.addParameter( "d19_4_1" ,          TYPES.Text            ,req.body.d19_4_1 ? req.body.d19_4_1 : null );
    request.addParameter( "d19_5_1" ,          TYPES.Text            ,req.body.d19_5_1 ? req.body.d19_5_1 : null );
    request.addParameter( "d19_6_1" ,          TYPES.Text            ,req.body.d19_6_1  ? req.body.d19_6_1  : null );
    request.addParameter( "d19_7_1" ,          TYPES.Text            ,req.body.d19_7_1  ? req.body.d19_7_1  : null );
    request.addParameter( "d19_1_2" ,          TYPES.Text            ,req.body.d19_1_2  ? req.body.d19_1_2  : null );
    request.addParameter( "d19_2_2" ,          TYPES.Text            ,req.body.d19_2_2 ? req.body.d19_2_2 : null );
    request.addParameter( "d19_3_2" ,          TYPES.Text            ,req.body.d19_3_2  ? req.body.d19_3_2  : null );
    request.addParameter( "d19_4_2" ,          TYPES.Text            ,req.body.d19_4_2 ? req.body.d19_4_2 : null );
    request.addParameter( "d19_5_2" ,          TYPES.Text            ,req.body.d19_5_2 ? req.body.d19_5_2 : null );
    request.addParameter( "d19_6_2" ,          TYPES.Text            ,req.body.d19_6_2  ? req.body.d19_6_2  : null );
    request.addParameter( "d19_7_2" ,          TYPES.Text            ,req.body.d19_7_2  ? req.body.d19_7_2  : null );
    request.addParameter( "d19_1_3" ,          TYPES.Text            ,req.body.d19_1_3 ? req.body.d19_1_3 : null );
    request.addParameter( "d19_2_3" ,          TYPES.Text            ,req.body.d19_2_3 ? req.body.d19_2_3 : null );
    request.addParameter( "d19_3_3" ,          TYPES.Text            ,req.body.d19_3_3 ? req.body.d19_3_3 : null );
    request.addParameter( "d19_4_3" ,          TYPES.Text            ,req.body.d19_4_3 ? req.body.d19_4_3 : null );
    request.addParameter( "d19_5_3" ,          TYPES.Text            ,req.body.d19_5_3 ? req.body.d19_5_3 : null );
    request.addParameter( "d19_6_3" ,          TYPES.Text            ,req.body.d19_6_3 ? req.body.d19_6_3 : null );
    request.addParameter( "d19_7_3" ,          TYPES.Text            ,req.body.d19_7_3 ? req.body.d19_7_3 : null );
    request.addParameter( "d19_1_4" ,          TYPES.Text            ,req.body.d19_1_4  ? req.body.d19_1_4  : null );
    request.addParameter( "d19_2_4" ,          TYPES.Text            ,req.body.d19_2_4 ? req.body.d19_2_4 : null );
    request.addParameter( "d19_3_4" ,          TYPES.Text            ,req.body.d19_3_4  ? req.body.d19_3_4  : null );
    request.addParameter( "d19_4_4" ,          TYPES.Text            ,req.body.d19_4_4 ? req.body.d19_4_4 : null );
    request.addParameter( "d19_5_4" ,          TYPES.Text            ,req.body.d19_5_4 ? req.body.d19_5_4 : null );
    request.addParameter( "d19_6_4" ,          TYPES.Text            ,req.body.d19_6_4  ? req.body.d19_6_4  : null );
    request.addParameter( "d19_7_4" ,          TYPES.Text            ,req.body.d19_7_4 ? req.body.d19_7_4 : null );
    request.addParameter( "d19_1_5" ,          TYPES.Text            ,req.body.d19_1_5 ? req.body.d19_1_5 : null );
    request.addParameter( "d19_2_5" ,          TYPES.Text            ,req.body.d19_2_5 ? req.body.d19_2_5 : null );
    request.addParameter( "d19_3_5" ,          TYPES.Text            ,req.body.d19_3_5  ? req.body.d19_3_5  : null );
    request.addParameter( "d19_4_5" ,          TYPES.Text            ,req.body.d19_4_5 ? req.body.d19_4_5 : null );
    request.addParameter( "d19_5_5" ,          TYPES.Text            ,req.body.d19_5_5 ? req.body.d19_5_5 : null );
    request.addParameter( "d19_6_5" ,          TYPES.Text            ,req.body.d19_6_5  ? req.body.d19_6_5  : null );
    request.addParameter( "d19_7_5" ,          TYPES.Text            ,req.body.d19_7_5  ? req.body.d19_7_5 : null );
    

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

/*******************************************************************************************************************************/

router.post('/visualizar', function(req, res, next) {
    var conversion = require("phantom-html-to-pdf")();
    var pdf = require('../models/pdf').pdf;

    var sql = `SELECT usuario.*, proyectos.*, tablas.*, tablas2.* from unjfsc.dbo.proyectos 
    INNER JOIN unjfsc.dbo.usuario ON usuario.id_usuario = @id_usuario and proyectos.id_proyecto = @idproyecto
    INNER JOIN unjfsc.dbo.tablas ON tablas.id_proyecto = @idproyecto
    INNER JOIN unjfsc.dbo.tablas2 ON tablas2.id_proyecto = @idproyecto`;

    var result = {};

    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        if(!req.session.user){
            console.log(req.session.user);
            res.redirect("/");
        } else {
            conversion({ html: pdf(result) }, 
            function(err, pdf) {
                console.log("Documento generado con " + pdf.numberOfPages+ " paginas.");

                res.setHeader('content-type', 'application/pdf');
                pdf.stream.pipe(res);
            });
        }
    });

    request.addParameter("id_usuario" ,    TYPES.Int,    req.session.user.id);
    request.addParameter("idproyecto" ,    TYPES.Int,    req.body.idproyecto);

    request.on("row", function (columns) { 
        var item = {}; 
        columns.forEach(function (column) { 
            item[column.metadata.colName] = column.value; 
        }); 
        result = item;
    });

    conn.execSql(request);

});


module.exports = router;