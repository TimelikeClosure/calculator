
//  Begin Operation class

/**
 * @name Operation
 * @summary Constructor for Operation objects. These contain a single operand or operator, type information, and
 * circumstances of creation.
 * @param {string} value - operation value
 * @param {string} type - operation type: "operator", "operand"
 * @param {boolean} [implicit=false] - is operation implied
 * @constructor
 */
function Operation (value, type, implicit) {

    //  Begin initial private variable assignment
    this._value = (value === '.') ? '0.' : value;   // New Operations initiated with a decimal point are led with a zero.
    this._type = type;
    this._implicit = (implicit === true);   // Set default implicit property as false
    if (this._type == 'operator') {
        switch (this._value) {
            case '!':
                this._operatorType = 'unary';
                break;
            case '=':
            case '+':
            case '-':
            case '×':
            case '÷':
                this._operatorType = 'binary';
                break;
        }
        switch (this._value) {
            case '(':
            case ')':
                this._priority = 4;
                break;
            case '×':
            case '÷':
                this._priority = 2;
                break;
            case '+':
            case '-':
                this._priority = 1;
                break;
            case '=':
                this._priority = 0;
                break;
        }
    }
    //  Close initial private variable assignment

}

    //  Begin Get methods
Object.defineProperties(Operation.prototype, {
    value: {enumerable: true, get: function () {return this._value;}},
    type: {enumerable: true, get: function () {return this._type;}},
    operatorType: {enumerable: true, get: function () {return this._operatorType || false;}},
    priority: {enumerable: true, get: function () {return this._priority;}},
    implicit: {enumerable: true, get: function () {return this._implicit;}}
});
    //  Close Get methods

    //  Begin inputObject test methods
/**
 * Tests whether the Operation's value can be truncated.
 * @returns {number|false} Operation's value's length if can be truncated, false otherwise.
 */
Operation.prototype.canTruncate = function() {
    if (this._type == 'operand' && !this._implicit) {
        return this.value.length;
    }
    return false;
};

/**
 * Tests whether the inputObject can affect the Operation prior to the current one in an OperationList.
 * @param {Object} inputObject
 * @returns {boolean}
 */
Operation.prototype.canPrecede = function(inputObject) {
    if (inputObject.getOperationType() != 'operator') {
        return false;
    } else if (this.type != 'operand') {
        return false;
    } else if (!this.implicit) {
        return false;
    } else if (inputObject.getString() == '=') {
        return false;
    }
    return true;
};
/**
 * Tests whether the inputObject can replace the current Operation.
 * @param {Object} inputObject
 * @returns {boolean}
 */
Operation.prototype.canReplace = function(inputObject) {
    if (this.type != inputObject.getOperationType()) {
        return false;
    }
    switch (this.type) {
        case 'operand':
            if (!this.implicit) {
                if (this.value == '0' && inputObject.getString() != '.') {
                    return true;
                }
                return false;
            }
            return true;
        case 'operator':
            if (inputObject.getString() != '=') {
                return true;
            }
            return false;
        default:
            return false;
    }
};
/**
 * Tests whether the inputObject can append to the current Operation.
 * @param {Object} inputObject
 * @returns {boolean}
 */
Operation.prototype.canAppend = function(inputObject) {
    if (this.type != 'operand' || inputObject.getOperationType() != 'operand') {
        return false;
    }
    if ((inputObject.getString() == '.') && (this.value.indexOf('.') >= 0)) {
        return false;
    }
    if (this.value.length - (this.value.indexOf('.') > 0) >= 10) {
        return false;
    }
    return true;
};
/**
 * Tests whether the inputObject can be added after the current Operation in an OperationList.
 * @param {Object} inputObject
 * @returns {boolean}
 */
Operation.prototype.canFollow = function(inputObject) {
    var isInputObjectOperand = (inputObject.getOperationType()=='operand');
    var isLastOperatorBinaryOperator = ((this.type=='operator') && (this.type=='binary'));
    return (isInputObjectOperand == isLastOperatorBinaryOperator);
    //  Only operands can follow binary operators.
    //  Only operators can follow operands and unary operators.
};
    //  Close inputObject test methods

    //  Begin value modification methods
/**
 * Append the given inputObject to the Operation
 * @param {Object} inputObject
 * @returns {null}
 */
Operation.prototype.appendInputObject = function(inputObject) {
    this._value += inputObject.getString();
    return null;
};

Operation.prototype.truncate = function() {
    this._value = this._value.substr(0, this._value.length - 1);
};
    //  End value modification methods
    
    //  Begin clone method
Operation.prototype.clone = function (implicit) {
    if (implicit === undefined) { implicit = this._implicit;}
    return new Operation(this._value, this._type, implicit);
};
    //  Close clone method

//  Close Operation class

//  Begin Operation sub-class constructors
/**
 * Generates an Operation object with an implicit zero.
 * @constructor
 */
function ZeroOperation () {
    Operation.call(this, '0', 'operand', true);
}
ZeroOperation.prototype.__proto__ = Operation.prototype;

/**
 * Generates an explicit Operation object from a InputObject object
 * @param {Object}  inputObject
 * @constructor
 */
function InputObjectOperation(inputObject) {
    Operation.call(this, inputObject.getString(), inputObject.getOperationType());
}
InputObjectOperation.prototype.__proto__ = Operation.prototype;
//  Close Operation sub-class constructors
