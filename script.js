
//  Begin thingy function
function thingy(type, value, item) {
    if (value === undefined) {
        $('#display').text("");
    } else {
        $('#display').text(value);
    }
    /*$('#display').text(value);*/
}
//  Close thingy function

//  Begin global variable my_calculator
var my_calculator = new calculator(thingy);
//  Close global variable my_calculator

//  Begin on document load handler
$(document).ready(function(){
    $('.buttons').on('click', 'button', function(){
        var val = $(this).text();
        /*my_calculator.addItem(val);*/
        if (val == 'C') {
            my_calculator.clear();
        } else if (val == 'CE') {
            my_calculator.allClear();
        } else {
            my_calculator.addItem(val);
        }
    });
});
//  Close on document load handler