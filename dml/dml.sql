--Data Manipulation Queries

--INSERTIONS

--Insert a new model
INSERT INTO models (name, base_trimline) VALUES (:name_in, :trimline_in)

--Insert a new trimline

INSERT INTO trimlines (name, model, default_color) VALUES (:name_in, :model_in, color_in)

--Insert a new color

INSERT INTO colors (name) VALUES (:name_in)

--Insert a new part

INSERT INTO parts (name, quantity_on_hand, cost) VALUES (:name_in, :quant_in, :cost_in)

--Insert a new part requirement

--NOTE: Either associated_model or associated_trimline must be NULL.

INSERT INTO part_requirements (associated_model, associated_trimline, associated_part, quantity) VALUES (:model_in, :trim_in; :part_in, :quant_in)

--Insert a new model/color pairing

INSERT INTO model_colors (color, model) VALUES (:color_in, :model_in)

--Add default trimline to model (necessary because a model must exist before a trimline can be created for it)

UPDATE models SET base_trimline = :trim_in WHERE id = :id_in

--Insert a new order

INSERT INTO orders (customer, trimline, color) VALUES (:customer_in, :trimline_in, :color_in)

--DELETIONS

--Delete an order

DELETE FROM orders WHERE id = :id_in

--Delete a model/color pairing

DELETE FROM model_colors WHERE color = :color_in AND model = :model_in

--Delete a color

DELETE FROM colors WHERE name = :color_in

--Remove color choice from order (functional deletion of relationship)

UPDATE orders SET color = NULL WHERE id = :id_in

--UPDATES

--Change on-hand stock of a part

UPDATE parts SET quantity_on_hand = :quant_in WHERE id = :id_in;

--SELECTS

--Show trimlines available for a given model.

SELECT m.name, t.name FROM models m INNER JOIN trimlines t

--Show parts and costs for each for a specific trimline.

SELECT p.name, pr.quantity as quantity, p.cost, pr.quantity * p.cost AS total_cost FROM part_requirements pr
  INNER JOIN parts p ON pr.associated_trimline = :trim_in OR pr.associated_model = (
    SELECT m.id FROM trimlines t INNER JOIN models m ON t.id = :trim_in AND t.model = m.id)
    AND p.id = pr.associated_part
  GROUP BY p.name;

--Show total costs needed for a specific order.

SELECT o.id, o.customer, m.name, t.name, o.color, SUM(p.cost * pr.quantity) AS part_cost
  FROM orders o
  INNER JOIN trimlines t ON o.trimline = t.id
  INNER JOIN models m ON t.model = m.id
  INNER JOIN part_requirements pr ON pr.associated_trimline = t.id OR pr.associated_model = m.id
  INNER JOIN parts p ON p.id = pr.associated_part
  WHERE o.id = :order_in;
