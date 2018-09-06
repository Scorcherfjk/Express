var express = require('express');
var router = express.Router();

function middleware(res, req, next) {
  if(!req.session.user){
    console.log(req.session.user);
    res.redirect("/");
  } else {
    next();
  }
}

/* GET home page. */
router.get('/form',function(req, res, next) {
  res.render('form', { title: "Formulario" });
});

router.get('/change-password' ,function(req, res, next) {
  res.render('changePassword', { title: "Cambio de Clave" });
});

router.get('/change-data' ,function(req, res, next) {
  res.render('changeData', { title: "Cambio de Datos" });
});

router.get('/', function(req, res, next) {
  req.session.destroy( function (err) {
    if(err){
      console.log(err);
    }else{
      console.log("sesion destruida");
    }
  });
  res.render('index', { title: 'Universidad de Huacho' });
});


module.exports = router;