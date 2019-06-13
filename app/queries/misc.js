exports.searchCustomer = function(con, cb, params) {
    params[0] = '%' + params[0] + '%';
    con.query(`SELECT o.id, o.customer, m.name, t.name, o.color, SUM(p.cost * pr.quantity) AS part_cost
      FROM orders o
      INNER JOIN trimlines t ON o.trimline = t.id
      INNER JOIN models m ON t.model = m.id
      INNER JOIN part_requirements pr ON pr.associated_trimline = t.id OR pr.associated_model = m.id
      INNER JOIN parts p ON p.id = pr.associated_part
      WHERE o.customer LIKE ?`, params, function(err, rows){
        cb(rows, err);
      });
}
