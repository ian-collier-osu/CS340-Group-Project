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

var con;

function handleDisconnect() {
    con = mysql.createConnection({
      host: "localhost",
      user: "docker",
      password: "",
      database: "main"
    });

  con.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.

  con.on('enqueue', function (sequence) {
    console.log(sequence.sql);
  });

  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


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

app.get('/CRUDDemo',function(req,res){
    var context = {
        tableTitle: "Test Table"
    };
    res.render('table', context);
});

app.get('/ModelsTable',function(req,res){
    var context = {
        tableTitle: "Models"
    };
    res.render('models', context);
});

app.get('/TrimlinesTable',function(req,res){
    var context = {
        tableTitle: "Trimlines"
    };
    res.render('trimlines', context);
});

app.get('/ColorsTable',function(req,res){
    var context = {
        tableTitle: "Colors"
    };
    res.render('colors', context);
});

app.get('/PartsTable',function(req,res){
    var context = {
        tableTitle: "Parts"
    };
    res.render('parts', context);
});

app.get('/PartRequirementsTable',function(req,res){
    var context = {
        tableTitle: "Part Requirements"
    };
    res.render('part_requirements', context);
});

app.get('/OrdersTable',function(req,res){
    var context = {
        tableTitle: "Orders"
    };
    res.render('orders', context);
});

app.get('/Search', function(req, res){
  var context = {};
  res.render('search', context);
});

/* DB routes */

app.get('/Models',function(req,res,next){
    con.query("SELECT id, name FROM models ORDER BY id", function(err, rows)
    {
      if(err)
      {
        next(err);
      }
      res.send(rows);
    });
});

//Add new model; cannot handle base trimline due to foreign key requirement.
app.put('/Models',function(req,res,next){
  con.query("INSERT INTO models (name), VALUES (?)", [req.body.name], function(err, rows)
  {
    if (err)
    {
      next(err);
    }
    con.query("SELECT id, name FROM models", function(err, rows){
      if (err)
      {
        next(err);
      }
      res.send(rows);
    });
  });
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
