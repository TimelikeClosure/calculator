
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
        display.emptyDisplay();
        var buttonPress = buttons.getButtonPressObject(buttonDOMObject);
        var currentMemory = memory.applyButtonPress(buttonPress);
        display.updateDisplay(currentMemory);
    };
    //  Close addButtonPress controller method

    //  Begin Buttons object constructor
    function Buttons () {
        this.getButtonPressObject = function(buttonDOMObject) {
            var buttonString = getButtonPressStringFromDOM(buttonDOMObject);
            return getButtonPressObjectFromString(buttonString);
        };

        function getButtonPressStringFromDOM(buttonDOMObject){
            return buttonDOMObject.text();
        }

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
                    return new OperandPress(buttonString);
                case '+':
                case '-':
                case '×':
                case '÷':
                case '=':
                    return new OperatorPress(buttonString);
                case 'C':
                case 'CE':
                    return new SpecialPress(buttonString);
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
        function OperandPress(buttonString){
            ButtonPress.call(this, buttonString, 'operand');
        }
        function OperatorPress(buttonString){
            ButtonPress.call(this, buttonString, 'operator');
        }
        function SpecialPress(buttonString){
            ButtonPress.call(this, buttonString, 'special');
        }
    }
    //  Close Buttons object constructor

    //  Begin Memory object constructor
    function Memory () {
        var operationList = [new ZeroOperationStage()];
        this.applyButtonPress = function(buttonPress) {
            if (buttonPress.getOperationType() == 'special'){
                switch (buttonPress.getString()) {
                    case 'C':
                        operationList = [null];
                    case 'CE':
                        operationList[operationList.length - 1] = new ZeroOperationStage();
                        break;
                    default:
                        break;
                }
            } else if (operationList.length >= 1) {
                var appendButtonPressResult = operationList[operationList.length-1].appendButtonPress(buttonPress);
                if (!appendButtonPressResult) {
                    operationList.push(new ButtonPressOperationStage(buttonPress));
                    if (buttonPress.getOperationType() == 'operator') {
                        operationList.push(new CopyOperationStage(operationList[operationList.length-2]));
                    }
                } else if (appendButtonPressResult == 'previous') {
                    if (operationList.length >= 3) {
                        appendButtonPressResult = operationList[operationList.length-2].appendButtonPress(buttonPress);
                    } else {
                        operationList[0].makeExplicit();
                        if (operationList.length == 1) {
                            operationList.push(new ButtonPressOperationStage(buttonPress));
                        } else {
                            operationList[1] = new ButtonPressOperationStage(buttonPress);
                        }
                        operationList.push(new CopyOperationStage(operationList[operationList.length-2]));
                    }
                }
            } else {
                operationList.push(new ButtonPressOperationStage(buttonPress));
            }
            return operationList.map(function(object){return object.getValue()});
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
            };
            this.makeExplicit = function() {
                creationType = "explicit";
                return null;
            };
        }
        function ZeroOperationStage () {
            OperationStage.call(this, '0', 'operand', 'implicit');
        }
        function ButtonPressOperationStage(buttonPress) {
            OperationStage.call(this, buttonPress.getString(), buttonPress.getOperationType(), 'explicit');
        }
        function CopyOperationStage(referenceOperationStage) {
            OperationStage.call(this, referenceOperationStage.getValue(), referenceOperationStage.getOperationType(), 'implicit');
        }
    }
    //  Close Memory object constructor

    //  Begin Display object constructor
    function Display () {
        this.emptyDisplay = function() {
            $('#operation-history').text('');
            $('#operation-current').text('');
        };
        this.updateDisplay = function(memoryObject) {
            if (memoryObject.length < 2) {
                $('#operation-history').text('');
            } else {
                $('#operation-history').text(memoryObject.slice(0, memoryObject.length-1).join(' '));
            }
            if (memoryObject.length < 1) {
                $('#operation-current').text('');
            } else {
                $('#operation-current').text(memoryObject[memoryObject.length-1]);
            }
        }
    }
    //  Close Display object constructor
}
//  Close Calculator constructor