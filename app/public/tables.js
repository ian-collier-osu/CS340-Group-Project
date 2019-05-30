//
// jQuery for editable tables
//

// -- Const vars --

// Edit row
const TEXT_EDIT_BUTTON_EDITING = "Finish";
const CLASS_EDIT_BUTTON_EDITING = "table-row-btn-stop-edit";

const TEXT_EDIT_BUTTON_NOT_EDITING = "Edit";
const CLASS_EDIT_BUTTON_NOT_EDITING = "table-row-btn-start-edit";

// Delete row
const TEXT_DELETE_BUTTON = "Delete";
const CLASS_DELETE_BUTTON = "table-row-btn-delete";

// TODO fix the undelete
const TEXT_DELETE_BUTTON_DELETED = "Deleted";
const CLASS_DELETE_BUTTON_DELETED = "table-row-btn-undelete";

// Editable field marker
const CLASS_EDITABLE_TABLE_CELL = "table-item-editable";
const CLASS_EDITING_TABLE_CELL = "table-item-editing";

// Table buttons
const CLASS_SAVE_BUTTON = "table-btn-save";
const CLASS_ADD_BUTTON = "table-btn-add";
const CLASS_RELOAD_BUTTON = "table-btn-reload";

// Table decoration classes
const CLASS_MODIFIED_INDICATOR = "modified-indicator";
const CLASS_DELETED_INDICATOR = "deleted-indicator";

const UNDEFINED_ITEM_VALUE = "?";
const NULL_ITEM_VALUE = "(null)";

// Latest state of a row
const RowStateEnum = {
    UNMODIFIED : 0,
    UPDATED : 1,
    DELETED : 2
    // Note - all creates are handled under UPDATED
}

// -- Object definitions --

// Functions for page AJAX requests
function PageRequests() {

    var parent = this;

    this.refreshPage = function() {
        // Fetch main data
        console.log("GET: " + pageData.mainRoute);
        $.ajax({
            url : routesData.mainUrl,
            type : 'GET',
            success : function(res) {
                pageData.setTableRows(res);
            },
            error : function(res, error)
            {
                parent._refreshError(res);
            }
        });

        // Fetch foreign key data for each column
        var i = 0; // Col index
        for(tableColumn of pageData.tableColumns) {
            if(tableColumn.columnMeta.fieldType == FieldTypeEnum.FOREIGN_KEY) {
                console.log("GET: " + tableColumn.columnMeta.fkRoute);

                // Fixes annoying closure issue
                var reqFunc = function(columnIndex) {
                    $.ajax({
                        url : tableColumn.columnMeta.fkRoute,
                        type : 'GET',
                        success : function(res) {
                            pageData.setTableFKData(columnIndex, res);
                            // Redraw
                            editableTable.populate();
                        },
                        error : function(res, error)
                        {
                            parent._refreshError(res);
                        }
                    });
                }
                reqFunc(i);
            }

            i++;
        }
    }

    this._refreshError = function(res) {
        alert("Server error: Failed to load page data.");
        console.log(JSON.stringify(res));
    }

    this._commitError = function(res) {
        alert("Server error: Failed to commit.");
        console.log(JSON.stringify(res));
    }
}

function TableChange(contents, rowIndex) {
  this.rowContents = contents; // Row contents at this point
  this.rowIndex = rowIndex;
}

function TableColumn(columnMeta, fkDict) {
    if(fkDict === undefined) fkDict = {};
    this.fkDict = fkDict; // K = PK, V = Text name
    this.columnMeta = columnMeta; // Passed in from handlebars
}

function TableRow(primaryKey, displayedItems, rawItems, isNew) {
    this.primaryKey = primaryKey; // Primary key value
    this.displayedItems = displayedItems; // Array of items to draw in the table (aka FKs are replaced w/ display values)
    this.rawItems = rawItems; // Array of real data from the DB
    this.isNew = isNew; // Is a row created in this session
    this.rowState = RowStateEnum.UNMODIFIED;
}

// Stores current page data
function PageData() {
    this.primaryKey = "";
    this.mainRoute = "";
    this.tableColumns = [];
    this.tableChanges = [];
    this.tableRows = [];

    var parent = this;

    // Initialize from passed in data
    this.init = function(routesData) {
        parent.mainRoute = routesData.mainUrl;
        parent.primaryKey = routesData.primaryKey;
        parent._setTableColumns(routesData.columnMetas);
    }

    // Add a new change
    this.pushTableChange = function(tableChange) {
        parent.tableChanges.push(tableChange);
        parent._applyTableChange(tableChange);
    }

    // Undo a change
    this.popTableChange = function() {
        if(parent.tableChanges.length > 0) {
            var tableChange = parent.tableChanges.pop();
            parent._applyTableChange(tableChange);
            return tableChange;
        } else {
            return null;
        }
    }

    // Apply a change to the stored data
    this._applyTableChange = function(tableChange) {
        // Apply change to raw row data
        // Fetch the correct FK value for each field if needed
        // Set row state
    }

    // Set table rows based on response
    this.setTableRows = function(responseData) {
        parent.tableRows = [];

        if(responseData.length > 0) {
            // Add all rows from response to table
            for(responseRow of responseData) {
                var rawItems = [];
                var primaryKeyVal;

                // Map each row's values to an array
                Object.keys(responseRow).forEach(function(key) {
                    var responseItem = responseRow[key];

                    // Leave out the PK
                    if(key != parent.primaryKey) {
                        if(responseItem == null) responseItem = NULL_ITEM_VALUE;
                        rawItems.push(responseItem);
                    } else {
                        primaryKeyVal = responseItem;
                    }
                });

                // Add a new row
                parent.tableRows.push(new TableRow(primaryKeyVal, rawItems, rawItems, false))
            }
        }
    }

    // Set columns based on passed in data
    this._setTableColumns = function(columnMetaArr) {
        parent.tableColumns = [];
        for(columnMeta of columnMetaArr) {
            parent.tableColumns.push(new TableColumn(columnMeta));
        }
    }

    // Set FK info for rows/cols based on response
    this.setTableFKData = function(columnIndex, responseData) {
        var tableColumn = parent.tableColumns[columnIndex];
        // Map response rows to column fk dict
        if(responseData.length > 0) {
            for(responseRow of responseData) {
                // Ex: fkDict[responseRow['id']] = responseRow['name']
                tableColumn.fkDict[responseRow[tableColumn.columnMeta.fkKey]] = responseRow[tableColumn.columnMeta.fkValue];
            }
        }
        console.log("Column " + columnIndex + " foreign keys: " + JSON.stringify(tableColumn.fkDict));
        // For each row set col to proper display val
        for(tableRow of parent.tableRows) {
            var displayedItem = tableColumn.fkDict[tableRow.rawItems[columnIndex]];
            if(displayedItem !== undefined) {
                tableRow.displayedItems[columnIndex] = displayedItem;
            } else {
                // TODO change this
                tableRow.displayedItems[columnIndex] = UNDEFINED_ITEM_VALUE;
            }
        }
    }

    // Creates and returns empty row, returns index of
    this.addEmptyRow = function() {
        var newRowItems = [];
        for(tableColumn of parent.tableColumns) {
            var fieldType = tableColumn.columnMeta.fieldType;
            var newRowItem = UNDEFINED_ITEM_VALUE;

            switch(fieldType) {
                case FieldTypeEnum.TEXT:
                    newRowItem = "";
                    break;
                case FieldTypeEnum.NUMBER:
                    newRowItem = 0;
                    break;
            }
            newRowItems.push(newRowItem);
        }

        var newRow = new TableRow(null, newRowItems, newRowItems, true);
        newRow.rowState = RowStateEnum.UPDATED;
        parent.tableRows.push(newRow);
        return parent.tableRows.length - 1;
    }
}

// -- HTML element builders --

function ElementBuilder() {
    var parent = this;

    // Creates a static HTML elem for a cell
    this.buildStaticCellElement = function(row, col) {
        var $newElem;
        var fieldContent = pageData.tableRows[row].displayedItems[col];
        $newElem = $('<p>').text(fieldContent);
        return $newElem;
    }

    // Creates an editable HTML elem for a cell
    this.buildEditableCellElement = function(row, col) {
        var $newElem;
        var fieldType = pageData.tableColumns[col].columnMeta.fieldType;
        var fieldContent = pageData.tableRows[row].displayedItems[col];

        // Do a lookup for the intended type
        switch(fieldType) {
            // Text field
            case FieldTypeEnum.TEXT:
                $newElem = $('<input>').attr({
                    type: 'text',
                    value: fieldContent
                });
                break;
            // Number field
            case FieldTypeEnum.NUMBER:
                $newElem = $('<input>').attr({
                    type: 'number',
                    min: '0',
                    value: fieldContent
                });
                break;
            // Drop down menu
            case FieldTypeEnum.FOREIGN_KEY:
                $newElem = $('<select>');
                Object.keys(pageData.tableColumns[col].fkDict).forEach(function(key) {
                    var val = pageData.tableColumns[col].fkDict[key];
                    // Hidden value = fk key, Text = fk fetched value
                    var $newElemOption =  $('<option>')
                        .attr({
                            value: key
                        })
                        .text(val);
                    $newElem.append($newElemOption);
                });
                // Set currently selected item if valid
                var selectedKey = pageData.tableRows[row].rawItems[col];
                if(pageData.tableColumns[col].fkDict[selectedKey] !== undefined) {
                    $newElem.val(selectedKey);
                }
                break;
            default:
                $newElem = undefined;
                break;
        }

        return $newElem;
    }

    this.buildNewRowElement = function() {
        var $newRow = parent.buildRowElement(pageData.addEmptyRow());
        return $newRow;
    }

    this.buildRowElement = function(row) {
        var $newRow = $('<tr>');

        for(var i = 0; i < pageData.tableColumns.length; i++) {
            var $staticInnerItem = parent.buildStaticCellElement(row, i);
            var $editInnerItem = parent.buildEditableCellElement(row, i);

            // Create new data item
            var $newCell = $('<td>');

            // If editable add the hidden element as well
            if($editInnerItem !== undefined) {
                $staticInnerItem.addClass(CLASS_EDITABLE_TABLE_CELL);
                $editInnerItem.addClass(CLASS_EDITING_TABLE_CELL);
                //$editInnerItem.hide();
                $newCell.append($editInnerItem);
            }
            $newCell.append($staticInnerItem);

            // Append new item to row
            $newRow.append($newCell);
        }

        // Add the delete button
        var $deleteBtn = $('<button>')
            .attr({
                type: 'button'
            })
            .addClass(CLASS_DELETE_BUTTON)
            .text(TEXT_DELETE_BUTTON);
        $newRow.append($('<td>').append($deleteBtn));

        return $newRow;
    }

    // Fills in the table from pageData
    this.buildTable = function() {
        // Clear table
        editableTable.$element.empty();

        // Header
        var $tableHead = $('<thead>');
        editableTable.$element.append($tableHead);

        var $newHeader = $('<tr>');
        for (tableColumn of pageData.tableColumns) {
            var $newHeaderItem = $('<td>')
                .text(tableColumn.columnMeta.displayName);
            $newHeader.append($newHeaderItem);
        }
        $tableHead.append($newHeader);

        // Body
        var $tableBody = $('<tbody>');
        editableTable.$element.append($tableBody);
    }
}

// -- Table DOM object --

function EditableTable() {
    this.$element = $('#editable-table');

    var parent = this;

    // Turns on editing for full row
    this._enableRowEdit = function(row) {
        for(var i = 0; i < pageData.tableColumns.length; i++) {
            parent.enableCellEdit(row, i);
        }
    }

    this.enableCellEdit = function(row, col) {
        var $thisCell = parent._getCellElem(row, col);

        var $staticElem = $thisCell.find('.' + CLASS_EDITABLE_TABLE_CELL);
        var $editElem = $thisCell.find('.' + CLASS_EDITABLE_TABLE_CELL);

        if($staticElem !== undefined && $editElem !== undefined) {
            $staticElem.hide();
            $editElem.show();
        }
    }

    this._markCellEdited = function(row, col) {
        var $thisCell = parent._getCellElem(row, col);
        $thisCell.addClass(CLASS_MODIFIED_INDICATOR);
    }

    this._markRowDeleted = function(row, isDeleted) {
        var $thisRow = parent._getRowElem(row);
        if(isDeleted) {
            $thisRow.addClass(CLASS_DELETED_INDICATOR);
        } else {

        }
    }

    this._getCellElem = function(row, col) {
        return $("td", parent._getRowElem(row)).eq(col);
    }

    this._getRowElem = function(row) {
        return $('tr', parent.$element).eq(row);
    }

    this.createRow = function() {
        var $rowElem = elementBuilder.buildNewRowElement();
        parent.$element.find('tbody').append($rowElem);
        parent._enableRowEdit($rowElem.index());
    }

    this.updateCell = function(row, col, rawValue, displayValue) {
        parent._markCellEdited(row, col);
        var tableRow = pageData.tableRows[row];
        tableRow.rawItems[col] = rawValue;
        tableRow.displayedItems[col] = displayValue;
        tableRow.rowState = RowStateEnum.UPDATED;
    }

    this.deleteRow = function(row) {
        parent._markRowDeleted(row, true);
        var tableRow = pageData.tableRows[row];
        tableRow.rowState = RowStateEnum.DELETED;
    }

    this.undeleteRow = function(row) {
        parent._markRowDeleted(row, false);
        var tableRow = pageData.tableRows[row];
        tableRow.rowState = RowStateEnum.UPDATED;
    }

    this.undo = function() {
        // TODO
    }

    this.populate = function() {
        var $tableBody = parent.$element.find('tbody');
        $tableBody.empty();

        for(var i = 0; i < pageData.tableRows.length; i++) {
            var $newRow = elementBuilder.buildRowElement(i);
            $tableBody.append($newRow);
        }
    }
}

// -- Global vars --

var pageData = new PageData();
var pageRequests = new PageRequests();
var elementBuilder = new ElementBuilder();
var editableTable = new EditableTable();

// -- Init --

$(document).ready(function() {
    if(routesData == undefined) {
        alert("Error: Meta file unspecified.");
    }

    pageData.init(routesData);
    elementBuilder.buildTable();
    pageRequests.refreshPage();
});

// -- HTML listeners --

// Listen for click on static cell field, changes static -> editable
$(document).on('click', '.' + CLASS_EDITABLE_TABLE_CELL, function() {
    console.log("Clicked: " + row + ", " + col);
    var row = $(this).closest("tr").index();
    var col = $(this).closest("td").index();
    editableTable.enableCellEdit(row, col);
});

// Listen for changes in text fields to update the table contents
$(document).on('change', '.' + CLASS_EDITING_TABLE_CELL, function() {
    var row = $(this).closest("tr").index();
    var col = $(this).closest("td").index();
    console.log("Changed: " + row + ", " + col);
    if($(this).is('input')) {
        editableTable.updateCell(row, col, $(this).val(), $(this).val());

    } else if($(this).is('option')) {
        $selection = $(this).find("option:selected");
        editableTable.updateCell(row, col, $selection.val(), $selection.text());
    }

});

// Delete button in row
$(document).on('click', '.' + CLASS_DELETE_BUTTON, function () {

    // Get current row
    var row = $(this).closest('tr').index;
    editableTable.deleteRow(row);

    $(this).text(TEXT_DELETE_BUTTON_DELETED);
    $(this).removeClass(CLASS_DELETE_BUTTON).addClass(CLASS_DELETE_BUTTON_DELETED);
});

// Undelete button in row
$(document).on('click', '.' + CLASS_DELETE_BUTTON_DELETED, function () {
    // Get current row
    var row = $(this).closest('tr').index;
    editableTable.deleteRow(row);

    $(this).text(TEXT_DELETE_BUTTON_DELETED);
    $(this).removeClass(CLASS_DELETE_BUTTON).addClass(CLASS_DELETE_BUTTON_DELETED);
});

$(document).on('click', '.' + CLASS_ADD_BUTTON, function() {
    editableTable.createRow();
});

$(document).on('click', '.' + CLASS_SAVE_BUTTON, function () {
    commitTableChanges();
    // Make an AJAX request to commit rows to the DB
});

$(document).on('click', '.' + CLASS_RELOAD_BUTTON, function () {
    var c = confirm("This will delete your changes. Are you sure?");
    if(c) {
        pageRequests.refreshPage();
    }

    // Make an AJAX request to commit rows to the DB
});

var commitRequestCounter;

function commitTableChanges() {
    // TODO show loading thing

    // Count the requests needed to fulfill a commit
    commitRequestCounter = 0;
    for(rowState of pageData.rowStates) {
        if(rowState != RowStateEnum.UNMODIFIED) {
            commitRequestCounter++;
        }
    }

    if(commitRequestCounter == 0) {
        alert("No changes to commit.");
        return;
    }

    alert("Please wait for table to refresh.");

    // Execute the requests
    for(var i = 0; i < pageData.rowStates.length; i++) {
        var rowState = pageData.rowStates[i];
        var rowContent = pageData.tableContents[i];

        switch (rowState) {
            case RowStateEnum.DELETED:
                commitDelete(rowContent);
                break;
            case RowStateEnum.UPDATED:
                commitUpdate(rowContent);
                break;
        }
    }
}

function commitDelete(rowContent) {
    if(rowContent[0] != UNDEFINED_ITEM_VALUE) {
        // Only delete if not a new row
        console.log("Delete commit.");
        $.ajax({
            url : routesData.mainUrl + "/" + rowContent[0],
            type : 'DELETE',
            success : function(data) {
                commitFinish();
            },
            error : function(request,error)
            {
                commitError(request);
            }
        });
    } else {
        commitFinish();
    }
}

function commitUpdate(rowContent) {
    // Build request data
    var ajaxUpdateData = {};
    for (var i = 1; i < routesData.columnParamNames.length; i++) {
        var paramName = routesData.columnParamNames[i];
        var paramVal = rowContent[i];
        if(paramVal != NULL_ITEM_VALUE) {
            ajaxUpdateData[paramName] = paramVal;
        }
    }

    if(rowContent[0] != UNDEFINED_ITEM_VALUE) {
        // If not a new row just update
        console.log("Update commit.");
        $.ajax({
            url : routesData.mainUrl + "/" + rowContent[0],
            type : 'POST',
            data : ajaxUpdateData,
            dataType: 'json',
            success : function(data) {
                commitFinish();
            },
            error : function(request,error)
            {
                commitError(request);
            }
        });

    } else {
        console.log("Create commit.");
        // TODO need to get id back
        // If a new row create first, then update
        // Create
        $.ajax({
            url : routesData.mainUrl,
            type : 'PUT',
            success : function(data) {
                // Update
                commitFinish();
                // alert("PUT result: "+JSON.stringify(data));
                // $.ajax({
                //     url : routesData.mainUrl + "/" + rowContent[0],
                //     type : 'POST',
                //     data : ajaxUpdateData,
                //     dataType: 'json',
                //     success : function(data) {
                //         commitFinish();
                //     },
                //     error : function(request,error)
                //     {
                //         commitError(request);
                //     }
                // });
            },
            error : function(request,error)
            {
                commitError(request);
            }
        });
    }
}


// Checks if all commits requests have been executed
function commitFinish() {
    commitRequestCounter--;
    if(commitRequestCounter <= 0) {
        ajaxRefreshTable();
    }
}

function commitError(req) {
    alert("Failed to commit: "+JSON.stringify(req));
    ajaxRefreshTable();
}


// TODO Need something to listen for a change in editable field classes to update value in mem and mark color

// TODO new function that takes cell of origin and intended marker -- marks row and sets visuals


// TODO change stack

var tableChangesArr = [];

function pushChange(tableChange) {
    tableChangesArr.push(tableChange);
    applyTableChange(tableChange);
}

function popChange() {
    var tableChange = tableChangesArr.pop();
    applyTableChange(tableChange);
}

// Applies change to table contents
function applyTableChange(tableChange) {

}

function flattenTableChanges() {

}
