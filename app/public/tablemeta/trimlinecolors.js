var routesData = {
    mainUrl: "/TrimlineColors",
    primaryKey: "id",
    columnMetas: [
        new ColumnMeta("Color", "color", FieldTypeEnum.FOREIGN_KEY, "/Colors", "id", "name"),
        new ColumnMeta("Trimline", "trimline", FieldTypeEnum.FOREIGN_KEY, "/Trimlines", "id", "name"),
    ]
};
