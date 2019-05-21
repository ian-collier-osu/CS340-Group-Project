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
    tableHeader: ["Id", "Name", "Age"],
    tableContents: [
        [0, "foo", 11],
        [1, "Jeff", 22],
        [2, "Michael", 24]
    ],
    tableWidth: 3,
    tableFieldTypes: [FieldTypeEnum.PRIMARY_KEY, FieldTypeEnum.TEXT, FieldTypeEnum.NUMBER],
    rowStates: [RowStateEnum.UNMODIFIED]
};

$(document).ready(function() {
    populateTable();
});

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
        $tableBody.append($newRow);
    }
}

// Listen for changes in text fields to update the table contents
$(document).on('change', '.' + CLASS_EDITABLE_TABLE_ITEM, function() {
    var row, col;

    row = $(this).closest('tr').index();
    col = $(this).closest('td').index();

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
            if(col < pageData.tableWidth) {
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
        // TODO Dropdown menu
        case FieldTypeEnum.FOREIGN_KEY:
            $newElem = undefined;
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
            if(col < pageData.tableWidth) {
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

    // Disable edit button in this row
    $thisRow.find('.' + CLASS_EDIT_BUTTON_NOT_EDITING).attr('disabled', true);
    $thisRow.find('.' + CLASS_EDIT_BUTTON_EDITING).attr('disabled', true);

    // TODO Strikethrough

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

    // Set row status
    var rowIndex = $thisRow.index();
    pageData.rowStates[rowIndex] = RowStateEnum.UPDATED;

    $(this).text(TEXT_DELETE_BUTTON);
    $(this).removeClass(CLASS_DELETE_BUTTON_DELETED).addClass(CLASS_DELETE_BUTTON);
});

$('.' + CLASS_ADD_BUTTON).click(function () {
    alert("Add button");
    // Add a new empty row
});

$('.' + CLASS_SAVE_BUTTON).click(function () {
    alert("Save button");
    // Make an AJAX request to commit rows to the DB
});

// TODO Need something to listen for a change in editable field classes to update value in mem and mark color
