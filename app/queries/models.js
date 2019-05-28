exports.readAll = function(con, cb) {
    con.query("SELECT id, name, base_trimline FROM models ORDER BY id", function(err, rows) {
      cb(rows, err);
    });
}

exports.readOne = function(con, cb, params) {
    con.query("SELECT id, name, base_trimline FROM models WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createOne = function(con, cb, params) {
    con.query("INSERT INTO models (name), VALUES (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.updateOne = function(con, cb, params) {
    con.query("UPDATE models SET name = (?), base_trimline = (?) WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.deleteOne = function(con, cb, params) {
    con.query("DELETE FROM models WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}
