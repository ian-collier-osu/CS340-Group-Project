exports.readAll = function(con, cb, params) {
    con.query("SELECT id, associated_model, associated_trimline, associated_part, quantity FROM part_requirements ORDER BY id", function(err, rows) {
      cb(rows, err);
    });
}

exports.readOne = function(con, cb, params) {
    con.query("SELECT id, associated_model, associated_trimline, associated_part, quantity FROM part_requirements WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createOne = function(con, cb, params) {
    con.query("INSERT INTO part_requirements (quantity), VALUES (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createEmpty = function(con, cb, params) {
    con.query("INSERT INTO part_requirements (quantity) VALUES (0);", function(err, rows) {
      cb(rows, err);
    });
}

exports.updateOne = function(con, cb, params) {
    con.query("UPDATE part_requirements SET associated_model = (?), associated_trimline = (?), associated_part = (?), quantity = (?) WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.deleteOne = function(con, cb, params) {
    con.query("DELETE FROM part_requirements WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}
