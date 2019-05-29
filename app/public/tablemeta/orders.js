var routesData = {
    mainUrl: "/Orders",
    primaryKey: "id",
    columnMetas: [
        new ColumnMeta("Customer", "customer", FieldTypeEnum.TEXT),
        new ColumnMeta("Base Trimline", "base_trimline", FieldTypeEnum.FOREIGN_KEY, "/Trimlines", "id", "name"),
        new ColumnMeta("Color", "color", FieldTypeEnum.FOREIGN_KEY, "/Colors", "id", "name")
    ]
};
