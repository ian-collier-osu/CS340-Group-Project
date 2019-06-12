exports.readAll = function(con, cb, params) {
    con.query("SELECT id, name, model FROM trimlines ORDER BY id", function(err, rows) {
      cb(rows, err);
    });
}

exports.readOne = function(con, cb, params) {
    con.query("SELECT id, name, model FROM trimlines WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createOne = function(con, cb, params) {
    con.query("INSERT INTO trimlines (name), VALUES (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createEmpty = function(con, cb, params) {
    con.query("INSERT INTO trimlines (name) VALUES ('??');", function(err, rows) {
      cb(rows, err);
    });
}

exports.updateOne = function(con, cb, params) {
    con.query("UPDATE trimlines SET name = (?), model = (?) WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.deleteOne = function(con, cb, params) {
    con.query("DELETE FROM trimlines WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}
