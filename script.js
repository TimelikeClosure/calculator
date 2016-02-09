
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
    this.addButtonPress = function($buttonDOMObject) {
        display.emptyDisplay();
        var buttonPress = buttons.getButtonPressObject($buttonDOMObject);
        var memoryDisplayObject = memory.applyInputObject(buttonPress);
        display.updateDisplay(memoryDisplayObject);
    };
    //  Close addButtonPress controller method

    //  Begin ButtonsController constructor
    /**
     * Constructs controller for DOM button inputs
     * @constructor
     */
    function ButtonsController () {

        //  Begin getButtonPressObject method
        /**
         * Given a jQuery selector, generates a ButtonPress object for use by the memory controller.
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
                    return new SpecialPress(buttonString);
                default:
                    return undefined;
            }
        }
        //  Close getButtonPressObject subroutines

        //  Begin ButtonPress object constructors
        /**
         * Constructs a ButtonPress object for use by the memoryController.
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
    //  Close ButtonsController constructor

    //  Begin MemoryController constructor
    /**
     * Constructs controller for memory objects
     * @constructor
     */
    function MemoryController () {
        var operationHistory = new OperationHistory();
        var currentOperationList = new OperationList();
        this.applyInputObject = function(inputObject) {
            switch (inputObject.getOperationType()) {
                case 'special':
                    switch (inputObject.getString()) {
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
                    var validate = currentOperationList.addOperation(inputObject);
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

            this.addOperation = function(inputObject) {
                var currentIndex = operationList.length - 1;
                while (currentIndex > 0 && operationList[currentIndex].canPrecede(inputObject)) {
                    currentIndex--;
                }
                if (currentIndex < 0) {
                    return false;
                } else if (operationList[currentIndex].canReplace(inputObject)) {
                    operationList[currentIndex] = new InputObjectOperationStage(inputObject);
                    setRepeatOperation(operationList[currentIndex]);
                } else if (operationList[currentIndex].canAppend(inputObject)) {
                    operationList[currentIndex].appendInputObject(inputObject);
                    setRepeatOperation(operationList[currentIndex]);
                } else if (operationList[currentIndex].canFollow(inputObject)) {
                    operationList.push(new InputObjectOperationStage(inputObject));
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
                var runningList = this.cloneOperationList();
                runningList = evaluateRunningList(runningList);
                operationList.push(new CopyOperationStage(runningList[0], 'implicit'));
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

            function evaluateRunningList (runningList) {
                while (runningList.length > 3) {
                    for (var i=0; i < runningList.length-1; i++) {
                        if (runningList[i].getOperationType() == 'operator') {
                            if (runningList[i].getOperatorType() == 'binary' && i < runningList.length - 2) {
                                if (runningList[i].getOperatorPriority() >= runningList[i+2].getOperatorPriority()) { // enforce mathematical order of operations
                                    var operation = runningList.slice(i - 1, i + 2);
                                    var newOperation = evaluateBinaryOperation(operation);
                                    runningList.splice(i - 1, 3, newOperation);
                                    break;
                                } else if (i == runningList.length - 3) {
                                    return [runningList[runningList.length - 2]];
                                }
                                /*var operation = runningList.slice(i - 1, i + 2); // evaluate without enforcing mathematical order of operation
                                var newOperation = evaluateBinaryOperation(operation);
                                runningList.splice(i - 1, 3, newOperation);
                                break;*/
                            } else if (runningList[i].getOperatorType() == 'unary') {

                            }
                        }
                    }
                }
                return [runningList[runningList.length - 2]];
            }

            this.evaluateOperationList = function() {
                while (operationList.length > 3) {
                    for (var i=0; i < operationList.length; i++) {
                        if (operationList[i].getOperationType() == 'operator') {
                            if (operationList[i].getOperatorType() == 'binary') {
                                if (i > operationList.length - 3 || operationList[i].getOperatorPriority() >= operationList[i+2].getOperatorPriority()) { // enforce mathematical order of operations
                                    var operation = operationList.slice(i - 1, i + 2);
                                    var newOperation = evaluateBinaryOperation(operation);
                                    operationList.splice(i - 1, 3, newOperation);
                                    break;
                                }
                                /*var operation = operationList.slice(i - 1, i + 2); // evaluate without enforcing mathematical order of operation
                                var newOperation = evaluateBinaryOperation(operation);
                                operationList.splice(i - 1, 3, newOperation);
                                break;*/
                            } else if (operationList[i].getOperatorType() == 'unary') {

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

        //  Begin OperationStage constructor
        /**
         * Constructor for OperationStage objects. These contain a single operand or operator, type information, and
         * circumstances of creation.
         * @param {string} value
         * @param {string} operationType
         * @param {string} creationType
         * @constructor
         */
        function OperationStage (value, operationType, creationType) {

            //  Begin initial private variable assignment
            var operatorType; // "unary", "binary", or "parenthesis"
            var operatorPriority; // Used for order of operations. Higher number takes higher priority. "=" set at 0.
            if (operationType == 'operand') {
                if (value == '.') { // New OperationStages initiated with a decimal point are led with a zero.
                    value = '0.';
                }
                operatorType = null;
                operatorPriority = null;
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
            //  Close initial private variable assignment

            //  Begin appendInputObject method
            /**
             * Append the given inputObject to the OperationStage
             * @param {Object} inputObject
             * @returns {null}
             */
            this.appendInputObject = function(inputObject) {
                value += inputObject.getString();
                return null;
            };
            //  Close appendInputObject method

            //  Begin inputObject test methods
            /**
             * Tests whether the inputObject can affect the OperationStage prior to the current one in an OperationList.
             * @param {Object} inputObject
             * @returns {boolean}
             */
            this.canPrecede = function(inputObject) {
                if (inputObject.getOperationType() != 'operator') {
                    return false;
                } else if (this.getOperationType() != 'operand') {
                    return false;
                } else if (this.getCreationType() != 'implicit') {
                    return false;
                } else if (inputObject.getString() == '=') {
                    return false;
                }
                return true;
            };
            /**
             * Tests whether the inputObject can replace the current OperationStage.
             * @param {Object} inputObject
             * @returns {boolean}
             */
            this.canReplace = function(inputObject) {
                if (this.getOperationType() != inputObject.getOperationType()) {
                    return false;
                }
                switch (this.getOperationType()) {
                    case 'operand':
                        if (this.getCreationType() != 'implicit') {
                            if (this.getValue() == '0' && inputObject.getString() != '.') {
                                return true;
                            }
                            return false;
                        }
                        return true;
                        break;
                    case 'operator':
                        if (inputObject.getString() != '=') {
                            return true;
                        }
                        return false;
                        break;
                    default:
                        return false;
                }
            };
            /**
             * Tests whether the inputObject can append to the current OperationStage.
             * @param {Object} inputObject
             * @returns {boolean}
             */
            this.canAppend = function(inputObject) {
                if (this.getOperationType() != 'operand' || inputObject.getOperationType() != 'operand') {
                    return false;
                }
                if ((inputObject.getString() == '.') && (this.getValue().indexOf('.') >= 0)) {
                    return false;
                }
                if (this.getValue().length - (this.getValue().indexOf('.') > 0) >= 10) {
                    return false;
                }
                return true;
            };
            /**
             * Tests whether the inputObject can be added after the current OperationStage in an OperationList.
             * @param {Object} inputObject
             * @returns {boolean}
             */
            this.canFollow = function(inputObject) {
                var isInputObjectOperand = (inputObject.getOperationType()=='operand');
                var isLastOperatorBinaryOperator = ((this.getOperationType()=='operator') && (this.getOperatorType()=='binary'));
                return (isInputObjectOperand == isLastOperatorBinaryOperator);
                //  Only operands can follow binary operators.
                //  Only operators can follow operands and unary operators.
            };
            //  Close inputObject test methods

            //  Begin Get methods
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
            //  Close Get methods

        }
        //  Close OperationStage constructor

        //  Begin OperationStage sub-class constructors
        /**
         * Generates an OperationStage object with an implicit zero.
         * @constructor
         */
        function ZeroOperationStage () {
            OperationStage.call(this, '0', 'operand', 'implicit');
        }
        /**
         * Generates an explicit OperationStage object from a InputObject object
         * @param {Object}  inputObject
         * @constructor
         */
        function InputObjectOperationStage(inputObject) {
            OperationStage.call(this, inputObject.getString(), inputObject.getOperationType(), 'explicit');
        }
        /**
         * Generates an OperationStage object, copying from another OperationStage object. If no creationType is specified,
         * takes on the same value as the reference object.
         * @param {Object} referenceOperationStage
         * @param {string|undefined} creationType
         * @constructor
         */
        function CopyOperationStage(referenceOperationStage, creationType) {
            if (creationType === undefined) {creationType = referenceOperationStage.getCreationType();}
            OperationStage.call(this, referenceOperationStage.getValue(), referenceOperationStage.getOperationType(), creationType);
        }
        //  Close OperationStage sub-class constructors

        //  Begin clearCurrentEntry method
        /**
         * Clears the most recent operand. If the most recent operand is an implicit "0", calls clearCurrentOperationList().
         */
        function clearCurrentEntry() {
            var clearCurrentEntryResult = currentOperationList.clearEntry();
            if (!clearCurrentEntryResult) {
                clearCurrentOperationList();
            }
        }
        //  Close clearCurrentEntry method

        //  Begin clearCurrentOperationList method
        /**
         * Replaces the current operation list with a new, empty one.
         */
        function clearCurrentOperationList() {
            currentOperationList = new OperationList();
        }
        //  Close clearCurrentOperationList method
    }
    //  Close MemoryController constructor

    //  Begin DisplayController constructor
    /**
     * Constructs controller for DOM display objects.
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

    }
    //  Close DisplayController constructor

}
//  Close CalculatorController constructor