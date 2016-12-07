
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

    //  Begin value modification methods
    /**
     * Append the given inputObject to the OperationStage
     * @param {Object} inputObject
     * @returns {null}
     */
    this.appendInputObject = function(inputObject) {
        value += inputObject.getString();
        return null;
    };

    this.truncate = function() {
        value = value.substr(0, value.length - 1);
    };
    //  End value modification methods

    //  Begin inputObject test methods
    /**
     * Tests whether the OperationStage's value can be truncated.
     * @returns {number|false} OperationStage's value's length if can be truncated, false otherwise.
     */
    this.canTruncate = function() {
        if (operationType == 'operand' && creationType == 'explicit') {
            return this.getValue().length;
        }
        return false;
    };

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
