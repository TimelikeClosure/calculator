
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
        var operationHistory = new OperationHistory();
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
                case 'operand':
                case 'operator':
                    var validate = currentOperationList.addOperation(buttonPress);
                    if (validate) {
                        var evaluate = currentOperationList.validateOperationList();
                    }
                    if (evaluate) {
                        var previousOperationList = currentOperationList;
                        currentOperationList = cloneOperationList(previousOperationList);
                        currentOperationList.evaluateOperationList();
                        previousOperationList.setLastOperation(currentOperationList.getLastOperation());
                        operationHistory.archiveOperationList(previousOperationList);
                    }
                    break;
                default:
                    return [['ERROR','invalid operation type'],[]];
            }

            return [currentOperationList.getDisplayObject(), operationHistory.getDisplayObject()];
        };

        function cloneOperationList (operationList) {
            return new OperationList(operationList.cloneOperationList(), operationList.getRepeatOperator(), operationList.getRepeatOperand());
        }

        function OperationHistory () {
            var history = [];

            this.archiveOperationList = function(operationList) {
                history.push(operationList);
            };

            this.getDisplayObject = function() {
                var displayObject = [];
                for (var i = history.length - 1; i >= 0; i--) {
                    displayObject.push(history[i].getDisplayObject());
                }
                return displayObject;
            };
        }

        function OperationList (lastOperation, repeatOperator, repeatOperand) {
            var operationList;
            if (lastOperation === undefined) {
                operationList = [new ZeroOperationStage()];
            } else if (!(Array.isArray(lastOperation))) {
                operationList = [new CopyOperationStage(lastOperation), 'implicit'];
            } else {
                operationList = lastOperation;
            }
            if (repeatOperator === undefined) {
                repeatOperator = null;
            }
            if (repeatOperand === undefined) {
                repeatOperand = null;
            }

            this.addOperation = function(buttonPress) {
                var currentIndex = operationList.length - 1;
                while (currentIndex > 0 && operationList[currentIndex].canPrecede(buttonPress)) {
                    currentIndex--;
                }
                if (currentIndex < 0) {
                    return false;
                } else if (operationList[currentIndex].canReplace(buttonPress)) {
                    operationList[currentIndex] = new ButtonPressOperationStage(buttonPress);
                    setRepeatOperation(operationList[currentIndex]);
                } else if (operationList[currentIndex].canAppend(buttonPress)) {
                    operationList[currentIndex].appendButtonPress(buttonPress);
                    setRepeatOperation(operationList[currentIndex]);
                } else if (operationList[currentIndex].canFollow(buttonPress)) {
                    operationList.push(new ButtonPressOperationStage(buttonPress));
                    setRepeatOperation(operationList[currentIndex + 1]);
                }
                return true;
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
                if (this.getLastOperation().getCreationType() == 'explicit' ||
                    this.getLastOperation().getOperationType() != 'operand' ||
                    this.getLastOperation().getValue() !== '0') {
                    this.setLastOperation(new ZeroOperationStage());
                    if (operationList.length > 1) {
                        setRepeatOperation(this.getLastOperation());
                    }
                    return true;
                } else {
                    return false;
                }
            };

            this.validateOperationList = function() {
                if (this.getLastOperation().getOperationType() != 'operator') {
                    return false;
                }
                if (this.getLastOperation().getOperatorType() != 'binary') {
                    return false;
                }
                operationList.push(new CopyOperationStage(operationList[operationList.length - 2], 'implicit'));
                if (operationList[operationList.length - 2].getValue() != '=') {
                    setRepeatOperation(operationList[operationList.length - 1]);
                    return false;
                }
                if (operationList.length == 3) {
                    if (repeatOperand !== null && repeatOperator !== null) {
                        operationList.splice(1, 0, repeatOperator, repeatOperand);
                    }
                }
                return true;
            };

            this.evaluateOperationList = function() {
                while (operationList.length > 3) {
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
                operationList = [operationList[0]];
                return null;
            };

            function evaluateBinaryOperation(operatorList) {
                operand1 = parseFloat(operatorList[0].getValue());
                operand2 = parseFloat(operatorList[2].getValue());
                var result;
                switch (operatorList[1].getValue()) {
                    case '+':
                        result = parseFloat(
                            (operand1 + operand2).toPrecision(10) // perform operation, then set maximum significant figures
                        ).toString(); // remove trailing zeroes
                        return new OperationStage(result, 'operand', 'implicit');
                    case '-':
                        result = parseFloat(
                            (operand1 - operand2).toPrecision(10) // perform operation, then set maximum significant figures
                        ).toString(); // remove trailing zeroes
                        return new OperationStage(result, 'operand', 'implicit');
                    case '×':
                        result = parseFloat(
                            (operand1 * operand2).toPrecision(10) // perform operation, then set maximum significant figures
                        ).toString(); // remove trailing zeroes
                        return new OperationStage(result, 'operand', 'implicit');
                    case '÷':
                        result = parseFloat(
                            (operand1 / operand2).toPrecision(10) // perform operation, then set maximum significant figures
                        ).toString(); // remove trailing zeroes
                        return new OperationStage(result, 'operand', 'implicit');
                }
            }

            this.cloneOperationList = function () {
                var listClone = [];
                for (var i = 0; i < operationList.length; i++) {
                    listClone.push(new CopyOperationStage(operationList[i]));
                }
                return listClone;
            };

            this.getLastOperation = function(){
                if (operationList.length < 1) {
                    return undefined;
                }
                return operationList[operationList.length - 1];
            };

            this.setLastOperation = function(newEntry) {
                if (operationList.length >= 1) {
                    operationList[operationList.length - 1] = newEntry;
                } else {
                    operationList.push(newEntry);
                }
            };

            this.getRepeatOperator = function() {
                return repeatOperator;
            };

            this.getRepeatOperand = function () {
                return repeatOperand;
            };

            function setRepeatOperation(operation) {
                if (operation === null) {
                    repeatOperand = null;
                    repeatOperator = null;
                    return null;
                } else if (operation.getOperationType() == 'operand') {
                    repeatOperand = operation;
                    return null;
                } else if (operation.getOperatorType() == 'unary') {
                    repeatOperand = null;
                    repeatOperator = null;
                    return null;
                } else if (operation.getValue() != '='){
                    repeatOperator = operation;
                    return null;
                } else {
                    return null;
                }
            }

        }

        function OperationStage (value, operationType, creationType) {
            var operatorType;
            var operatorPriority;
            if (operationType == 'operand') {
                if (value == '.') {
                    value = '0.';
                }
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
                } else if (buttonPress.getString() == '=') {
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
                            if (this.getValue() == '0' && buttonPress.getString() != '.') {
                                return true;
                            }
                            return false;
                        }
                        return true;
                        break;
                    case 'operator':
                        if (buttonPress.getString() != '=') {
                            return true;
                        }
                        return false;
                        break;
                    default:
                        return false;
                }
            };

            this.canAppend = function(buttonPress) {
                if (this.getOperationType() != 'operand' || buttonPress.getOperationType() != 'operand') {
                    return false;
                }
                if ((buttonPress.getString() == '.') && (this.getValue().indexOf('.') >= 0)) {
                    return false;
                }
                if (this.getValue().length - (this.getValue().indexOf('.') > 0) >= 10) {
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
        function CopyOperationStage(referenceOperationStage, creationType) {
            if (creationType === undefined) {creationType = referenceOperationStage.getCreationType();}
            OperationStage.call(this, referenceOperationStage.getValue(), referenceOperationStage.getOperationType(), creationType);
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
         * Takes the given display object and updates the relevant displays
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

    }
    //  Close DisplayController constructor

}
//  Close CalculatorController constructor