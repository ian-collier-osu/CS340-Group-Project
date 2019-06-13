var express = require('express');

/* Express config */

var app = express();
app.set('port', 8000);

// Handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Body parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Content filter
var bodyContentFilter = require('./middleware/body-content-filter');
app.use(bodyContentFilter());


/* MySQL config */

var mysql = require('mysql');
var con;

// Prevents database connection from timing out
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

// Initialize the connection
handleDisconnect();

/* Static routes */

app.use('/public', express.static('public'));


/* Testing routes - dont delete */

// Verify server up
app.get('/Test',function(req,res){
    console.log("Test request receieved.");
    res.sendStatus(200);
});

// Verify database connection
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

/* HTML routes */

app.get('/',function(req,res){
    var context = {};
    res.render('index', context);
});

app.get('/ModelsTable',function(req,res){
    var context = {
        pageTitle: "Models",
        tableMetaFile: "models.js"
    };
    res.render('table', context);
});

app.get('/TrimlinesTable',function(req,res){
    var context = {
        pageTitle: "Trimlines",
        tableMetaFile: "trimlines.js"
    };
    res.render('table', context);
});

app.get('/ColorsTable',function(req,res){
    var context = {
        pageTitle: "Colors",
        tableMetaFile: "colors.js"
    };
    res.render('table', context);
});

app.get('/PartsTable',function(req,res){
    var context = {
        pageTitle: "Parts",
        tableMetaFile: "parts.js"
    };
    res.render('table', context);
});

app.get('/PartRequirementsTable',function(req,res){
    var context = {
        pageTitle: "Part Requirements",
        tableMetaFile: "partrequirements.js"
    };
    res.render('table', context);
});

app.get('/OrdersTable',function(req,res){
    var context = {
        pageTitle: "Orders",
        tableMetaFile: "orders.js"
    };
    res.render('table', context);
});

app.get('/SearchPage', function(req, res){
  var context = {
      pageTitle: "Search"
  };
  res.render('search', context);
});

/* DB routes */

// Load query def files

var Queries = {
    models: require('./queries/models.js'),
    trimlines: require('./queries/trimlines.js'),
    parts: require('./queries/parts.js'),
    partRequirements: require('./queries/partrequirements.js'),
    colors: require('./queries/colors.js'),
    orders: require('./queries/orders.js'),
    misc: require('./queries/misc.js')
}

// Standard callback for DB queries

function queryCallback(res) {
    return function(rows, err) {
        if(err) {
          console.log(err);
          res.status(500).send("MySQL Error");
        }
        res.send(rows);
    };
}

// Models

app.get('/Models',function(req,res,next){
    Queries.models.readAll(con, queryCallback(res));
});

app.put('/Models', function(req,res,next){
    Queries.models.createEmpty(con, queryCallback(res));
});

app.post('/Models/:id', function(req,res,next){
    Queries.models.updateOne(con, queryCallback(res), [req.body.name, req.body.base_trimline, req.params.id]);
});

app.delete('/Models/:id', function(req,res,next){
    Queries.models.deleteOne(con, queryCallback(res), [req.params.id]);
});

// Trimlines

app.get('/Trimlines',function(req,res,next){
    Queries.trimlines.readAll(con, queryCallback(res));
});

app.put('/Trimlines', function(req,res,next){
    Queries.trimlines.createEmpty(con, queryCallback(res));
});

app.post('/Trimlines/:id', function(req,res,next){
    Queries.trimlines.updateOne(con, queryCallback(res), [req.body.name, req.body.model, req.params.id]);
});

app.delete('/Trimlines/:id', function(req,res,next){
    Queries.trimlines.deleteOne(con, queryCallback(res), [req.params.id]);
});

// Colors

app.get('/Colors',function(req,res,next){
    Queries.colors.readAll(con, queryCallback(res));
});

app.put('/Colors', function(req,res,next){
    Queries.colors.createEmpty(con, queryCallback(res));
});

app.post('/Colors/:id', function(req,res,next){
    Queries.colors.updateOne(con, queryCallback(res), [req.body.name, req.params.id]);
});

app.delete('/Colors/:id', function(req,res,next){
    Queries.colors.deleteOne(con, queryCallback(res), [req.params.id]);
});

// Parts

app.get('/Parts',function(req,res,next){
    Queries.parts.readAll(con, queryCallback(res));
});

app.put('/Parts', function(req,res,next){
    Queries.parts.createEmpty(con, queryCallback(res));
});

app.post('/Parts/:id', function(req,res,next){
    Queries.parts.updateOne(con, queryCallback(res), [req.body.name, req.body.quantity_on_hand, req.body.cost, req.params.id]);
});

app.delete('/Parts/:id', function(req,res,next){
    Queries.parts.deleteOne(con, queryCallback(res), [req.params.id]);
});

// Part Requirements

app.get('/PartRequirements',function(req,res,next){
    Queries.partRequirements.readAll(con, queryCallback(res));
});

app.put('/PartRequirements', function(req,res,next){
    Queries.partRequirements.createEmpty(con, queryCallback(res));
});

app.post('/PartRequirements/:id', function(req,res,next){
    Queries.partRequirements.updateOne(con, queryCallback(res), [req.body.associated_model, req.body.associated_trimline, req.body.associated_part, req.body.quantity, req.params.id]);
});

app.delete('/PartRequirements/:id', function(req,res,next){
    Queries.partRequirements.deleteOne(con, queryCallback(res), [req.params.id]);
});

// Orders

app.get('/Orders',function(req,res,next){
    Queries.orders.readAll(con, queryCallback(res));
});

app.put('/Orders', function(req,res,next){
    Queries.orders.createEmpty(con, queryCallback(res));
});

app.post('/Orders/:id', function(req,res,next){
    Queries.orders.updateOne(con, queryCallback(res), [req.body.customer, req.body.trimline, req.body.color, req.params.id]);
});

app.delete('/Orders/:id', function(req,res,next){
    Queries.orders.deleteOne(con, queryCallback(res), [req.params.id]);
});

// Search

app.get('/Search/:customerName', function(req, res, next){
    Queries.misc.searchCustomer(con, queryCallback(res), [req.params.customerName]);
});

/* Error routes */

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
