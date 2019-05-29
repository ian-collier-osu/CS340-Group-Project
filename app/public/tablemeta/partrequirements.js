var routesData = {
    mainUrl: "/PartRequirements",
    primaryKey: "id",
    columnMetas: [
        new ColumnMeta("Associated Model", "associated_model", FieldTypeEnum.FOREIGN_KEY, "/Models", "id", "name"),
        new ColumnMeta("Associated Trimline", "associated_trimline", FieldTypeEnum.FOREIGN_KEY, "/Trimlines", "id", "name"),
        new ColumnMeta("Associated Part", "associated_part", FieldTypeEnum.FOREIGN_KEY, "/Parts", "id", "name"),
        new ColumnMeta("Quantity", "quantity", FieldTypeEnum.NUMBER)
    ]
};
