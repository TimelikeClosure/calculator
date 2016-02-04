
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
        var buttonPress = buttons.getButtonPressObject(buttonDOMObject);
        console.log('buttonPress object : ', buttonPress);
    };
    //  Close pass-through method

    //  Begin Buttons object constructor
    function Buttons () {
        this.getButtonPressObject = function(buttonDOMObject) {
            var buttonString = getButtonStringFromDOM(buttonDOMObject);
            var buttonType = getButtonTypeFromString(buttonString);
            switch (buttonType) {
                case "operand":
                    if (buttonString.charCodeAt(0) >= 48 && buttonString.charCodeAt(0) <= 57) {
                        return new DigitPress(buttonString);
                    }
                    return new OperandPress(buttonString);
                case "operator":
                    switch (buttonString) {
                        case '=':
                            return new UnaryOperatorPress(buttonString);
                        case '+':
                        case '-':
                        case '×':
                        case '÷':
                            return new BinaryOperatorPress(buttonString);
                        default:
                            return new OperatorPress(buttonString);
                    }
                case "special":
                    return new SpecialPress(buttonString);
                default:
                    return undefined;
            }
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

        function ButtonPress(buttonString){}
        function OperandPress(buttonString){
            ButtonPress.call(this, buttonString);
        }
        function DigitPress(buttonString){
            OperandPress.call(this, buttonString);
        }
        function OperatorPress(buttonString){
            ButtonPress.call(this, buttonString);
        }
        function UnaryOperatorPress(buttonString){
            OperatorPress.call(this, buttonString);
        }
        function BinaryOperatorPress(buttonString){
            OperatorPress.call(this, buttonString);
        }
        function SpecialPress(buttonString){
            ButtonPress.call(this, buttonString);
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