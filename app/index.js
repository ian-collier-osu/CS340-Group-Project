var express = require('express');

/* Config */

var app = express();
app.set('port', 80);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* DB init */
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "docker",
  password: "",
  database: "main"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

con.on('enqueue', function (sequence) {
  console.log(sequence.sql);
});


/* Routes */

// Static file serving
app.use('/public', express.static('public'));

// Don't delete this, for testing
app.get('/Test',function(req,res){
    console.log("Test request receieved.");
    res.sendStatus(200);
});

// Don't delete this, for testing
app.get('/TestDB',function(req,res){
    var query = con.query("DROP TABLE IF EXISTS diagnostic;", function (err, result) {
        if (err) throw err;
    });

    con.query("CREATE TABLE diagnostic(id INT PRIMARY KEY, text VARCHAR(255) NOT NULL);", function (err, result) {
        if (err) throw err;
    });

    con.query('INSERT INTO diagnostic (text) VALUES ("MySQL is working");', function (err, result) {
        if (err) throw err;
    });

    con.query("SELECT * FROM diagnostic;", function (err, result) {
        if (err) throw err;
        Object.keys(result).forEach(function(key) {
            var row = result[key];
            console.log(row)
        });
    });
    res.sendStatus(200);
});

/* Start webserver */

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
