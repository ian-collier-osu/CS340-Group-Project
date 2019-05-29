var routesData = {
    mainUrl: "/Models",
    primaryKey: "id",
    columnMetas: [
        new ColumnMeta("Name", "name", FieldTypeEnum.TEXT),
        new ColumnMeta("Base Trimline", "base_trimline", FieldTypeEnum.FOREIGN_KEY, "/Trimlines", "id", "name")
    ]
};
