//
// jQuery for editable tables
//

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

const RowStateEnum = {
    UNMODIFIED : 0,
    UPDATED : 1,
    DELETED : 2,
    CREATED : 3,
    HEADER: 4
}

const FieldTypeEnum = {
    PRIMARY_KEY: 0,
    FOREIGN_KEY: 1,
    UNEDITABLE: 2,
    TEXT: 3,
    NUMBER: 4
};

var $TABLE = $('.editable-table');

// Sample page data
// TODO generate
var pageData = {
    tableHeader: [],
    tableContents: [],
    tableFieldTypes: [],
    rowStates: []
};

$(document).ready(function() {
    ajaxRefreshTable();
});

function ajaxRefreshTable() {
    if(routesData == undefined) {
        alert("Error: Meta file unspecified.");
    }

    $.ajax({
        url : routesData.mainUrl,
        type : 'GET',
        success : function(data) {
            console.log("Loaded table data: " + JSON.stringify(data));
            initPageData(data);
            populateTable();
        },
        error : function(request,error)
        {
            alert("Failed to load data: "+JSON.stringify(request));
        }
    });
}

function initPageData(getDict) {
    pageData = {
        tableHeader: [],
        tableContents: [],
        tableFieldTypes: [],
        rowStates: []
    };
    var i = 0;

    // Populate table headers (temp)
    if(getDict.length > 0) {
        for(colFieldName of routesData.headerTitles) {
            pageData.tableHeader.push(colFieldName);
        }
    }

    // Populate table data
    for(rowObj of getDict) {
        pageData.rowStates.push(RowStateEnum.UNMODIFIED);
        pageData.tableContents.push([]);
        for(colItem of Object.values(rowObj)) {
            if(colItem == null) colItem = "(null)";
            pageData.tableContents[i].push(colItem);
        }
        i++;
    }


    if(pageData.tableContents.length > 0) {
        // Set field types (numbers and strings)
        i = 0;
        for(colItem of pageData.tableContents[0]) {
            
            var fieldType = FieldTypeEnum.UNEDITABLE;
            if (typeof colItem === 'string' || colItem instanceof String) {
                fieldType = FieldTypeEnum.TEXT;
            } else if (typeof colItem == 'number') {
                fieldType = FieldTypeEnum.NUMBER;
            }

            // Disable PK editing if specified
            if(i == 0 && !routesData.pkIsEditable) {
                fieldType = FieldTypeEnum.PRIMARY_KEY;
            }

            pageData.tableFieldTypes.push(fieldType);
            i++;
        }

        // Set field types (foreign keys)
        i = 0;
        for(fkUrl of routesData.foreignKeyUrls) {
            if(fkUrl != undefined) {
                pageData.tableFieldTypes[i] = FieldTypeEnum.FOREIGN_KEY;
            }
            i++;
        }
    }

}

function addEmptyRow() {
    var newRowContents = [];

    for(fieldType of pageData.tableFieldTypes) {
        var newRowItem = "?";
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
    addRow(newRowContents);
}

function addRow(rowData) {
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
function populateTable() {
    // Clear table
    $TABLE.empty();

    // Header
    var $tableHead = $('<thead>');
    $TABLE.append($tableHead);

    var $newHeader = $('<tr>');
    for (headerItem of pageData.tableHeader) {
        var $newHeaderItem = $('<td>')
            .text(headerItem);
        $newHeader.append($newHeaderItem);
    }
    $tableHead.append($newHeader);

    // Body
    var $tableBody = $('<tbody>');
    $TABLE.append($tableBody);

    for (rowData of pageData.tableContents) {
        addRow(rowData);
    }
}

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

// Edit button on on a row, while editing
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
            if(col < pageData.tableHeader.length) {
                $(this).text(pageData.tableContents[row][col]);
            }
            // TODO set color class based on status
        });
    });

    // Set button text and class
    $(this).text(TEXT_EDIT_BUTTON_NOT_EDITING);
    $(this).removeClass(CLASS_EDIT_BUTTON_EDITING).addClass(CLASS_EDIT_BUTTON_NOT_EDITING);
}

$(document).on('click', '.' + CLASS_EDIT_BUTTON_EDITING, rowDisableEditing);

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
    addEmptyRow();
});

$('.' + CLASS_SAVE_BUTTON).click(function () {
    alert("Save button");
    // Make an AJAX request to commit rows to the DB
});

$('.' + CLASS_RELOAD_BUTTON).click(function () {
    var c = confirm("This will delete your changes. Are you sure?");
    if(c) {
        ajaxRefreshTable();
    }

    // Make an AJAX request to commit rows to the DB
});

// TODO Need something to listen for a change in editable field classes to update value in mem and mark color

// TODO new function that takes cell of origin and intended marker -- marks row and sets visuals
