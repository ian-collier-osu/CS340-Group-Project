// Defines objects shared by table meta / tables.js

const FieldTypeEnum = {
    UNEDITABLE: 0,
    FOREIGN_KEY: 1,
    TEXT: 2,
    NUMBER: 3,
    CURRENCY_USD: 4
};

// Last 3 params optional if not FK
function ColumnMeta(displayName, keyName, fieldType, fkRoute, fkKey, fkValue) {
    this.displayName = displayName;
    this.keyName = keyName;
    this.fieldType = fieldType;
    this.fkRoute = fkRoute;
    this.fkValue = fkValue;
    this.fkKey = fkKey;
};
