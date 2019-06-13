
$(document).ready(function() {
    $RESULT_TABLE = $('#searchTable');
    $RESULT_TABLE.empty();

    $(document).on('click', '#searchButton', function() {
        console.log($('#searchString').val());
    });
});
