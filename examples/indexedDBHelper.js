// Some global variables (database, references to key UI elements)
var db;

function databaseOpen(callback) {
    // Open a database, specify the name and version
    var version = 1;
    var request = indexedDB.open('revisionsDB', version);

    // Run migrations if necessary
    request.onupgradeneeded = function(e) {
        db = e.target.result;
        e.target.transaction.onerror = databaseErrorOutput;
        var store = db.createObjectStore('revisions', {
            keyPath: 'id',
            autoIncrement: true
        });
        store.createIndex('revNo', 'revNo', {
            unique: false
        });

    };

    request.onsuccess = function(e) {
        db = e.target.result;
        callback();
    };
    request.onerror = databaseErrorOutput;
}

function databaseErrorOutput(e) {
    console.error('An IndexedDB Error has occurred', e);
}

function databaseRevsAdd(revVal, revDataObj, callback) {
    var transaction = db.transaction(['revisions'], 'readwrite');
    var store = transaction.objectStore('revisions');
    var request = store.put({
        revNo: revVal,
        revData: revDataObj
    });
    getTableCells();

    transaction.oncomplete = function(e) {
        callback();
    };
    request.onerror = databaseError;
}

function databaseRevsGetAbove(revVal, callback) {
    var transaction = db.transaction(['revisions'], 'readonly');
    var store = transaction.objectStore('revisions');
    var index = store.index("revNo");
    // Get everything in the store
    var keyRange = IDBKeyRange.lowerBound(revVal);
    var cursorRequest = index.openCursor(keyRange);
    // This fires once per row in the store, so for simplicity
    // collect the data in an array (data) and send it pass it
    // in the callback in one go
    var data = [];
    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        // If there's data, add it to array
        if (result) {
            data.push(result);
            result.continue();
            // Reach the end of the data
        } else {
            callback(data);
        }
    };
}

function databaseRevsGetOne(revID, callback) {
    var transaction = db.transaction(['revisions'], 'readonly');
    var store = transaction.objectStore('revisions');
    var index = store.index("revNo");
    index.get(revID).onsuccess = function(event) {
        callback(event.target.result);
    };
}

function databaseRevsUpdate(id, callback) {
    var transaction = db.transaction(['revisions'], 'readwrite');
    var store = transaction.objectStore('revisions');
    var request = store.get(id);
    request.onerror = function(event) {
        // Handle errors!
    };
    request.onsuccess = function(event) {
        // Get the old value that we want to update
        var data = request.result;

        // update the value(s) in the object that you want to change
        data = callback(data);

        // Put this updated object back into the database.
        var requestUpdate = store.put(data);
        requestUpdate.onerror = function(event) {
            // Do something with the error
        };
        requestUpdate.onsuccess = function(event) {
            // Success - the data is updated!
        };
    };
}

function databaseRevsDelete(id, callback) {
    var transaction = db.transaction(['revisions'], 'readwrite');
    var store = transaction.objectStore('revisions');
    var request = store.delete(id);
    transaction.oncomplete = function(e) {
        callback();
    };
    request.onerror = databaseError;
}
