exports.readAll = function(con, cb, params) {
    con.query("SELECT id, color, trimline FROM trimline_colors ORDER BY id", function(err, rows) {
      cb(rows, err);
    });
}

exports.readOne = function(con, cb, params) {
    con.query("SELECT id, color, trimline FROM trimline_colors WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createOne = function(con, cb, params) {
    con.query("INSERT INTO trimline_colors (color, trimline), VALUES (?, ?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createEmpty = function(con, cb, params) {
    con.query("INSERT INTO trimline_colors (color, trimline) VALUES (NULL, NULL);", function(err, rows) {
      cb(rows, err);
    });
}

exports.updateOne = function(con, cb, params) {
    con.query("UPDATE trimline_colors SET color = (?), trimline = (?) WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.deleteOne = function(con, cb, params) {
    con.query("DELETE FROM trimline_colors WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}
