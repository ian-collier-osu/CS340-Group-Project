var routesData = {
    mainUrl: "/Trimlines",
    primaryKey: "id",
    columnMetas: [
        new ColumnMeta("Name", "name", FieldTypeEnum.TEXT),
        new ColumnMeta("Model", "model", FieldTypeEnum.FOREIGN_KEY, "/Models", "id", "name"),
        new ColumnMeta("Default Color", "default_color", FieldTypeEnum.FOREIGN_KEY, "/Colors", "id", "name")
    ]
};
