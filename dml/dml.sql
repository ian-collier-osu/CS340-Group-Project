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

INSERT INTO part_requirements (associated_model, associated_trimline, associated_part, quantity) VALUES (:model_in, :trim_in; :part_in, :quant_in)

--Insert a new model/color pairing

INSERT INTO model_colors (color, model) VALUES (:color_in, :model_in)

--Add default trimline to model (necessary because a model must exist before a trimline can be created for it)

UPDATE models SET base_trimline = :trim_in WHERE id = :id_in

--DELETIONS

--Delete an order

DELETE FROM orders WHERE id = :id_in

--Delete a model/color pairing

DELETE FROM model_colors WHERE color = :color_in AND model = :model_in

--Remove color choice from order (functional deletion of relationship)

UPDATE orders SET color = NULL WHERE id = :id_in

--UPDATES

--Change on-hand stock of a part

UPDATE parts SET quantity_on_hand = :quant_in WHERE id = :id_in;

--SELECTS

--Show model information by given ID.

