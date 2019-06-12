exports.readAll = function(con, cb, params) {
    con.query("SELECT id, customer, trimline, color FROM orders ORDER BY id", function(err, rows) {
      cb(rows, err);
    });
}

exports.readOne = function(con, cb, params) {
    con.query("SELECT id, customer, trimline, color FROM orders WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createOne = function(con, cb, params) {
    con.query("INSERT INTO orders (customer), VALUES (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createEmpty = function(con, cb, params) {
    con.query("INSERT INTO orders (customer) VALUES ('??');", function(err, rows) {
      cb(rows, err);
    });
}

exports.updateOne = function(con, cb, params) {
    con.query("UPDATE orders SET customer = (?), trimline = (?), color = (?) WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.deleteOne = function(con, cb, params) {
    con.query("DELETE FROM orders WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}
