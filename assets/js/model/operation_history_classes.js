
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
