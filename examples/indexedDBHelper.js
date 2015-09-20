// Some global variables (database, references to key UI elements)
var db,count;

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

    transaction.oncomplete = function(e) {
        callback();
    };
    request.onerror = databaseErrorOutput;
}

function databaseModifyRevsAbove(revVal, callback) {
    var transaction = db.transaction(['revisions'], 'readonly');
    var store = transaction.objectStore('revisions');
    var index = store.index("revNo");
    // Get everything in the store
    var keyRange = IDBKeyRange.lowerBound(revVal);
    var cursorRequest = index.openCursor(keyRange);
    // This fires once per row in the store
    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        // If there's data, add it to array
        if (result) {
            callback(result);
            result.continue();
            // Reach the end of the data
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

function databaseRevsCount(callback){
    var transaction = db.transaction(['revisions'], 'readonly');
    var store = transaction.objectStore('revisions');
    var req = store.count();    
    req.onsuccess = function(evt) {
      count = req.result;
    };
    req.onerror = function(evt) {
      
    };
}

function databaseRevsDelete(id, callback) {
    var transaction = db.transaction(['revisions'], 'readwrite');
    var store = transaction.objectStore('revisions');
    var request = store.delete(id);
    transaction.oncomplete = function(e) {
        callback();
    };
    request.onerror = databaseErrorOutput;
}

function loadRevision(val,callback){
    var numrevs = count;//todo if add a new revision in empty database
    if(val==numrevs+1){
        if(confirm("Create revision number "+val+"..."))
        {
            loadRevision(val-1,function(dataObj){
                databaseRevsAdd(val,dataObj.revData,function(){
                count = count + 1;
                alert("Revision "+val+"created with the saved revision data of Revision "+(val-1)+"...");
                });
            });
        }
    }
    else if(val>numrevs){
        alert("Invalid Revision Number...");
    }
    else{
        databaseRevsGetOne(val,callback);  
    }
}
 
 function addNewRevision(){
    return loadRevision(count+1);
 }

 function updateRev(revNum,updatedRevDataObj){
    var numrevs = count;
    if(revNum<=numrevs){
        var id = databaseRevsGetOne(val,function(dataObj){
            return dataObj.id;
        });
        databaseRevsUpdate(id,function(data){
            data.revData = updatedRevDataObj;
            return data;
        });
    }
 }

 function deleteRev(val){
    var numrevs = count;
    if(val<=numrevs){
        var id = databaseRevsGetOne(val,function(dataObj){
            return dataObj.id;
        });
        databaseRevsDelete(id,function(){
            count = count - 1;
            alert("Deleted the revision "+val+"...");
            databaseModifyRevsAbove(val,function(dataObj){
                dataObj.revNo = dataObj.revNo + 1;
                databaseRevsUpdate(dataObj.id, function(dataObj1){
                    dataObj1 = dataObj;
                    return dataObj1;
                }); 
            });
        });
        alert("Updated revision numbers accordingly...");
    }
 }
