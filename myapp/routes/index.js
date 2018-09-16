var express = require('express');
var router = express.Router();
var Conn = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;  
var config = require('../models/database').config;
var bcrypt = require('bcrypt');
var pdf = require('pdfkit');

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
    const doc = new pdf()
    let filename = "documento";
    // Stripping special characters
    filename = encodeURIComponent(filename) + '.pdf'
    // Setting response to 'attachment' (download).
    // If you use 'inline' here it will automatically open the PDF
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
    res.setHeader('Content-type', 'application/pdf')
    const content = "Documento pdf"
    doc.y = 300
    doc.text(content, 50, 50)
    doc.pipe(res)
    doc.end()
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

/********************** CREACION DE UN NUEVO PROYECTO ************************************** */
router.get('/nuevo-proyecto' ,function(req, res, next) {
    if(req.session.user){
        res.render('nuevoProyecto', { 
            title: "Nuevo Proyecto", 
            usuario: req.session.user 
        });
    } else {
        res.redirect("/");
    }
  });
/************************************ CAMBIAR LA CLAVE DE ACCESO **************************** */
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

/************************************ CAMBIAR LA CLAVE DE ACCESO **************************** */
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
/**************************** CAMBIAR LOS DATOS PERSONALES  *********************************** */
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
/*********************************  ADMINISTRACION DE LOS PROYECTOS ******************************* */
router.get('/administrar' ,function(req, res, next) {
    if(req.session.user){

        var sql = 'SELECT titulo, fecha_creacion from unjfsc.dbo.proyectos WHERE id_usuario = @id_usuario';
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

/********************** CREACION DE UN NUEVO PROYECTO ************************************** */
router.get('/editar-proyecto' ,function(req, res, next) {
    if(req.session.user){
        
        var sql = 'SELECT TOP 1 titulo from unjfsc.dbo.proyectos WHERE id_usuario = @id_usuario';
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
                console.log("Ha sido creado el usuario nro: " + column.value);  
            }  
        });  
    });       
    conn.execSql(request);
});



/********************************** CARGA DEL PROYECTO NUEVO *****************/
router.post('/validation/nuevo', function(req, res) {

    
    var sql = 'INSERT INTO [unjfsc].[dbo].[proyectos] ([id_usuario], [titulo]) OUTPUT INSERTED.id_proyecto VALUES ( @id_usuario, @titulo)';

    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/editar-proyecto');
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



/********************************** CARGA DEL PROYECTO NUEVO *****************/
router.post('/validation/editar-proyecto', function(req, res) {

    
    var sql = "UPDATE [unjfsc].[dbo].[proyectos] SET [titulo] = @titulo, [palabras_clave] = @palabrasClave, [duracion_proyecto] = @duracionDelProyecto, [fecha_estimada_inicio] = @fechaEstimadaDeInicioDelProyecto, [cgp_tipo_documento] = @cgptipoDeDocumento, [cgp_nro_documento] = @cgpnumeroDeDocumento, [cgp_ruc] = @cgpruc, [cgp_nombre] = @cgpnombresYApellidos, [cgp_fecha_nac] = @cgpfechaDeNacimiento, [cgp_sexo] = @cgpsexo, [cgp_email] = @cgpemail, [cgp_telefono] = @cgptelefono, [cgp_celular] = @cgpcelular, [cap_tipo_documento] = @captipoDeDocumento, [cap_nro_documento] = @capnumeroDeDocumento, [cap_ruc] = @capruc, [cap_nombre] = @capnombresYApellidos, [cap_fecha_nac] = @capfechaDeNacimiento, [cap_sexo] = @capsexo, [cap_email] = @capemail, [cap_telefono] = @captelefono, [cap_celular] = @capcelular, [es_tipo] = @estipoDeEntidad, [es_tamano] = @estamañoDeLaEmpresa, [es_nro_trabajadores] = @esnroDeTrabajadores, [es_ruc] = @esrucRazonSocial, [es_ciiu] = @esciiu, [es_direccion] = @esdireccion, [es_fecha_constitucion] = @esfechaDeConstitucion, [es_inicio_actividades] = @esinicioDeActividades, [es_nro_partida] = @esnumeroDePartida, [es_oficina_registral] = @esoficinaRegistral, [es_telefono] = @estelefonoCelular, [es_correo] = @esemail, [es_pagina_web] = @espaginaWeb, [es_ventas2016] = @esventas2016, [es_ventas2017] = @esventas2017, [rl_tipo_documento] = @rptipoDeDocumento, [rl_nro_documento] = @rpnumeroDeDocumento, [rl_ruc] = @rpruc, [rl_nombre] = @rpnombresYApellidos, [rl_sexo] =@rpsexo, [rl_email] = @rpemail, [rl_telefono] = @rptelefono, [rl_productos_comercializados] = @rpproductosComerciales, [rl_actividades_relacionadas] = @rpactividadesRelacionadas, [rl_infraestructura_es] = @rpinfraestructuraDelSolicitante, [entorno_empresarial] = @entornoEmpresarial, [situacion_actual] =@situacionActual, [identificacion_mercado] = @identificacionDelMercado, [competidores] =  @competidores, [modelo_negocio] = @modeloDeNegocio, [capacidad_financiera] = @capacidadFinanciera, [rentabilidad_econimica] = @rentabilidadEconomica, [problemas_identificados] = @problemaIdentificado, [consecuencias_efectos] = @consecuenciasEfectos, [causas] = @causas, [tipo_innovacion] = @tipoDeInnovacion, [funcion_innovacion] = @describirFuncion, [tecnologia] = @describirTecnologia, [forma_resultado] = @describirForma, [antecedentes] =  @antecedentes, [tipo_conocimiento] = @libreRestrigido, [plan_metodologico] = @planMetodologico, [propiedad_intelectual] = @propiedadIntelectual, [impactos_economicos] = @impactosEconomicos, [impactos_sociales] = @impactosSociales,[impactos_formacion] = @impactosEnLaFormacion,  [potencialidad] = @pontencialidad, [impactos_tecnologico] = @impactosDeLaTecnologia, [impactos_ambientales] = @impactosAmbientales, [medidas_mitigacion] = @medidasDeMitigacion, [impactos_empresa] = @impactosEnLaEmpresa, [tipo_moneda] = @monedaDelProyecto WHERE  [id_proyecto] = @id_proyecto";
    var request = new Request(sql, function(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/administrar');
    });

    request.addParameter("id_usuario" ,                           TYPES.Int             ,req.session.user.id);    
    request.addParameter("titulo" ,                               TYPES.Text            ,req.body.titulo);
    request.addParameter( "palabrasClave"  ,                      TYPES.Text            ,req.body.palabrasClave);
    request.addParameter( "duracionDelProyecto",                  TYPES.Int             ,req.body.duracionDelProyecto);
    request.addParameter( "fechaEstimadaDeInicioDelProyecto",     TYPES.Date            ,req.body.fechaEstimadaDeInicioDelProyecto);
    request.addParameter( "cgptipoDeDocumento" ,                  TYPES.Int             ,req.body.cgptipoDeDocumento);
    request.addParameter( "cgpnumeroDeDocumento"   ,              TYPES.Int             ,req.body.cgpnumeroDeDocumento);
    request.addParameter( "cgpruc" ,                              TYPES.Int             ,req.body.cgpruc);
    request.addParameter( "cgpnombresYApellidos"   ,              TYPES.Text            ,req.body.cgpnombresYApellidos);
    request.addParameter( "cgpfechaDeNacimiento"   ,              TYPES.Date            ,req.body.cgpfechaDeNacimiento);
    request.addParameter( "cgpsexo",                              TYPES.Int             ,req.body.cgpsexo);
    request.addParameter( "cgpemail"   ,                          TYPES.Text            ,req.body.cgpemail);
    request.addParameter( "cgptelefono",                          TYPES.Int             ,req.body.cgptelefono);
    request.addParameter( "cgpcelular" ,                          TYPES.Int             ,req.body.cgpcelular);
    request.addParameter( "captipoDeDocumento" ,                  TYPES.Int             ,req.body.captipoDeDocumento);
    request.addParameter( "capnumeroDeDocumento"   ,              TYPES.Int             ,req.body.capnumeroDeDocumento);
    request.addParameter( "capruc" ,                              TYPES.Int             ,req.body.capruc);
    request.addParameter( "capnombresYApellidos"   ,              TYPES.Text            ,req.body.capnombresYApellidos);
    request.addParameter( "capfechaDeNacimiento"   ,              TYPES.Date            ,req.body.capfechaDeNacimiento);
    request.addParameter( "capsexo",                              TYPES.Int             ,req.body.capsexo);
    request.addParameter( "capemail"   ,                          TYPES.Text            ,req.body.capemail);
    request.addParameter( "captelefono",                          TYPES.Int             ,req.body.captelefono);
    request.addParameter( "capcelular" ,                          TYPES.Int             ,req.body.capcelular);
    request.addParameter( "estipoDeEntidad",                      TYPES.Int             ,req.body.estipoDeEntidad);
    request.addParameter( "estamañoDeLaEmpresa",                  TYPES.Text            ,req.body.estamañoDeLaEmpresa);
    request.addParameter( "esnroDeTrabajadores",                  TYPES.Int             ,req.body.esnroDeTrabajadores);
    request.addParameter( "esrucRazonSocial"   ,                  TYPES.Text            ,req.body.esrucRazonSocial);
    request.addParameter( "esciiu" ,                              TYPES.Text            ,req.body.esciiu);
    request.addParameter( "esdireccion",                          TYPES.Text            ,req.body.esdireccion);
    request.addParameter( "esfechaDeConstitucion"  ,              TYPES.Date            ,req.body.esfechaDeConstitucion);
    request.addParameter( "esinicioDeActividades"  ,              TYPES.Date            ,req.body.esinicioDeActividades);
    request.addParameter( "esnumeroDePartida"  ,                  TYPES.Text            ,req.body.esnumeroDePartida);
    request.addParameter( "esoficinaRegistral" ,                  TYPES.Text            ,req.body.esoficinaRegistral);
    request.addParameter( "estelefonoCelular"  ,                  TYPES.Text            ,req.body.estelefonoCelular);
    request.addParameter( "esemail",                              TYPES.Text            ,req.body.esemail);
    request.addParameter( "espaginaWeb",                          TYPES.Text            ,req.body.espaginaWeb);
    request.addParameter( "esventas2016"   ,                      TYPES.Int             ,req.body.esventas2016);
    request.addParameter( "esventas2017"   ,                      TYPES.Int             ,req.body.esventas2017);
    request.addParameter( "rptipoDeDocumento"  ,                  TYPES.Int             ,req.body.rptipoDeDocumento);
    request.addParameter( "rpnumeroDeDocumento",                  TYPES.Int             ,req.body.rpnumeroDeDocumento);
    request.addParameter( "rpruc"  ,                              TYPES.Int             ,req.body.rpruc);
    request.addParameter( "rpnombresYApellidos",                  TYPES.Text            ,req.body.rpnombresYApellidos);
    request.addParameter( "rpsexo" ,                              TYPES.Int             ,req.body.rpsexo);
    request.addParameter( "rpemail",                              TYPES.Text            ,req.body.rpemail);
    request.addParameter( "rptelefono" ,                          TYPES.Int             ,req.body.rptelefono);
    request.addParameter( "rpproductosComerciales" ,              TYPES.Text            ,req.body.rpproductosComerciales);
    request.addParameter( "rpactividadesRelacionadas"  ,          TYPES.Text            ,req.body.rpactividadesRelacionadas);
    request.addParameter( "rpinfraestructuraDelSolicitante",      TYPES.Text            ,req.body.rpinfraestructuraDelSolicitante);
    request.addParameter( "entornoEmpresarial" ,                  TYPES.Text            ,req.body.entornoEmpresarial);
    request.addParameter( "situacionActual",                      TYPES.Text            ,req.body.situacionActual);
    request.addParameter( "identificacionDelMercado"   ,          TYPES.Text            ,req.body.identificacionDelMercado);
    request.addParameter( "competidores"   ,                      TYPES.Text            ,req.body.competidores);
    request.addParameter( "modeloDeNegocio",                      TYPES.Text            ,req.body.modeloDeNegocio);
    request.addParameter( "capacidadFinanciera",                  TYPES.Text            ,req.body.capacidadFinanciera);
    request.addParameter( "rentabilidadEconomica"  ,              TYPES.Text            ,req.body.rentabilidadEconomica);
    request.addParameter( "problemaIdentificado"   ,              TYPES.Text            ,req.body.problemaIdentificado);
    request.addParameter( "consecuenciasEfectos"   ,              TYPES.Text            ,req.body.consecuenciasEfectos);
    request.addParameter( "causas" ,                              TYPES.Text            ,req.body.causas);
    request.addParameter( "tipoDeInnovacion"   ,                  TYPES.Int             ,req.body.tipoDeInnovacion);
    request.addParameter( "describirFuncion"   ,                  TYPES.Text            ,req.body.describirFuncion);
    request.addParameter( "describirTecnologia",                  TYPES.Text            ,req.body.describirTecnologia);
    request.addParameter( "describirForma" ,                      TYPES.Text            ,req.body.describirForma);
    request.addParameter( "antecedentes"   ,                      TYPES.Text            ,req.body.antecedentes);
    request.addParameter( "libreRestrigido",                      TYPES.Text            ,req.body.libreRestrigido);
    request.addParameter( "planMetodologico"   ,                  TYPES.Text            ,req.body.planMetodologico);
    request.addParameter( "propiedadIntelectual"   ,              TYPES.Text            ,req.body.propiedadIntelectual);
    request.addParameter( "impactosEconomicos" ,                  TYPES.Text            ,req.body.impactosEconomicos);
    request.addParameter( "impactosSociales"   ,                  TYPES.Text            ,req.body.impactosSociales);
    request.addParameter( "impactosEnLaFormacion"  ,              TYPES.Text            ,req.body.impactosEnLaFormacion);
    request.addParameter( "pontencialidad" ,                      TYPES.Text            ,req.body.pontencialidad);
    request.addParameter( "impactosDeLaTecnologia" ,              TYPES.Text            ,req.body.impactosDeLaTecnologia);
    request.addParameter( "impactosAmbientales",                  TYPES.Text            ,req.body.impactosAmbientales);
    request.addParameter( "medidasDeMitigacion",                  TYPES.Text            ,req.body.medidasDeMitigacion);
    request.addParameter( "impactosEnLaEmpresa",                  TYPES.Text            ,req.body.impactosEnLaEmpresa);
    request.addParameter( "monedaDelProyecto"  ,                  TYPES.Int             ,req.body.monedaDelProyecto);


    request.on('row', function(columns) {   });       
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



module.exports = router;