exports.readAll = function(con, cb, params) {
    con.query("SELECT id, name FROM colors ORDER BY id", function(err, rows) {
      cb(rows, err);
    });
}

exports.readOne = function(con, cb, params) {
    con.query("SELECT id, name FROM colors WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createOne = function(con, cb, params) {
    con.query("INSERT INTO colors (name), VALUES (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createEmpty = function(con, cb, params) {
    con.query("INSERT INTO colors (name) VALUES ('??');", function(err, rows) {
      cb(rows, err);
    });
}

exports.updateOne = function(con, cb, params) {
    con.query("UPDATE colors SET name = (?) WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.deleteOne = function(con, cb, params) {
    con.query("DELETE FROM colors WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}
