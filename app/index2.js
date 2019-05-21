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

var db_config = {
  connectionLimit : 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "automotive"
};

var con;

function handleDisconnect() {
  con = mysql.createPool(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  con.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
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

app.get('/Models',function(req,res,next){
    con.query("SELECT id, name FROM models", function(err, rows)
    {
      if(err)
      {
        next(err);
      }
      res.render('models', rows);
    });
});

//Add new model; cannot handle base trimline due to foreign key requirement.
app.put('/Models',function(req,res,next){
  con.query("INSERT INTO models (name), VALUES (?)", [req.body.name]), function(err, rows)
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
      res.render('models, rows');
    });
  });
});

app.get('/Trimlines',function(req,res,next){
  con.query("SELECT id, name, model, default_color FROM trimlines", function(err, rows){
    if (err)
    {
      next(err);
    }
    res.render('trimlines', rows);
  });
});

//Create new trimline.
app.put('/Trimlines',function(req,res,next){
  con.query("INSERT INTO trimlines (name, model, default_color) VALUES (?, ?, ?)", [req.body.name, req.body.model, req.body.default_color], function(err, rows){
    if (err)
    {
      next(err);
    }
    con.query("SELECT id, name, model, default_color FROM trimlines", function(err, rows){
      if (err)
      {
        next(err);
      }
      res.render('trimlines', rows);
    });
  });
});

app.get('/Colors',function(req,res,next){
  con.query("SELECT name FROM colors", function(err, rows)
  {
    if(err)
    {
      next(err);
    }
    res.render('colors', rows);
  });
});

//Create new color.
app.put('/Colors', function(req, res, next){
  con.query("INSERT INTO colors (name) VALUES (?)", [req.body.name], function(err, rows){
    if (err)
    {
      next(err);
    }
    con.query("SELECT name FROM colors", function(err, rows){
      if(err)
      {
        next(err);
      }
      res.render('colors', rows);
    });
  });
});


app.get('/Parts',function(req,res,next){
  con.query("SELECT id, name, quantity_on_hand, cost FROM parts", function(err, rows){
    if(err)
    {
      next(err);
    }
    res.render('parts', rows);
  });
});

//Create new part.
app.put('/Parts', function(req, res, next){
  con.query("INSERT INTO parts (name, quantity_on_hand, cost) VALUES (?, ?, ?)", [req.body.name, req.body.quantity_on_hand, req.body.cost || null]", function(err, rows){
    if(err)
    {
      next(err);
    }
    con.query("SELECT id, name, quantity_on_hand, cost FROM parts", function(err, rows){
      if(err)
      {
        next(err);
      }
      res.render('parts', rows);
    });
  });
});

//I can add a route for searching parts by name, if desired.  --Mike

app.get('/PartRequirements', function(req,res, next){
    con.query("SELECT pr.id, pr.quantity, p.name, m.name AS model, t.name AS trimline,
    \\FROM part_requirements pr
    \\INNER JOIN trimlines t ON pr.associated_trimline = t.id
    \\INNER JOIN models m ON pr.associated_trimline = m.id", function (req, res, next){
      if (err)
      {
        next(err);
      }
      res.render('part_requirements', rows);
    });
});

/*Create a new part_requirement relationship.  The DB will enforce that one of associated_model and associated_trimline must be null, and the other must not be null.
  It might be good to enforce that in the HTML/JS on the front-end, as well. --Mike */
app.put('/PartRequirements', function(req, res, next){
  con.query("INSERT INTO part_requirements (quantity, associated_model, associated_trimline)
  \\VALUES (?, ?, ?)", [req.body.quantity, req.body.associated_model || null, req.body,associated_trimline || null], function(req, res, next){
    if (err)
    {
      next(err);
    }
    con.query("SELECT pr.id, pr.quantity, p.name, m.name AS model, t.name AS trimline,
      \\FROM part_requirements pr
      \\INNER JOIN trimlines t ON pr.associated_trimline = t.// id
      \\INNER JOIN models m ON pr.associated_trimline = m.id", function (req, res, next){
      if (err)
      {
        next(err);
      }
      res.render('part_requirements', rows);
    });
  });
});

/*This will have to take the search info for orders, since the number of orders is
open-ended, so we can't just populate a drop down.  I recommend we nuke this particular route. --Mike*/
app.get('/Orders',function(req,res){
    var context = {};
    res.render('orders', context);
});

//Search an order based on name.
app.get('/Search', function(req, res, next){
  con.query("SELECT o.id, o.customer, m.name, t.name, o.color, SUM(p.cost * pr.quantity) AS part_cost
    \\ FROM orders o
    \\INNER JOIN trimlines t ON o.trimline = t.id
    \\INNER JOIN models m ON t.model = m.id
    \\INNER JOIN part_requirements pr ON pr.associated_trimline = t.id OR pr.associated_model = m.id
    \\INNER JOIN parts p ON p.id = pr.associated_part
    \\WHERE o.name LIKE '%?%'", [req.body.name], function(err, rows){
      if (err)
      {
        next(err);
      }
      res.render('search', rows);
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
