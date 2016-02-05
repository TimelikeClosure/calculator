
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

    //  Begin addButtonPress controller method
    this.addButtonPress = function(buttonDOMObject) {
        var buttonPress = buttons.getButtonPressObject(buttonDOMObject);
        var buttonPressConsoleLog = [
            buttonPress.getString(),
            buttonPress.getOperationType()
        ];
        console.log('buttonPress object : ', buttonPressConsoleLog);
        var currentMemory = memory.applyButtonPress(buttonPress);
        var currentMemoryConsoleLog = currentMemory.map(function (object) {
            var output = [];
            output.push(object.getValue());
            output.push(object.getOperationType());
            output.push(object.getCreationType());
            return output;
        });
        console.log('currentMemory array : ', currentMemoryConsoleLog);
    };
    //  Close addButtonPress controller method

    //  Begin Buttons object constructor
    function Buttons () {
        this.getButtonPressObject = function(buttonDOMObject) {
            var buttonString = getButtonStringFromDOM(buttonDOMObject);
            var buttonType = getButtonTypeFromString(buttonString);
            switch (buttonType) {
                case "operand":
                    if (buttonString.charCodeAt(0) >= 49 && buttonString.charCodeAt(0) <= 57) { //Non-zero digits
                        return new OperandPress(buttonString, null);
                    } else if (buttonString == '0') {
                        return new OperandPress(buttonString, null);
                    }
                    return new OperandPress(buttonString);
                case "operator":
                    switch (buttonString) {
                        case '=':
                            return new OperatorPress(buttonString, 1);
                        case '+':
                        case '-':
                        case '×':
                        case '÷':
                            return new OperatorPress(buttonString, 2);
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

        function ButtonPress(buttonString, operationType){
            this.getString = function() {
                return buttonString;
            };
            this.getOperationType = function() {
                return operationType;
            };
        }
        function OperandPress(buttonString, operationStageLimitFunction){
            ButtonPress.call(this, buttonString, 'operand');
        }
        /*function DigitPress(buttonString){
            OperandPress.call(this, buttonString);
        }*/
        function OperatorPress(buttonString, numOperands){
            ButtonPress.call(this, buttonString, 'operator');
        }
        /*function UnaryOperatorPress(buttonString){
            OperatorPress.call(this, buttonString);
        }
        function BinaryOperatorPress(buttonString){
            OperatorPress.call(this, buttonString);
        }*/
        function SpecialPress(buttonString){
            ButtonPress.call(this, buttonString, 'special');
        }
    }
    //  Close Buttons object constructor

    //  Begin Memory object constructor
    function Memory () {
        var operationList = [new OperationStage('0', 'operand', 'implicit')];
        this.applyButtonPress = function(buttonPress) {
            if (operationList.length >= 1) {
                var appendButtonPressResult = operationList[operationList.length-1].appendButtonPress(buttonPress);
                console.log("appendButtonPressResult : " + appendButtonPressResult);
                if (!appendButtonPressResult) {
                    operationList.push(new OperationStage(buttonPress.getString(), buttonPress.getOperationType(), 'explicit'));
                    if (buttonPress.getOperationType() == 'operator') {
                        operationList.push(new OperationStage(
                            operationList[operationList.length-2].getValue(),
                            operationList[operationList.length-2].getOperationType(),
                            'implicit'
                        ))
                    }
                } else if (appendButtonPressResult == 'previous') {
                    if (operationList.length >= 2) {
                        appendButtonPressResult = operationList[operationList.length-2].appendButtonPress(buttonPress);
                        console.log("appendButtonPressResult : " + appendButtonPressResult);
                    } else {}
                }
            } else {
                operationList.push(new OperationStage(buttonPress.getString(), buttonPress.getOperationType(),'explicit'));
            }
            return operationList.slice();
        };

        function OperationStage (value, operationType, creationType) {
            this.appendButtonPress = function(buttonPress) {
                if (buttonPress.getOperationType() == 'operand') {
                    if (operationType == 'operand') {
                        if (creationType == 'explicit') {
                            value += buttonPress.getString();
                            return 'append';
                        } else if (creationType == 'implicit') {
                            value = buttonPress.getString();
                            if (buttonPress.getString() !== '0') {
                                creationType = 'explicit';
                            }
                            return 'overwrite';
                        }
                    } else {
                        return 'new operation : operand, last stage : not operand';
                    }
                } else if (buttonPress.getOperationType() == 'operator') {
                    if (operationType == 'operand') {
                        if (creationType == 'implicit') {
                            return 'previous';
                        } else if (creationType == 'explicit') {
                            return false;
                        }
                    } else if (operationType == 'operator') {
                        value = buttonPress.getString();
                        return 'overwrite';
                    }
                }
                    };
            this.getValue = function() {
                return value;
            };
            this.getOperationType = function() {
                return operationType;
            };
            this.getCreationType = function() {
                return creationType;
            }
        }
    }
    //  Close Memory object constructor

    //  Begin Display object constructor
    function Display () {}
    //  Close Display object constructor
}
//  Close Calculator constructor