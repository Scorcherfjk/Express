var express = require('express');
var router = express.Router();

/* POST users listing. */
router.post('/', function(req, res, next) {
  var user = req.body.user;
  var passwd = req.body.passwd;
  if( user == "pepito" && passwd == "fuentes"){
    res.redirect("/form");
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : ''
    });

    connection.connect();
    connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
      if (err) throw err;
      console.log('The solution is: ', rows[0].solution);
    });
    connection.end();
  }else{
    res.redirect("/")
  }
});

module.exports = router;
