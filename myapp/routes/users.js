var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {
  var user = req.body.user;
  var passwd = req.body.passwd;
  if( user == "pepito" && passwd == "fuentes"){
    res.redirect("/form");
  }else{
    res.redirect("/")
  }
});

module.exports = router;
