
//  Begin OperationList class
/**
 * Constructs a list for holding and modifying Operations. A single Operation represents a single expression.
 * @param {Object} [operations] - Operation(s) used to populate OperationList
 *     @property {Operation|Operation[]} [list] - existing Operation(s) used to populate OperationList list
 *     @property {Object} [repeat] - Operations to repeat on next evaluation
 *         @property {Operation} [operand] - operand to repeat on next evaluation
 *         @property {Operation} [operator] - operator to repeat on next evaluation
 * @constructor
 */
function OperationList (operations) {

    //  Begin initial private variable assignment
    this._list = [new ZeroOperation()];
    this._repeat = {
        operand: null,
        operator: null
    };
    if (operations) {
        if (operations.hasOwnProperty('list') && operations.list) {
            this._list = (Array.isArray(operations.list))
                ? operations.list
                : [operations.clone(true)];
        }
        if (operations.hasOwnProperty('repeat') && operations.repeat) {
            if (operations.repeat.hasOwnProperty('operand') && operations.repeat.operand) {
                this._repeat.operand = operations.repeat.operand;
            }
            if (operations.repeat.hasOwnProperty('operator') && operations.repeat.operator) {
                this._repeat.operator = operations.repeat.operator;
            }
        }
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
        var lastOperationTruncate = this.last.canTruncate();
        if (lastOperationTruncate) {
            if (lastOperationTruncate > 1) {
                return this.last.truncate();
            } else {
                this.last = new ZeroOperation();
                if (this._list.length > 1) {
                    this.repeat = this.last;
                }
            }
        }
        return false;
    };
    //  End clearLastChar method

    //  Begin clearEntry method
    this.clearEntry = function() {
        if (!this.last.implicit ||
            this.last.type != 'operand' ||
            this.last.value !== '0') {
            this.last = new ZeroOperation();
            if (this._list.length > 1) {
                this.repeat = this.last;
            }
            return true;
        } else {
            return false;
        }
    };
    //  Close clearEntry method

    //  Begin validation method
    this.validateOperationList = function() {
        if (this.last.type != 'operator') {
            return false;
        }
        if (this.last.operatorType != 'binary') {
            return false;
        }
        var runningList = this._cloneList();
        runningList = this._evaluateRunningList(runningList);
        this._list.push(runningList[0].clone(true));
        if (this._list[this._list.length - 2].value != '=') {
            this.repeat = this.last;
            return false;
        }
        if (this._list.length == 3) {
            if (this._repeat.operand !== null && this._repeat.operator !== null) {
                this._list.splice(1, 0, this._repeat.operator, this._repeat.operand);
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
    this._evaluateRunningList = function(runningList) {
        while (runningList.length > 3) {
            for (var i=0; i < runningList.length-1; i++) {
                if (runningList[i].type == 'operator') {
                    if (runningList[i].operatorType == 'binary' && i < runningList.length - 2) {
                        if (runningList[i].priority >= runningList[i+2].priority) { // enforce mathematical order of operations
                            var operation = runningList.slice(i - 1, i + 2);
                            var newOperation = this._evaluateBinaryOperation(operation);
                            runningList.splice(i - 1, 3, newOperation);
                            break;
                        } else if (i == runningList.length - 3) {
                            return [runningList[runningList.length - 2]];
                        }
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
                            var newOperation = this._evaluateBinaryOperation(operation);
                            this._list.splice(i - 1, 3, newOperation);
                            break;
                        }
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
     * @param {Array} operatorList length of 3, structured as [Operand, Operator, Operand], where Operator is a binary operation
     * @returns {Operation}
     */
    this._evaluateBinaryOperation = function (operatorList) {
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
    };
    //  Close evaluation methods

    //  Begin cloneList method
    this._cloneList = function () {
        return this._list.map(function (operation) {
            return operation.clone();
        });
    };
    //  Close cloneList method
}

    //  Begin get/set methods
Object.defineProperties(OperationList.prototype, {
    'last': {
        enumerable: true,
        get: function () {
            if (this._list.length < 1) {
                return undefined;
            }
            return this._list[this._list.length - 1];
        },
        set: function(operation) {
            if (this._list.length >= 1) {
                this._list[this._list.length - 1] = operation;
            } else {
                this._list.push(operation);
            }
        }
    },
    'repeat': {
        enumerable: true,
        get: function () {
            return {
                operand: this._repeat.operand,
                operator: this._repeat.operator
            }
        },
        set: function (operation) {
            if (operation === null) {
                this._repeat.operand = null;
                this._repeat.operator = null;
            } else if (operation.type === 'operand') {
                this._repeat.operand = operation;
            } else if (operation.operatorType === 'unary') {
                this._repeat.operand = null;
                this._repeat.operator = null;
            } else if (operation.value !== '='){
                this._repeat.operator = operation;
            }
            return null;
        }
    }
});
    //  Close get/set methods

    //  Begin push method
OperationList.prototype.push = function(inputObject) {
    var currentIndex = this._list.length - 1;
    while (currentIndex > 0 && this._list[currentIndex].canPrecede(inputObject)) {
        currentIndex--;
    }
    if (currentIndex < 0) {
        return false;
    } else if (this._list[currentIndex].canReplace(inputObject)) {
        this._list[currentIndex] = new InputObjectOperation(inputObject);
        this.repeat = this._list[currentIndex];
    } else if (this._list[currentIndex].canAppend(inputObject)) {
        this._list[currentIndex].appendInputObject(inputObject);
        this.repeat = this._list[currentIndex];
    } else if (this._list[currentIndex].canFollow(inputObject)) {
        this._list.push(new InputObjectOperation(inputObject));
        this.repeat = this._list[currentIndex + 1];
    }
    return true;
};
    //  Close push method

    //  Begin clone method
OperationList.prototype.clone = function () {
    return new OperationList({
        list: this._list.map(function (operation) {
            return operation.clone();
        }),
        repeat: this.repeat
    });
};
    //  Close clone method

//  Close OperationList class

//  Begin RunningOperationList subclass
function RunningOperationList(){

}
RunningOperationList.prototype.__proto__ = OperationList.prototype;
//  Close RunningOperationList subclass

//  Begin OperationGroup subclass
function OperationGroup(){

}
OperationGroup.prototype.__proto__ = OperationList.prototype;
//  Close OperationGroup subclass

//  Begin BinaryOperationList subclass
function BinaryOperationList(operand1, operator, operand2){

}
BinaryOperationList.prototype.__proto__ = OperationList.prototype;
//  Close BinaryOperationList subclass

//  Begin UnaryOperationList subclass
function UnaryOperationList(operand, operator){

}

UnaryOperationList.prototype.__proto__ = OperationList.prototype;
//  Close UnaryOperationList subclass
