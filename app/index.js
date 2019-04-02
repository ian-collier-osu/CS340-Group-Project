var express = require('express');

/* Config */

var app = express();
app.set('port', 80);

// Parser for post body
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* DB init */
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "docker",
  password: ""
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

/* Routes */

// Static file serving
app.use('/public', express.static('public'));

app.get('/',function(req,res){
    res.send(200);
});

/* Start webserver */

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
