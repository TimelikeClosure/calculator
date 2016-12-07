
//  Begin Operation constructor
/**
 * Constructor for Operation objects. These contain a single operand or operator, type information, and
 * circumstances of creation.
 * @param {string} value
 * @param {string} type - operation type: "
 * @param {boolean} implicit
 * @constructor
 */
function Operation (value, type, implicit) {

    //  Begin initial private variable assignment
    this._value = value;
    this._type = type;
    if (typeof implicit !== "boolean" && typeof implicit !== "undefined") {
        throw "invalid Operation argument provided for implicit: " + implicit;
    }
    this._implicit = (implicit === true);
    if (this._type == 'operand') {
        if (this._value == '.') { // New Operations initiated with a decimal point are led with a zero.
            this._value = '0.';
        }
    } else if (this._type == 'operator') {
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

    //  Begin value modification methods
    /**
     * Append the given inputObject to the Operation
     * @param {Object} inputObject
     * @returns {null}
     */
    this.appendInputObject = function(inputObject) {
        this._value += inputObject.getString();
        return null;
    };

    this.truncate = function() {
        this._value = this._value.substr(0, this._value.length - 1);
    };
    //  End value modification methods

    //  Begin inputObject test methods
    /**
     * Tests whether the Operation's value can be truncated.
     * @returns {number|false} Operation's value's length if can be truncated, false otherwise.
     */
    this.canTruncate = function() {
        if (this._type == 'operand' && !this._implicit) {
            return this.value().length;
        }
        return false;
    };

    /**
     * Tests whether the inputObject can affect the Operation prior to the current one in an OperationList.
     * @param {Object} inputObject
     * @returns {boolean}
     */
    this.canPrecede = function(inputObject) {
        if (inputObject.getOperationType() != 'operator') {
            return false;
        } else if (this.type() != 'operand') {
            return false;
        } else if (!this.implicit()) {
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
    this.canReplace = function(inputObject) {
        if (this.type() != inputObject.getOperationType()) {
            return false;
        }
        switch (this.type()) {
            case 'operand':
                if (!this.implicit()) {
                    if (this.value() == '0' && inputObject.getString() != '.') {
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
    this.canAppend = function(inputObject) {
        if (this.type() != 'operand' || inputObject.getOperationType() != 'operand') {
            return false;
        }
        if ((inputObject.getString() == '.') && (this.value().indexOf('.') >= 0)) {
            return false;
        }
        if (this.value().length - (this.value().indexOf('.') > 0) >= 10) {
            return false;
        }
        return true;
    };
    /**
     * Tests whether the inputObject can be added after the current Operation in an OperationList.
     * @param {Object} inputObject
     * @returns {boolean}
     */
    this.canFollow = function(inputObject) {
        var isInputObjectOperand = (inputObject.getOperationType()=='operand');
        var isLastOperatorBinaryOperator = ((this.type()=='operator') && (this.type()=='binary'));
        return (isInputObjectOperand == isLastOperatorBinaryOperator);
        //  Only operands can follow binary operators.
        //  Only operators can follow operands and unary operators.
    };
    //  Close inputObject test methods

    //  Begin Get methods
    this.value = function() {
        return this._value;
    };
    this.type = function() {
        return this._type;
    };
    this.getOperatorType = function() {
        return this._operatorType;
    };
    this.priority = function() {
        return this._priority;
    };
    this.implicit = function () {
        return this._implicit;
    }
    //  Close Get methods

}
//  Close Operation constructor

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

/**
 * Generates an Operation object, copying from another Operation object. If no creationType is specified,
 * takes on the same value as the reference object.
 * @param {Object} referenceOperation
 * @param {string|undefined} creationType
 * @constructor
 */
function CopyOperation(referenceOperation, implicit) {
    if (implicit === undefined) {implicit = referenceOperation.implicit();}
    Operation.call(this, referenceOperation.value(), referenceOperation.type(), implicit);
}
CopyOperation.prototype.__proto__ = Operation.prototype;
//  Close Operation sub-class constructors
