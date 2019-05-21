var express = require('express');

/* Config */

var app = express();
app.set('port', 8000);

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// File serving
app.use('/public', express.static('public'))

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

app.get('/',function(req,res){
    var context = {};
    res.render('index', context);
});

app.get('/Testpage',function(req,res){
    var context = {
        tableTitle: "Test Table"
    };
    res.render('table', context);
});

app.get('/Search',function(req,res){
    var context = {};
    res.render('search', context);
});

app.get('/Models',function(req,res){
    var context = {};
    res.render('models', context);
});

app.get('/Trimlines',function(req,res){
    var context = {};
    res.render('trimlines', context);
});

app.get('/Colors',function(req,res){
    var context = {};
    res.render('colors', context);
});

app.get('/Parts',function(req,res){
    var context = {};
    res.render('parts', context);
});

app.get('/PartRequirements',function(req,res){
    var context = {};
    res.render('part_requirements', context);
});

app.get('/Orders',function(req,res){
    var context = {};
    res.render('orders', context);
});

app.get('/Search', function(req, res){
  var context = {};
  res.render('search', context);
});

/* Error stuff */

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

/* Start webserver */

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
