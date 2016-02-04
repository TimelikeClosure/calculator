
//  Begin on document load handler
$(document).ready(function(){

    //  Begin button click handler
    $('.buttons').on('click', 'button', function(){
        calculator.addButtonPress($(this));
    });
    //  Close button click handler

});
//  Close on document load handler


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

//  Begin global object my_calculator
var calculator = new Calculator(updateDisplay);
//  Close global object my_calculator

//  Begin Calculator constructor
function Calculator () {
    //  Begin main component instantiation
    var buttons = new Buttons();
    var memory = new Memory();
    var display = new Display();
    //  End main component instantiation

    //  Begin pass-through method
    this.addButtonPress = function(buttonDOMObject) {
        buttons.getButtonPressObject(buttonDOMObject);
    };
    //  Close pass-through method

    //  Begin Buttons object constructor
    function Buttons () {
        this.getButtonPressObject = function(buttonDOMObject) {
            var buttonString = getButtonStringFromDOM(buttonDOMObject);
            var buttonType = getButtonTypeFromString(buttonString);
        };

        function getButtonStringFromDOM(buttonDOMObject){
            return buttonDOMObject.text();
        }

        function getButtonTypeFromString(buttonString){
            switch (buttonString) {
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    return 'operand';
                case '+':
                case '-':
                case '×':
                case '÷':
                case '=':
                    return 'operator';
                case 'C':
                case 'CE':
                    return 'special';
                default:
                    return undefined;
            }
        }
    }
    //  Close Buttons object constructor

    //  Begin Memory object constructor
    function Memory () {}
    //  Close Memory object constructor

    //  Begin Display object constructor
    function Display () {}
    //  Close Display object constructor
}
//  Close Calculator constructor