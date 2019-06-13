
$(document).ready(function() {
    $ORDERS_TABLE = $('#searchOrdersTable');
    $PARTS_TABLE = $('#searchPartsTable');
    $TRIMLINES_TABLE = $('#searchTrimlinesTable');
    $MODELS_TABLE = $('#searchModelsTable');

    clearTables();

    $(document).on('click', '#searchButton', function() {
        clearTables();

        var searchString = $('#searchString').val();

        if(searchString === "") {
            alert("Please enter a search string.");
            return;
        }

        console.log("Searching for: " + searchString);

        ajaxGet($ORDERS_TABLE, '/SearchOrders', searchString);
        ajaxGet($PARTS_TABLE, '/SearchParts', searchString);
        ajaxGet($TRIMLINES_TABLE, '/SearchTrimlines', searchString);
        ajaxGet($MODELS_TABLE, '/SearchModels', searchString);
    });
});

function ajaxGet($table, url, query) {
    $.ajax({
        url : url + '/' + query,
        type : 'GET',
        success : function(res) {
            populateTable($table, res);
        },
        error : function(res, error)
        {
            pageError(res);
        }
    });
}

function pageError(res) {
    alert("Server error.");
    console.log(JSON.stringify(res));
    clearTables();
}

function populateTable($table, responseData) {
    if(responseData.length <= 0) {
        $table.hide();
        return;
    }

    $table.show();
    for(responseItem of responseData) {
        var $newRow = $('<tr>');
        Object.keys(responseItem).forEach(function(key) {
            var val = responseItem[key];
            var $newItem = $('<td>');
            $newItem.text(val);
            $newRow.append($newItem);
        });
        $table.find('tbody').append($newRow);
    }
}

function clearTables() {
    // Show all
    $ORDERS_TABLE.hide();
    $PARTS_TABLE.hide();
    $TRIMLINES_TABLE.hide();
    $MODELS_TABLE.hide();

    // Empty tbodies
    $ORDERS_TABLE.find('tbody').empty();
    $PARTS_TABLE.find('tbody').empty();
    $TRIMLINES_TABLE.find('tbody').empty();
    $MODELS_TABLE.find('tbody').empty();
}
