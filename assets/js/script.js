
//  Begin on document load handler
$(document).ready(function(){

    //  Begin button click handler
    $('.buttons').on('click', 'button', function(){
        calculator.addButtonPress($(this));
    });
    //  Close button click handler

});
//  Close on document load handler

//  Begin calculator main controller instantiation
var calculator = new CalculatorController();
//  Close calculator main controller instantiation

//  Begin CalculatorController constructor
/**
 * Constructs controller for calculator logic
 * @constructor
 */
function CalculatorController () {

    //  Begin calculator component controller instantiation
    var model = new CalculatorModel();
    var view = new CalculatorView();
    //  End calculator component controller instantiation

    //  Begin addButtonPress controller method
    /**
     * Updates model and view from button presses
     * @param $buttonDOMObject
     */
    this.addButtonPress = function($buttonDOMObject) {
        view.emptyDisplay();
        var buttonPress = view.getButtonPressObject($buttonDOMObject);
        var memoryDisplayObject = model.applyInputObject(buttonPress);
        view.updateDisplay(memoryDisplayObject);
    };
    //  Close addButtonPress controller method


    //  Begin CalculatorView constructor
    /**
     * Constructs view for handling DOM inputs and outputs.
     * @constructor
     */
    function CalculatorView () {

        //  Begin emptyDisplay method
        /**
         * Clears the displays
         */
        this.emptyDisplay = function() {
            $('#operation-list').text('');
            $('#operation-current').text('');
            $('#operation-history').html('');
        };
        //  Close emptyDisplay method

        //  Begin updateDisplay method
        /**
         * Takes the given display object and updates the relevant displays.
         * @param {Array} memoryDisplayObject
         */
        this.updateDisplay = function(memoryDisplayObject) {

            //  Display current operation and operation list in main display
            $('#operation-current').text(memoryDisplayObject[0][0]);
            $('#operation-list').text(memoryDisplayObject[0][1]);

            //  Begin displaying completed operation history in history display
            for (var i = 0; i < memoryDisplayObject[1].length; i++) {
                var currentLength = memoryDisplayObject[1][i].length;
                if (currentLength >= 2) {
                    $('#operation-history').append(
                        $('<div>',{
                            class: 'display-sm',
                            text: memoryDisplayObject[1][i][1]
                        }),
                        $('<div>', {
                            class: 'display-md',
                            text: memoryDisplayObject[1][i][0]
                        })
                    );
                }
            }
            //  Close displaying completed operation history in history display

        };
        //  Close updateDisplay method

        //  Begin getButtonPressObject method
        /**
         * Given a jQuery selector, generates a ButtonPress object for use by the model.
         * @param {Object} $buttonDOMObject
         * @returns {Object}
         */
        this.getButtonPressObject = function($buttonDOMObject) {
            var buttonString = getButtonPressStringFromDOM($buttonDOMObject);
            return getButtonPressObjectFromString(buttonString);
        };
        //  Close getButtonPressObject method

        //  Begin getButtonPressObject subroutines
        /**
         * Given a jQuery selector from a button press, returns the string containing the represented operation.
         * @param {Object} $buttonDOMObject
         * @returns {string}
         */
        function getButtonPressStringFromDOM($buttonDOMObject){
            return $buttonDOMObject.text();
        }

        /**
         * Given an operation string, returns a ButtonPress object.
         * @param {string} buttonString
         * @returns {Object}
         */
        function getButtonPressObjectFromString(buttonString){
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
                case '.':
                    return new OperandPress(buttonString);
                case '+':
                case '-':
                case '×':
                case '÷':
                case '=':
                    return new OperatorPress(buttonString);
                case 'C':
                case 'CE':
                case '←':
                    return new SpecialPress(buttonString);
                default:
                    return undefined;
            }
        }
        //  Close getButtonPressObject subroutines

        //  Begin ButtonPress object constructors
        /**
         * Constructs a ButtonPress object for use by the model.
         * @param {string} buttonString
         * @param {string} operationType
         * @constructor
         */
        function ButtonPress(buttonString, operationType){
            this.getString = function() {
                return buttonString;
            };
            this.getOperationType = function() {
                return operationType;
            };
        }
        function OperandPress(buttonString){ // Creates ButtonPress object of operationType "operand"
            ButtonPress.call(this, buttonString, 'operand');
        }
        function OperatorPress(buttonString){ // Creates ButtonPress object of operationType "operator"
            ButtonPress.call(this, buttonString, 'operator');
        }
        function SpecialPress(buttonString){ // Creates ButtonPress object of operationType "special"
            ButtonPress.call(this, buttonString, 'special');
        }
        //  Close ButtonPress object constructors


    }
    //  Close CalculatorView constructor

}
//  Close CalculatorController constructor