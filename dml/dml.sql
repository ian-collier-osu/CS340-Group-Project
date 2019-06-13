--Data Manipulation Queries

--INSERTIONS

--Insert a new model
INSERT INTO models (name, base_trimline) VALUES (:name_in, :trimline_in);

--Insert a new trimline

INSERT INTO trimlines (name, model) VALUES (:name_in, :model_in);

--Insert a new color

INSERT INTO colors (name) VALUES (:name_in);

--Insert a new part

INSERT INTO parts (name, quantity_on_hand, cost) VALUES (:name_in, :quant_in, :cost_in);

--Insert a new part requirement

--NOTE: Either associated_model or associated_trimline must be NULL.

INSERT INTO part_requirements (associated_model, associated_trimline, associated_part, quantity) VALUES (:model_in, :trim_in; :part_in, :quant_in);

--Insert a new trimline/color pairing

INSERT INTO trimline_colors (color, trimline) VALUES (:color_in, :trimline_in);

--Add default trimline to model (necessary because a model must exist before a trimline can be created for it)

UPDATE models SET base_trimline = :trim_in WHERE id = :id_in;

--Insert a new order

INSERT INTO orders (customer, trimline, color) VALUES (:customer_in, :trimline_in, :color_in);

--DELETIONS

--Delete an order

DELETE FROM orders WHERE id = :id_in;

--Delete a trimline/color pairing

DELETE FROM trimline_colors WHERE color = :color_in AND model = :trimline_in;

--Delete a color

DELETE FROM colors WHERE name = :color_in;

--Remove color choice from order (functional deletion of relationship)

UPDATE orders SET color = NULL WHERE id = :id_in;

--UPDATES

--Change on-hand stock of a part

UPDATE parts SET quantity_on_hand = :quant_in WHERE id = :id_in;

--SELECTS

--Get list of trimlines
SELECT name FROM trimlines;

--Get list of models
SELECT name FROM models;

--Get list of colors.
SELECT name FROM colors;

--Get list of parts.

SELECT name FROM parts;

--Show trimlines available for a given model.

SELECT t.name FROM trimlines t WHERE t.name = :model_in;

--Show colors available for a given model.

SELECT c.name AS color FROM trimlines.t
  INNER JOIN trimline_colors tc ON t.id = mc.trimline
  INNER JOIN colors c ON mc.color = c.id
  WHERE t.id = :trimline_in;

--Show parts and costs for each for a specific trimline.

SELECT p.name, pr.quantity as quantity, p.cost, pr.quantity * p.cost AS total_cost FROM part_requirements pr
  INNER JOIN parts p ON pr.associated_trimline = :trim_in OR pr.associated_model = (
    SELECT m.id FROM trimlines t INNER JOIN models m ON t.id = :trim_in AND t.model = m.id)
    AND p.id = pr.associated_part
  GROUP BY p.name;

--Show total costs needed for a specific order.

SELECT o.id, o.customer, m.name AS model, t.name AS trimline, c.name AS color, SUM(p.cost * pr.quantity) AS part_cost
  FROM orders o
  INNER JOIN trimlines t ON o.trimline = t.id
  INNER JOIN models m ON t.model = m.id
  INNER JOIN part_requirements pr ON pr.associated_trimline = t.id OR pr.associated_model = m.id
  INNER JOIN parts p ON p.id = pr.associated_part
  INNER JOIN colors c ON o.color = c.id
  WHERE o.id = :order_in;

  --Show parts need to fulfill a specific order, and their costs.

  SELECT p.name, (pr.quantity - p.quantity_on_hand) AS shortfall, ((pr.quantity - p.quantity_on_hand) * p.cost) AS cost_to_order FROM orders o
    INNER JOIN trimlines t ON o.trimline = t.id
    INNER JOIN models m ON t.model = m.id
    INNER JOIN part_requirements pr ON pr.associated_trimline = t.id OR pr.associated_model = m.id
    INNER JOIN parts p ON p.id = pr.associated_part
    WHERE o.id = :order_in
    HAVING shortfall > 0;

  --Show parts needed to fulfill *all* orders, and their costs.

  SELECT p.name, (pr.quantity - p.quantity_on_hand) AS shortfall, ((pr.quantity - p.quantity_on_hand) * p.cost) AS cost_to_order FROM orders o
    INNER JOIN trimlines t ON o.trimline = t.id
    INNER JOIN models m ON t.model = m.id
    INNER JOIN part_requirements pr ON pr.associated_trimline = t.id OR pr.associated_model = m.id
    INNER JOIN parts p ON p.id = pr.associated_part
    HAVING shortfall > 0;

--Search/filter by name.

--Order

SELECT o.id, o.customer, o.trimline, c.name AS color FROM orders o
  INNER JOIN colors c ON o.color = c.id
  WHERE customer LIKE "%:nameinput%";

--Model

SELECT id, name, base_trimline FROM models where name LIKE "%:nameinput%";

--Trimline

SELECT t.id, t.name, t.model FROM trimlines t
  WHERE t.name LIKE "%:nameinput%";

--Part

select id, name, quantity_on_hand, cost FROM parts WHERE name LIKE "%:nameinput%";
