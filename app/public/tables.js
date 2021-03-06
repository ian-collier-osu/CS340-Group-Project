//
// jQuery for editable tables
//

// -- Const vars --

// Known bugs:

// Drop downs on new rows dont auto change when Clicked
// No changes doesnt work sometimes, try making a row blank then committing
// Orders page update error
// Colors page name update doesnt work
// Need trimline colors page

// Edit row
const TEXT_EDIT_BUTTON_EDITING = "Finish";
const CLASS_EDIT_BUTTON_EDITING = "table-row-btn-stop-edit";

const TEXT_EDIT_BUTTON_NOT_EDITING = "Edit";
const CLASS_EDIT_BUTTON_NOT_EDITING = "table-row-btn-start-edit";

// Delete row
const TEXT_DELETE_BUTTON = "Delete";
const CLASS_DELETE_BUTTON = "table-row-btn-delete";

// TODO fix the undelete
const TEXT_DELETE_BUTTON_DELETED = "Undelete";
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

const CommitTypeEnum = {
    CREATE: 0,
    UPDATE: 1,
    DELETE: 2
}

function CommitRequest(label, type) {
    this.label = label;
    this.type = type;
}



// -- Object definitions --

// Functions for page AJAX requests
function PageRequests() {
    this.commitRequestStack = [];

    var parent = this;

    this.commitTableChanges = function() {
        // Keeps track of loading types, for err handling
        parent.commitRequestStack = [];

        // Count the requests needed to fulfill a commit
        var commitRequestCounter = [];
        for(tableRow of pageData.tableRows) {
            if(tableRow.rowState != RowStateEnum.UNMODIFIED) {
                commitRequestCounter++;
            }
        }

        if(parent.commitRequestCounter == 0) {
            alert("No changes to commit.");
            return;
        }

        // Show loading thing
        editableTable.loadStart(1000);

        // Execute the requests
        for(var i = 0; i < pageData.tableRows.length; i++) {
            var tableRow = pageData.tableRows[i];

            switch (tableRow.rowState) {
                case RowStateEnum.DELETED:
                    parent._commitDelete(tableRow);
                    break;
                case RowStateEnum.UPDATED:
                    parent._commitUpdate(tableRow);
                    break;
            }
        }
    }


    this.refreshPage = function() {
        // Fetch main data
        console.log("GET: " + pageData.mainRoute);
        $.ajax({
            url : routesData.mainUrl,
            type : 'GET',
            success : function(res) {
                pageData.setTableRows(res);
                editableTable.populate();
                editableTable.loadStop(1000);
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
                editableTable.loadStart(0);

                // Fixes annoying closure issue
                var reqFunc = function(columnIndex) {
                    $.ajax({
                        url : tableColumn.columnMeta.fkRoute,
                        type : 'GET',
                        success : function(res) {
                            pageData.setTableFKData(columnIndex, res);
                            // Redraw
                            editableTable.populate();
                            editableTable.loadStop(1000);
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


    this._commitDelete = function(tableRow) {
        if(tableRow.primaryKey != null) {
            // Only delete if not a new row
            console.log("Delete commit.");
            parent.commitRequestStack.push(new CommitRequest(tableRow.displayedItems[0], CommitTypeEnum.DELETE));
            $.ajax({
                url : routesData.mainUrl + "/" + tableRow.primaryKey,
                type : 'DELETE',
                success : function(data) {
                    parent._commitFinish();
                },
                error : function(request,error)
                {
                    parent._commitError(request);
                }
            });
        } else {
            parent._commitFinish();
        }
    }

    this._commitUpdate = function(tableRow) {
        if(tableRow.primaryKey != null) {
            // If not a new row just update
            var ajaxUpdateData = {};
            for(i = 0; i < pageData.tableColumns.length; i++) {
                var key = pageData.tableColumns[i].columnMeta.keyName;
                var value = tableRow.rawItems[i];
                ajaxUpdateData[key] = value;
            }
            console.log("Updating " + tableRow.primaryKey + ": " + JSON.stringify(ajaxUpdateData));

            console.log("Update commit.");
            parent.commitRequestStack.push(new CommitRequest(tableRow.displayedItems[0], CommitTypeEnum.UPDATE));
            $.ajax({
                url : routesData.mainUrl + "/" + tableRow.primaryKey,
                type : 'POST',
                data : ajaxUpdateData,
                dataType: 'json',
                success : function(data) {
                    parent._commitFinish();
                },
                error : function(request,error)
                {
                    parent._commitError(request);
                }
            });

        } else {
            console.log("Create commit.");
            parent.commitRequestStack.push(new CommitRequest(tableRow.displayedItems[0], CommitTypeEnum.CREATE));
            // Create
            $.ajax({
                url : routesData.mainUrl,
                type : 'PUT',
                success : function(data) {
                    parent._commitFinish();
                },
                error : function(request,error)
                {
                    parent._commitError(request);
                }
            });
        }
    }

    this._commitFinish = function() {
        parent.commitRequestStack.pop();
        if(parent.commitRequestStack.length <= 0) {
            editableTable.loadStop(1000);
            pageRequests.refreshPage();
        }
    }

    this._refreshError = function(res) {
        alert("Server error: Failed to load page data.");
        // Go back?
        console.log(JSON.stringify(res));
        editableTable.loadStop(1000);
    }

    this._commitError = function(res) {
        var requestItem = parent.commitRequestStack.pop();
        switch (requestItem.type) {
            case CommitTypeEnum.DELETE:
                alert("Error: Failed to delete row '" + requestItem.label + "'. Is this referenced by another table?");
                break;
            case CommitTypeEnum.UPDATE:
                alert("Error: Failed to update row '" + requestItem.label + "'. Were the entered values valid?");
            case CommitTypeEnum.CREATE:
                alert("Error: Failed to create a new row.");
            default:
                alert("Error: Unknown error occured.");
        }
        console.log(JSON.stringify(res));
        editableTable.loadStop(1000);
        location.reload();
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

    this.printDebug = function() {
        console.log("Primary Key: " + parent.primaryKey);
        console.log("Main Route: " + parent.mainRoute);
        console.log("Table Columns: " + parent.tableColumns);
        console.log("Table Rows: " + parent.tableRows);
    }

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
                var displayItems = [];
                var primaryKeyVal;

                // Map each rows values to an array
                Object.keys(responseRow).forEach(function(key) {
                    var responseItem = responseRow[key];

                    // Leave out the PK
                    if(key != parent.primaryKey) {
                        if(responseItem == null) responseItem = NULL_ITEM_VALUE;
                        rawItems.push(responseItem);
                        displayItems.push(responseItem);
                    } else {
                        primaryKeyVal = responseItem;
                    }
                });



                // Add a new row
                parent.tableRows.push(new TableRow(primaryKeyVal, displayItems, rawItems, false))
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
                    newRowItem = "?";
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
                console.log("selected key: " + selectedKey);
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
        var $newRow = parent.buildRowElement(pageData.addEmptyRow(), true);
        return $newRow;
    }

    this.buildRowElement = function(row, isStatic) {
        var $newRow = $('<tr>');

        for(var i = 0; i < pageData.tableColumns.length; i++) {
            var $staticInnerItem = parent.buildStaticCellElement(row, i);
            if(!isStatic) {
                var $editInnerItem = parent.buildEditableCellElement(row, i);
            }

            // Create new data item
            var $newCell = $('<td>');

            // If editable add the hidden element as well
            if($editInnerItem !== undefined) {
                $staticInnerItem.addClass(CLASS_EDITABLE_TABLE_CELL);
                $editInnerItem.addClass(CLASS_EDITING_TABLE_CELL);
                $editInnerItem.hide();
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

    this._disableRowEdit = function(row) {
        for(var i = 0; i < pageData.tableColumns.length; i++) {
            parent.disableCellEdit(row, i);
        }
    }

    this.disableCellEdit = function(row, col) {
        var $thisCell = parent._getCellElem(row, col);

        var $staticElem = $thisCell.find('.' + CLASS_EDITABLE_TABLE_CELL);
        var $editElem = $thisCell.find('.' + CLASS_EDITING_TABLE_CELL);

        if($staticElem !== undefined && $editElem !== undefined) {
            $staticElem.show();
            $editElem.hide();
        }
    }

    this.enableCellEdit = function(row, col) {
        if(parent._getRowElem(row).hasClass(CLASS_DELETED_INDICATOR)) return;

        var $thisCell = parent._getCellElem(row, col);

        var $staticElem = $thisCell.find('.' + CLASS_EDITABLE_TABLE_CELL);
        var $editElem = $thisCell.find('.' + CLASS_EDITING_TABLE_CELL);

        if($staticElem !== undefined && $editElem !== undefined) {
            $staticElem.hide();
            $editElem.show();
        }
    }

    this._markCellEdited = function(row, col, displayVal) {
        var $thisCell = parent._getCellElem(row, col);
        $thisCell.find('.' + CLASS_EDITABLE_TABLE_CELL).text(displayVal);
        $thisCell.addClass(CLASS_MODIFIED_INDICATOR);
    }

    this._markRowDeleted = function(row, isDeleted) {
        var $thisRow = parent._getRowElem(row);
        if(isDeleted) {
            $thisRow.addClass(CLASS_DELETED_INDICATOR);
        } else {
            $thisRow.removeClass(CLASS_DELETED_INDICATOR);
        }
    }

    this._getCellElem = function(row, col) {
        return $("td", parent._getRowElem(row)).eq(col);
    }

    this._getRowElem = function(row) {
        return $('tr', parent.$element).eq(row + 1);
    }

    this.createRow = function() {
        var $rowElem = elementBuilder.buildNewRowElement();
        parent.$element.find('tbody').append($rowElem);
        parent._enableRowEdit($rowElem.index());
    }

    this.updateCell = function(row, col, rawValue, displayValue) {
        parent._markCellEdited(row, col, displayValue);
        var tableRow = pageData.tableRows[row];
        tableRow.rawItems[col] = rawValue;
        tableRow.displayedItems[col] = displayValue;
        console.log("Displayed: " + JSON.stringify(tableRow.displayedItems));
        console.log("Raw: " + JSON.stringify(tableRow.rawItems));
        tableRow.rowState = RowStateEnum.UPDATED;
    }

    this.deleteRow = function(row) {
        var tableRow = pageData.tableRows[row];
        if(tableRow.rowState == RowStateEnum.DELETED) {
            parent._markRowDeleted(row, false);
            tableRow.rowState = RowStateEnum.UPDATED;
        } else {
            parent._disableRowEdit(row);
            parent._markRowDeleted(row, true);
            tableRow.rowState = RowStateEnum.DELETED;
        }
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
            var $newRow = elementBuilder.buildRowElement(i, false);
            $tableBody.append($newRow);
        }
    }

    this.loadStart = function(delay) {
        $('#loadingOverlay').fadeIn(delay);
        $('#mainContent').fadeOut(delay);
    }

    this.loadStop = function(delay) {
        $('#loadingOverlay').fadeOut(delay);
        $('#mainContent').fadeIn(delay);
    }
}

// -- Global vars --

var pageData = new PageData();
var pageRequests = new PageRequests();
var elementBuilder = new ElementBuilder();
var editableTable = new EditableTable();

// -- Init --

$(document).ready(function() {
    editableTable.loadStart(0);

    if(routesData == undefined) {
        alert("Error: Meta file unspecified.");
    }

    pageData.init(routesData);
    elementBuilder.buildTable();
    pageRequests.refreshPage();
    pageData.printDebug();

    // -- HTML listeners --

    // Listen for click on static cell field, changes static -> editable
    $(document).on('click', '.' + CLASS_EDITABLE_TABLE_CELL, function() {
        var row = $(this).closest("tr").index();
        var col = $(this).closest("td").index();
        console.log("Clicked: " + row + ", " + col);
        editableTable.enableCellEdit(row, col);
    });

    // Listen for changes in text fields to update the table contents
    $(document).on('change', '.' + CLASS_EDITING_TABLE_CELL, function() {
        var row = $(this).closest("tr").index();
        var col = $(this).closest("td").index();
        console.log("Changed: " + row + ", " + col);
        if($(this).is('input')) {
            if($(this).val() !== "") {
                editableTable.updateCell(row, col, $(this).val(), $(this).val());
            }

        } else if($(this).is('select')) {
            $selection = $(this).find("option:selected");
            editableTable.updateCell(row, col, $selection.val(), $selection.text());
        }

    });

    // Delete button in row
    $(document).on('click', '.' + CLASS_DELETE_BUTTON, function () {

        // Get current row
        var row = $(this).closest('tr').index();
        console.log("Deleted: " + row);
        editableTable.deleteRow(row);

        $(this).text(TEXT_DELETE_BUTTON_DELETED);
        $(this).removeClass(CLASS_DELETE_BUTTON).addClass(CLASS_DELETE_BUTTON_DELETED);
    });

    // Undelete button in row
    $(document).on('click', '.' + CLASS_DELETE_BUTTON_DELETED, function () {
        // Get current row
        var row = $(this).closest('tr').index();
        console.log("Undeleted: " + row);
        editableTable.deleteRow(row);

        $(this).text(TEXT_DELETE_BUTTON);
        $(this).removeClass(CLASS_DELETE_BUTTON_DELETED).addClass(CLASS_DELETE_BUTTON);
    });

    $(document).on('click', '.' + CLASS_ADD_BUTTON, function() {
        editableTable.createRow();
    });

    $(document).on('click', '.' + CLASS_SAVE_BUTTON, function () {
        pageRequests.commitTableChanges();
        // Make an AJAX request to commit rows to the DB
    });

    $(document).on('click', '.' + CLASS_RELOAD_BUTTON, function () {
        var c = confirm("This will delete your changes. Are you sure?");
        if(c) {
            pageRequests.refreshPage();
        }

        // Make an AJAX request to commit rows to the DB
    });
});
