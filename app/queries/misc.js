exports.searchCustomer = function(con, cb, params) {
    params[0] = '%' + params[0] + '%';
    con.query(`SELECT o.customer AS customer, m.name AS model_name, t.name AS trimline_name, c.name AS color_name, SUM(p.cost * pr.quantity) AS part_cost
      FROM orders o
      INNER JOIN trimlines t ON o.trimline = t.id
      INNER JOIN models m ON t.model = m.id
      INNER JOIN part_requirements pr ON pr.associated_trimline = t.id OR pr.associated_model = m.id
      INNER JOIN parts p ON p.id = pr.associated_part
      INNER JOIN colors c ON c.id = o.color
      WHERE o.customer LIKE ?`, params, function(err, rows){
        cb(rows, err);
      });
}

exports.searchParts = function(con, cb, params) {
    params[0] = '%' + params[0] + '%';
    con.query(`SELECT name, quantity_on_hand, cost FROM parts WHERE name LIKE ?;`, params, function(err, rows){
        cb(rows, err);
    });
}

exports.searchTrimlines = function(con, cb, params) {
  params[0] = '%' + params[0] + '%';
  con.query(`SELECT t.name, t.model FROM trimlines t WHERE t.name LIKE ?;`, params, function(err, rows){
      cb(rows, err);
  });
}

exports.searchModels = function(con, cb, params) {
    params[0] = '%' + params[0] + '%';
    con.query(`select m.name FROM models m WHERE m.name LIKE ?;`, params, function(err, rows){
        cb(rows, err);
    });
}
