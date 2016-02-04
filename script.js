
//  Begin updateDisplay function

/**
 * Update the display with the given value.
 * @param {string} type "itemAdded", "calculated", or "error"
 * @param {number|string|undefined} value
 * @param item
 */
function updateDisplay(type, value, item) {
    if (value === undefined) {
        $('#display').text("");
    } else {
        $('#display').text(value);
    }
}
//  Close updateDisplay function

//  Begin global variable my_calculator
var my_calculator = new calculator(updateDisplay);
//  Close global variable my_calculator

//  Begin on document load handler
$(document).ready(function(){

    //  Begin button click handler
    $('.buttons').on('click', 'button', function(){
        var val = $(this).text();
        if (val == 'C') {
            my_calculator.clear();
        } else if (val == 'CE') {
            my_calculator.allClear();
        } else {
            my_calculator.addItem(val);
        }
    });
    //  Close button click handler

});
//  Close on document load handler