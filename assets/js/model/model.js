//  Begin CalculatorModel constructor
/**
 * Constructs model for memory objects
 * @constructor
 */
function CalculatorModel () {

    //  Begin initial private variable construction
    var operationHistory = new OperationHistory();
    var currentOperationList = new OperationList();
    //  Close initial private variable construction

    //  Begin applyInputObject method
    /**
     * Updates operation lists as necessary, then returns an array containing display information
     * @param {Object} inputObject
     * @returns {Array} nested arrays containing display information
     */
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
                    case '←':
                        clearLastChar();
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
                    previousOperationList.last = currentOperationList.last;
                    operationHistory.archiveOperationList(previousOperationList);
                }
                break;
            default:
                return [['ERROR','invalid operation type'],[]];
        }

        return [currentOperationList.getDisplayObject(), operationHistory.getDisplayObject()];
    };
    //  Close applyInputObject method

    //  Begin cloneOperationList method
    function cloneOperationList (operationList) {
        return new OperationList({
            list: operationList.cloneOperationList(),
            repeat: operationList.repeat
        });
    }
    //  Close cloneOperationList method

    //  Begin clearLastChar method
    /**
     * Removes the last character from the most recent operand, if it is explicit.
     */ 
    function clearLastChar() {
        currentOperationList.clearLastChar();
    }
    //  End clearLastChar method

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
//  Close CalculatorModel constructor
