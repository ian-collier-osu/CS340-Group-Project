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
const CLASS_EDITABLE_TABLE_ITEM = "table-item-editable";

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

const TableChangeTypeEnum = {
    CREATE: 0,
    UPDATE: 1,
    DELETE: 2
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
                // Redraw
                tableDraw();
            },
            error : function(res, error)
            {
                parent._refreshError(res);
            }
        });

        // Fetch foreign key data for each column
        var i = 0; // Col index
        for(tableColumn of pageData.tableColumns) {
            console.log("Column: " + i + ", field type: " + tableColumn.columnMeta.fieldType);
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
                            tableDraw();
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

function TableChange(type, contents, rowIndex) {
  this.type = type;
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
        // For each row set col to proper display val
        for(tableRow of parent.tableRows) {
            var displayedItem = tableColumn.fkDict[tableRow.rawItems[columnIndex]];
            if(displayedItem !== undefined) {
                tableRow.displayedItems[columnIndex] = displayedItem;
            } else {
                // TODO change this
                tableRow.displayedItems[columnIndex] = "?";
            }
        }
    }
}

// -- Global vars --

var $TABLE = $('.editable-table');
var pageData = new PageData();
var pageRequests = new PageRequests();

// -- Init --

$(document).ready(function() {
    if(routesData == undefined) {
        alert("Error: Meta file unspecified.");
    }

    pageData.init(routesData);
    pageRequests.refreshPage();
});

// -- HTML table modifications --

function tableAddEmptyRow() {
    var newRowContents = [];

    for(fieldType of pageData.tableFieldTypes) {
        var newRowItem = UNDEFINED_ITEM_VALUE;
        switch(fieldType) {
            case FieldTypeEnum.TEXT:
                newRowItem = "";
                break;
            case FieldTypeEnum.NUMBER:
                newRowItem = 0;
                break;
        }
        newRowContents.push(newRowItem);
    }
    pageData.tableContents.push(newRowContents);
    pageData.rowStates.push(RowStateEnum.UPDATED);
    tableAddRow(newRowContents);
}

function tableAddRow(rowData) {
    var $newRow = $('<tr>');
    for(colData of rowData) {
        // Create new data item
        var $newCol = $('<td>')
            .text(colData);

        // Append new item to row
        $newRow.append($newCol);
    }

    // Create mod buttons
    var $editBtn = $('<button>')
        .attr({
            type: 'button'
        })
        .addClass(CLASS_EDIT_BUTTON_NOT_EDITING)
        .text(TEXT_EDIT_BUTTON_NOT_EDITING);

    var $deleteBtn = $('<button>')
        .attr({
            type: 'button'
        })
        .addClass(CLASS_DELETE_BUTTON)
        .text(TEXT_DELETE_BUTTON);

    // Append mod buttons to row
    $newRow.append($('<td>').append($editBtn));
    $newRow.append($('<td>').append($deleteBtn));

    // Add row to table body
    $TABLE.find('tbody').append($newRow);
}

// Fills in the table from pageData
function tableDraw() {
    // Clear table
    $TABLE.empty();

    // Header
    var $tableHead = $('<thead>');
    $TABLE.append($tableHead);

    var $newHeader = $('<tr>');
    for (tableColumn of pageData.tableColumns) {
        var $newHeaderItem = $('<td>')
            .text(tableColumn.columnMeta.displayName);
        $newHeader.append($newHeaderItem);
    }
    $tableHead.append($newHeader);

    // Body
    var $tableBody = $('<tbody>');
    $TABLE.append($tableBody);

    for (tableRow of pageData.tableRows) {
        tableAddRow(tableRow.displayedItems);
    }
}

// -- HTML listeners --

// Listen for changes in text fields to update the table contents
$(document).on('change', '.' + CLASS_EDITABLE_TABLE_ITEM, function() {
    var row, col;

    var $thisRow = $(this).closest('tr');
    var $thisItem = $(this).closest("td");

    // Set cell color
    $thisItem.addClass(CLASS_MODIFIED_INDICATOR);

    col = $thisItem.index();
    row = $thisRow.index();

    console.log("Changed: (" + row + ", " + col + ")");

    // TODO test for all field types -- should work for selects as well
    pageData.tableContents[row][col] = $(this).val();
});


function rowDisableEditing() {
    // Find parent TR
    var row, col;
    $(this).closest('tr').each(function() {
        row = $(this).index();
        // Change all TD to plain text fields
        $(this).find('td').each (function() {
            // Set innerhtml to respective text
            col = $(this).index();
            // Make sure we ignore buttons
            if(col < pageData.tableColumns.length) {
                $(this).text(pageData.tableContents[row][col]);
            }
            // TODO set color class based on status
        });
    });

    // Set button text and class
    $(this).text(TEXT_EDIT_BUTTON_NOT_EDITING);
    $(this).removeClass(CLASS_EDIT_BUTTON_EDITING).addClass(CLASS_EDIT_BUTTON_NOT_EDITING);
}

// Edit button on on a row, while editing
$(document).on('click', '.' + CLASS_EDIT_BUTTON_EDITING, function() {
    $(this).each(rowDisableEditing);
    var $thisRow = $(this).closest('tr');
    var rowIndex = $thisRow.index();
    pageData.rowStates[rowIndex] = RowStateEnum.UPDATED;
});

// TODO based on row, col
function getEditableField(row, col) {
    var $newElem;
    var fieldType = pageData.tableFieldTypes[col];
    var fieldContent = pageData.tableContents[row][col];
    console.log(col + ": " + fieldType)

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
        case FieldTypeEnum.FOREIGN_KEY:
            $newElem = undefined;
            break;
        default:
            $newElem = undefined;
            break;
    }

    return $newElem;
}

// Edit button on on a row, while not editing
$(document).on('click', '.' + CLASS_EDIT_BUTTON_NOT_EDITING, function () {
    var row, col;
    // From parent TR
    $(this).closest('tr').each(function() {
        row = $(this).index();
        // Change all TD to plain text fields
        $(this).find('td').each (function() {
            col = $(this).index();
            console.log("Edit: (" + row + ", " + col + ")");

            // Make sure we ignore buttons
            if(col < pageData.tableHeader.length) {
                // Add proper editable field element
                var $newElem = getEditableField(row, col);
                if ($newElem !== undefined) {
                    // Clear contents first
                    $(this).empty();

                    // Mark class for edit listener
                    $newElem.addClass(CLASS_EDITABLE_TABLE_ITEM);

                    // Insert into TD
                    $(this).append($newElem);
                }
            }
        });
    });

    $(this).text(TEXT_EDIT_BUTTON_EDITING);
    $(this).removeClass(CLASS_EDIT_BUTTON_NOT_EDITING).addClass(CLASS_EDIT_BUTTON_EDITING);
});

// Delete button in row
$(document).on('click', '.' + CLASS_DELETE_BUTTON, function () {
    // End editing if happening on this row
    $(this).each(rowDisableEditing);

    // Get current row
    var $thisRow = $(this).closest('tr');
    var $thisItem = $(this).closest('td');

    // Disable edit button in this row
    $thisRow.find('.' + CLASS_EDIT_BUTTON_NOT_EDITING).attr('disabled', true);
    $thisRow.find('.' + CLASS_EDIT_BUTTON_EDITING).attr('disabled', true);

    // TODO Strikethrough
    $thisRow.addClass(CLASS_DELETED_INDICATOR);

    // Set row status
    var rowIndex = $thisRow.index();
    pageData.rowStates[rowIndex] = RowStateEnum.DELETED;


    $(this).text(TEXT_DELETE_BUTTON_DELETED);
    $(this).removeClass(CLASS_DELETE_BUTTON).addClass(CLASS_DELETE_BUTTON_DELETED);
});

// Undelete button in row
$(document).on('click', '.' + CLASS_DELETE_BUTTON_DELETED, function () {

    // Get current row
    var $thisRow = $(this).closest('tr');

    // Enable edit button on this row
    $thisRow.find('.' + CLASS_EDIT_BUTTON_NOT_EDITING).attr('disabled', false);
    $thisRow.find('.' + CLASS_EDIT_BUTTON_EDITING).attr('disabled', false);

    // TODO Remove strikethrough
    $thisRow.removeClass(CLASS_DELETED_INDICATOR);

    // Set row status
    var rowIndex = $thisRow.index();
    pageData.rowStates[rowIndex] = RowStateEnum.UPDATED;

    $(this).text(TEXT_DELETE_BUTTON);
    $(this).removeClass(CLASS_DELETE_BUTTON_DELETED).addClass(CLASS_DELETE_BUTTON);
});

$('.' + CLASS_ADD_BUTTON).click(function () {
    tableAddEmptyRow();
});

$('.' + CLASS_SAVE_BUTTON).click(function () {
    commitTableChanges();
    // Make an AJAX request to commit rows to the DB
});

$('.' + CLASS_RELOAD_BUTTON).click(function () {
    var c = confirm("This will delete your changes. Are you sure?");
    if(c) {
        ajaxRefreshTable();
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
