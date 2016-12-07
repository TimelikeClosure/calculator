
//  Begin OperationList constructor
/**
 * Constructs a list for holding and modifying Operations. A single Operation represents a single expression.
 * @param {Object} lastOperation
 * @param {Object} repeatOperator
 * @param {Object} repeatOperand
 * @constructor
 */
function OperationList (lastOperation, repeatOperator, repeatOperand) {

    //  Begin initial private variable assignment
    var operationList;
    if (lastOperation === undefined) {
        operationList = [new ZeroOperation()];
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
    //  Close initial private variable assignment

    //  Begin getDisplayObject method
    this.getDisplayObject = function() {
        if (operationList.length < 1) {
            return ['null',''];
        } else {
            var operationListClone = operationList.slice();
            var lastOperation = (operationListClone.pop()).value();
            return [lastOperation, operationListClone.map(function(object){return object.value();}).join(' ')];
        }
    };
    //  Close getDisplayObject method

    //  Begin clearLastChar method
    this.clearLastChar = function() {
        var lastOperationTruncate = this.getLastOperation().canTruncate();
        if (lastOperationTruncate) {
            if (lastOperationTruncate > 1) {
                return this.getLastOperation().truncate();
            } else {
                this.setLastOperation(new ZeroOperation());
                if (operationList.length > 1) {
                    setRepeatOperation(this.getLastOperation());
                }
            }
        }
        return false;
    };
    //  End clearLastChar method

    //  Begin clearEntry method
    this.clearEntry = function() {
        if (!this.getLastOperation().implicit() ||
            this.getLastOperation().type() != 'operand' ||
            this.getLastOperation().value() !== '0') {
            this.setLastOperation(new ZeroOperation());
            if (operationList.length > 1) {
                setRepeatOperation(this.getLastOperation());
            }
            return true;
        } else {
            return false;
        }
    };
    //  Close clearEntry method

    //  Begin addOperation method
    this.addOperation = function(inputObject) {
        var currentIndex = operationList.length - 1;
        while (currentIndex > 0 && operationList[currentIndex].canPrecede(inputObject)) {
            currentIndex--;
        }
        if (currentIndex < 0) {
            return false;
        } else if (operationList[currentIndex].canReplace(inputObject)) {
            operationList[currentIndex] = new InputObjectOperation(inputObject);
            setRepeatOperation(operationList[currentIndex]);
        } else if (operationList[currentIndex].canAppend(inputObject)) {
            operationList[currentIndex].appendInputObject(inputObject);
            setRepeatOperation(operationList[currentIndex]);
        } else if (operationList[currentIndex].canFollow(inputObject)) {
            operationList.push(new InputObjectOperation(inputObject));
            setRepeatOperation(operationList[currentIndex + 1]);
        }
        return true;
    };
    //  Close addOperation method

    //  Begin validation method
    this.validateOperationList = function() {
        if (this.getLastOperation().type() != 'operator') {
            return false;
        }
        if (this.getLastOperation().getOperatorType() != 'binary') {
            return false;
        }
        var runningList = this.cloneOperationList();
        runningList = evaluateRunningList(runningList);
        operationList.push(new CopyOperation(runningList[0], true));
        if (operationList[operationList.length - 2].value() != '=') {
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
    //  Close validation method

    //  Begin evaluation methods
    /**
     * Evaluates the given runningList, excluding the last operation and any prevented by mathematical order of
     * operations, and returns the last operand in an array.
     * @param runningList
     * @returns {Array}
     */
    function evaluateRunningList (runningList) {
        while (runningList.length > 3) {
            for (var i=0; i < runningList.length-1; i++) {
                if (runningList[i].type() == 'operator') {
                    if (runningList[i].getOperatorType() == 'binary' && i < runningList.length - 2) {
                        if (runningList[i].priority() >= runningList[i+2].priority()) { // enforce mathematical order of operations
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

    /**
     * Evaluates the entire operationList according to mathematical order of operations.
     * @returns {null}
     */
    this.evaluateOperationList = function() {
        while (operationList.length > 3) {
            for (var i=0; i < operationList.length; i++) {
                if (operationList[i].type() == 'operator') {
                    if (operationList[i].getOperatorType() == 'binary') {
                        if (i > operationList.length - 3 || operationList[i].priority() >= operationList[i+2].priority()) { // enforce mathematical order of operations
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

    /**
     * Takes an array containing a binary operation and returns the evaluated result.
     * @param {Array} operatorList length of 3, structured as [OperandStage, OperatorStage, OperandStage],
     * where OperatorStage is a binary operation
     * @returns {Operation}
     */
    function evaluateBinaryOperation(operatorList) {
        operand1 = parseFloat(operatorList[0].value());
        operand2 = parseFloat(operatorList[2].value());
        var result;
        switch (operatorList[1].value()) {
            case '+':
                result = parseFloat(
                    (operand1 + operand2).toPrecision(10) // perform operation, then set maximum significant figures
                ).toString(); // remove trailing zeroes
                return new Operation(result, 'operand', true);
            case '-':
                result = parseFloat(
                    (operand1 - operand2).toPrecision(10) // perform operation, then set maximum significant figures
                ).toString(); // remove trailing zeroes
                return new Operation(result, 'operand', true);
            case '×':
                result = parseFloat(
                    (operand1 * operand2).toPrecision(10) // perform operation, then set maximum significant figures
                ).toString(); // remove trailing zeroes
                return new Operation(result, 'operand', true);
            case '÷':
                result = parseFloat(
                    (operand1 / operand2).toPrecision(10) // perform operation, then set maximum significant figures
                ).toString(); // remove trailing zeroes
                return new Operation(result, 'operand', true);
        }
    }
    //  Close evaluation methods

    //  Begin cloneOperationList method
    this.cloneOperationList = function () {
        var listClone = [];
        for (var i = 0; i < operationList.length; i++) {
            listClone.push(new CopyOperation(operationList[i]));
        }
        return listClone;
    };
    //  Close cloneOperationList method

    //  Begin get/set last operation methods
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
    //  Close get/set last operation methods

    //  Begin repeat evaluation operator methods
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
        } else if (operation.type() == 'operand') {
            repeatOperand = operation;
            return null;
        } else if (operation.getOperatorType() == 'unary') {
            repeatOperand = null;
            repeatOperator = null;
            return null;
        } else if (operation.value() != '='){
            repeatOperator = operation;
            return null;
        } else {
            return null;
        }
    }
    //  Close repeat evaluation operator methods
}
//  Close OperationList constructor

//  Begin OperationHistory constructor
/**
 * Constructs an object for storing previously evaluated OperationLists
 * @constructor
 */
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
//  Close OperationHistory constructor
