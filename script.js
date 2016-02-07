
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
    var buttons = new ButtonsController();
    var memory = new MemoryController();
    var display = new DisplayController();
    //  End calculator component controller instantiation

    //  Begin addButtonPress controller method
    /**
     * Updates memory and display from button presses
     * @param buttonDOMObject
     */
    this.addButtonPress = function(buttonDOMObject) {
        display.emptyDisplay();
        var buttonPress = buttons.getButtonPressObject(buttonDOMObject);
        var memoryDisplayObject = memory.applyButtonPress(buttonPress);
        display.updateDisplay(memoryDisplayObject);
    };
    //  Close addButtonPress controller method

    //  Begin ButtonsController constructor
    /**
     * Constructs controller for DOM button inputs
     * @constructor
     */
    function ButtonsController () {
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
    //  Close ButtonsController constructor

    //  Begin MemoryController constructor
    /**
     * Constructs controller for memory objects
     * @constructor
     */
    function MemoryController () {
        var currentOperationList = new OperationList();
        this.applyButtonPress = function(buttonPress) {
            switch (buttonPress.getOperationType()) {
                case 'special':
                    switch (buttonPress.getString()) {
                        case 'CE':
                            clearCurrentEntry();
                            break;
                        case 'C':
                            clearCurrentOperationList();
                            break;
                        default:
                            break;
                    }
                    break;

                //  Begin to-be-converted section
                    /*if (operationList.length >= 1) {
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
                    }*/

                //  Close to-be-converted section
                case 'operand':
                case 'operator':
                    currentOperationList.addButtonPress(buttonPress);
                    break;
                default:
                    return [['ERROR','invalid operation type'],[]];
            }

            return [currentOperationList.getDisplayObject(),[]];
        };

        function OperationList (lastOperation) {
            var operationList;
            if (lastOperation == undefined) {
                operationList = [new ZeroOperationStage()];
            } else {
                operationList = [new CopyOperationStage(lastOperation)];
            }

            this.addButtonPress = function(buttonPress) {
                var currentIndex = operationList.length - 1;
                while (currentIndex >= 0 && operationList[currentIndex].canPrecede(buttonPress)) {
                    currentIndex--;
                }
                if (currentIndex < 0) {
                    return null;
                } else if (operationList[currentIndex].canReplace(buttonPress)) {
                    operationList[currentIndex] = new ButtonPressOperationStage(buttonPress);
                } else if (operationList[currentIndex].canAppend(buttonPress)) {
                    operationList[currentIndex].appendButtonPress(buttonPress);
                } else if (operationList[currentIndex].canFollow(buttonPress)) {
                    operationList.push(new ButtonPressOperationStage(buttonPress));
                }
                return validateOperationList();
            };

            this.getDisplayObject = function() {
                if (operationList.length < 1) {
                    return ['null',''];
                } else {
                    var operationListClone = operationList.slice();
                    var lastOperation = (operationListClone.pop()).getValue();
                    return [lastOperation, operationListClone.map(function(object){return object.getValue();}).join(' ')];
                }
            };

            this.clearEntry = function() {
                if (getLastOperation().getCreationType() == 'explicit' ||
                    getLastOperation().getOperationType() != 'operand' ||
                    getLastOperation().getValue() !== '0') {
                    setLastOperation(new ZeroOperationStage());
                    return true;
                } else {
                    return false;
                }
            };

            function validateOperationList () {
                if (getLastOperation().getOperationType() != 'operator') {
                    return null;
                }
                if (getLastOperation().getOperatorType() != 'binary') {
                    return null;
                }
                if (getLastOperation().getValue() != '=') {
                    operationList.push(new CopyOperationStage(operationList[operationList.length - 2]));
                    return null;
                }
                return evaluateOperationList();
            }

            function evaluateOperationList() {
                while (operationList.length > 2) {
                    for (var i=0; i < operationList.length; i++) {
                        if (operationList[i].getOperationType() == 'operator') {
                            if (operationList[i].getOperatorType() == 'binary') {
                                var operation = operationList.slice(i-1,i+2);
                                var newOperation = evaluateBinaryOperation(operation);
                                operationList.splice(i-1, 3, newOperation);
                                break;
                            } else {

                            }
                        }
                    }
                }
            }

            function evaluateBinaryOperation(operatorList) {
                operand1 = parseFloat(operatorList[0].getValue());
                operand2 = parseFloat(operatorList[2].getValue());
                switch (operatorList[1].getValue()) {
                    case '+':
                        return new OperationStage((operand1 + operand2) + '', 'operand', 'implicit');
                    case '-':
                        return new OperationStage((operand1 - operand2) + '', 'operand', 'implicit');
                    case '×':
                        return new OperationStage((operand1 * operand2) + '', 'operand', 'implicit');
                    case '÷':
                        return new OperationStage((operand1 / operand2) + '', 'operand', 'implicit');
                }
            }

            function getLastOperation(){
                if (operationList.length < 1) {
                    return undefined;
                }
                return operationList[operationList.length - 1];
            }

            function setLastOperation(newEntry) {
                if (operationList.length >= 1) {
                    operationList[operationList.length - 1] = newEntry;
                } else {
                    operationList.push(newEntry);
                }
            }

        }

        function OperationStage (value, operationType, creationType) {
            var operatorType;
            var operatorPriority;
            if (operationType == 'operand') {
                operatorType = null;
            } else if (operationType == 'operator') {
                switch (value) {
                    case '!':
                        operatorType = 'unary';
                        break;
                    case '=':
                    case '+':
                    case '-':
                    case '×':
                    case '÷':
                        operatorType = 'binary';
                        break;
                }
                switch (value) {
                    case '(':
                    case ')':
                        operatorPriority = 4;
                        break;
                    case '×':
                    case '÷':
                        operatorPriority = 2;
                        break;
                    case '+':
                    case '-':
                        operatorPriority = 1;
                        break;
                    case '=':
                        operatorPriority = 0;
                        break;
                }
            }

            this.appendButtonPress = function(buttonPress) {
                value += buttonPress.getString();
                return null;
            };

            this.canPrecede = function(buttonPress) {
                if (buttonPress.getOperationType() != 'operator') {
                    return false;
                } else if (this.getOperationType() != 'operand') {
                    return false;
                } else if (this.getCreationType() != 'implicit') {
                    return false;
                }
                return true;
            };

            this.canReplace = function(buttonPress) {
                if (this.getOperationType() != buttonPress.getOperationType()) {
                    return false;
                }
                switch (this.getOperationType()) {
                    case 'operand':
                        if (this.getCreationType() != 'implicit') {
                            if (this.getValue() == '0') {
                                return true;
                            }
                            return false;
                        }
                        return true;
                        break;
                    case 'operator':
                        return true;
                        break;
                    default:
                        return false;
                }
            };

            this.canAppend = function(buttonPress) {
                if (this.getOperationType() != 'operand' || buttonPress.getOperationType() != 'operand') {
                    return false;
                }
                return true;
            };

            this.canFollow = function(buttonPress) {
                var isButtonPressOperand = (buttonPress.getOperationType()=='operand');
                var isLastOperatorBinaryOperator = ((this.getOperationType()=='operator') && (this.getOperatorType()=='binary'));
                return (isButtonPressOperand == isLastOperatorBinaryOperator);
                //  Only operands can follow binary operators.
                //  Only operators can follow operands and unary operators.
            };

            this.getValue = function() {
                return value;
            };
            this.getOperationType = function() {
                return operationType;
            };
            this.getOperatorType = function() {
                return operatorType;
            };
            this.getOperatorPriority = function() {
                return operatorPriority;
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

        function addNewOperand(operandButtonPress) {
            currentOperationList.addNewOperand(operandButtonPress);
        }

        function clearCurrentEntry() {
            var clearCurrentEntryResult = currentOperationList.clearEntry();
            if (!clearCurrentEntryResult) {
                clearCurrentOperationList();
            }
        }

        function clearCurrentOperationList() {
            currentOperationList = new OperationList();
        }
    }
    //  Close MemoryController constructor

    //  Begin DisplayController constructor
    /**
     * Constructs controller for DOM display objects
     * @constructor
     */
    function DisplayController () {
        this.emptyDisplay = function() {
            $('#operation-history').text('');
            $('#operation-current').text('');
        };
        this.updateDisplay = function(memoryDisplayObject) {
            //  Display current operation and last operation set
            $('#operation-current').text(memoryDisplayObject[0][0]);
            $('#operation-history').text(memoryDisplayObject[0][1]);
            //  Display completed operation history
            //not yet implemented
        }
    }
    //  Close DisplayController constructor
}
//  Close CalculatorController constructor