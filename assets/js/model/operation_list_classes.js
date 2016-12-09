
//  Begin OperationList constructor
/**
 * Constructs a list for holding and modifying Operations. A single Operation represents a single expression.
 * @param {Object} [operations] - existing operation(s) used to populate OperationList
 * @param {Object} repeatOperator
 * @param {Object} repeatOperand
 * @constructor
 */
function OperationList (operations, repeatOperator, repeatOperand) {

    //  Begin initial private variable assignment
    if (operations === undefined) {
        this._list = [new ZeroOperation()];
    } else if (!(Array.isArray(operations))) {
        this._list = [new CopyOperation(operations, true)];
    } else {
        this._list = operations;
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
        if (this._list.length < 1) {
            return ['null',''];
        } else {
            var operationListClone = this._list.slice();
            var lastOperation = (operationListClone.pop()).value;
            return [lastOperation, operationListClone.map(function(object){return object.value;}).join(' ')];
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
                if (this._list.length > 1) {
                    setRepeatOperation(this.getLastOperation());
                }
            }
        }
        return false;
    };
    //  End clearLastChar method

    //  Begin clearEntry method
    this.clearEntry = function() {
        if (!this.getLastOperation().implicit ||
            this.getLastOperation().type != 'operand' ||
            this.getLastOperation().value !== '0') {
            this.setLastOperation(new ZeroOperation());
            if (this._list.length > 1) {
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
        var currentIndex = this._list.length - 1;
        while (currentIndex > 0 && this._list[currentIndex].canPrecede(inputObject)) {
            currentIndex--;
        }
        if (currentIndex < 0) {
            return false;
        } else if (this._list[currentIndex].canReplace(inputObject)) {
            this._list[currentIndex] = new InputObjectOperation(inputObject);
            setRepeatOperation(this._list[currentIndex]);
        } else if (this._list[currentIndex].canAppend(inputObject)) {
            this._list[currentIndex].appendInputObject(inputObject);
            setRepeatOperation(this._list[currentIndex]);
        } else if (this._list[currentIndex].canFollow(inputObject)) {
            this._list.push(new InputObjectOperation(inputObject));
            setRepeatOperation(this._list[currentIndex + 1]);
        }
        return true;
    };
    //  Close addOperation method

    //  Begin validation method
    this.validateOperationList = function() {
        if (this.getLastOperation().type != 'operator') {
            return false;
        }
        if (this.getLastOperation().operatorType != 'binary') {
            return false;
        }
        var runningList = this.cloneOperationList();
        runningList = evaluateRunningList(runningList);
        this._list.push(new CopyOperation(runningList[0], true));
        if (this._list[this._list.length - 2].value != '=') {
            setRepeatOperation(this._list[this._list.length - 1]);
            return false;
        }
        if (this._list.length == 3) {
            if (repeatOperand !== null && repeatOperator !== null) {
                this._list.splice(1, 0, repeatOperator, repeatOperand);
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
                if (runningList[i].type == 'operator') {
                    if (runningList[i].operatorType == 'binary' && i < runningList.length - 2) {
                        if (runningList[i].priority >= runningList[i+2].priority) { // enforce mathematical order of operations
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
                    } else if (runningList[i].operatorType == 'unary') {

                    }
                }
            }
        }
        return [runningList[runningList.length - 2]];
    }

    /**
     * Evaluates the entire list according to mathematical order of operations.
     * @returns {null}
     */
    this.evaluateOperationList = function() {
        while (this._list.length > 3) {
            for (var i=0; i < this._list.length; i++) {
                if (this._list[i].type == 'operator') {
                    if (this._list[i].operatorType == 'binary') {
                        if (i > this._list.length - 3 || this._list[i].priority >= this._list[i+2].priority) { // enforce mathematical order of operations
                            var operation = this._list.slice(i - 1, i + 2);
                            var newOperation = evaluateBinaryOperation(operation);
                            this._list.splice(i - 1, 3, newOperation);
                            break;
                        }
                        /*var operation = this._list.slice(i - 1, i + 2); // evaluate without enforcing mathematical order of operation
                        var newOperation = evaluateBinaryOperation(operation);
                        this._list.splice(i - 1, 3, newOperation);
                        break;*/
                    } else if (this._list[i].operatorType == 'unary') {

                    }
                }
            }
        }
        this._list = [this._list[0]];
        return null;
    };

    /**
     * Takes an array containing a binary operation and returns the evaluated result.
     * @param {Array} operatorList length of 3, structured as [OperandStage, OperatorStage, OperandStage],
     * where OperatorStage is a binary operation
     * @returns {Operation}
     */
    function evaluateBinaryOperation(operatorList) {
        operand1 = parseFloat(operatorList[0].value);
        operand2 = parseFloat(operatorList[2].value);
        var result;
        switch (operatorList[1].value) {
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
        for (var i = 0; i < this._list.length; i++) {
            listClone.push(new CopyOperation(this._list[i]));
        }
        return listClone;
    };
    //  Close cloneOperationList method

    //  Begin get/set last operation methods
    this.getLastOperation = function(){
        if (this._list.length < 1) {
            return undefined;
        }
        return this._list[this._list.length - 1];
    };
    this.setLastOperation = function(newEntry) {
        if (this._list.length >= 1) {
            this._list[this._list.length - 1] = newEntry;
        } else {
            this._list.push(newEntry);
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
        } else if (operation.type == 'operand') {
            repeatOperand = operation;
            return null;
        } else if (operation.operatorType == 'unary') {
            repeatOperand = null;
            repeatOperator = null;
            return null;
        } else if (operation.value != '='){
            repeatOperator = operation;
            return null;
        } else {
            return null;
        }
    }
    //  Close repeat evaluation operator methods
}
//  Close OperationList constructor
