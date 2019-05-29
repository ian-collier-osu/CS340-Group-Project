exports.readAll = function(con, cb, params) {
    con.query("SELECT id, name, quantity_on_hand, cost FROM parts ORDER BY id", function(err, rows) {
      cb(rows, err);
    });
}

exports.readOne = function(con, cb, params) {
    con.query("SELECT id, name, quantity_on_hand, cost FROM parts WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createOne = function(con, cb, params) {
    con.query("INSERT INTO parts (name, quantity_on_hand, cost), VALUES (?, ?, ?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.createEmpty = function(con, cb, params) {
    con.query("INSERT INTO parts (name, quantity_on_hand, cost) VALUES ('', 0, 0);", function(err, rows) {
      cb(rows, err);
    });
}

exports.updateOne = function(con, cb, params) {
    con.query("UPDATE parts SET name = (?), quantity_on_hand = (?), cost = (?) WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}

exports.deleteOne = function(con, cb, params) {
    con.query("DELETE FROM parts WHERE id = (?)", params, function(err, rows) {
      cb(rows, err);
    });
}
