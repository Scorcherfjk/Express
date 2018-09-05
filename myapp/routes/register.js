var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/');
});

router.get('/natural-person', function(req, res, next) {
  res.render('naturalPerson', { title: 'Registro | Persona Natural' });
});

router.get('/ruc', function(req, res, next) {
  res.render('ruc', { title: 'Registro | RUC' });
});

router.get('/evaluator', function(req, res, next) {
  res.render('evaluator', { title: 'Registro | Evaluador' });
});


module.exports = router;
