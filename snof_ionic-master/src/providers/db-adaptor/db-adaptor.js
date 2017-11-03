var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { SQLite } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
/*

  DBAdaptorProvider
 ===================

  * Loads sample data objects from assets/poc_data/*.json

  * Maintains Index of objects for querying - with keyword search capability

  * Uses Ionic Storage for underlying data store
    https://ionicframework.com/docs/storage/
      - WebSQL/IndexedDB in browser
      - SQLite on iOS/Android

*/
var DBAdaptorProvider = (function () {
    function DBAdaptorProvider(platform, storage, sqlite, http) {
        var _this = this;
        this.platform = platform;
        this.storage = storage;
        this.sqlite = sqlite;
        this.http = http;
        this.bytesInStorage = 0;
        this.index = {};
        this.sortIndexConfig = {};
        this.keywordIndexConfig = {};
        this.storage.get('bytesInStorage').then(function (res) {
            _this.bytesInStorage = (res) ? res : 0;
        });
        this.isBatchMode = true;
    }
    DBAdaptorProvider.prototype.initDatabase = function () {
        var _this = this;
        console.log('initDatabase');
        return new Promise(function (resolve) {
            _this.loadIndexes().then(function (res) {
                resolve(true);
            });
        });
    };
    DBAdaptorProvider.prototype.initSampleDatabase = function () {
        var _this = this;
        console.log('initSampleDatabase');
        return new Promise(function (resolve) {
            _this.loadSampleData().then(function (res) {
                _this.updateIndexes().then(function (res) {
                    _this.saveIndexes().then(function (res) {
                        resolve();
                    });
                });
            });
        });
    };
    DBAdaptorProvider.prototype.startBatch = function () {
        this.isBatchMode = true;
    };
    DBAdaptorProvider.prototype.finishBatch = function () {
        this.isBatchMode = false;
    };
    DBAdaptorProvider.prototype.getBytesInStorage = function () {
        return this.bytesInStorage;
    };
    //
    //
    // LOCAL QUERY ENGINE
    //
    DBAdaptorProvider.prototype.queryItems = function (objectType, expr) {
        var ps = [];
        var all_index = this.index['all-' + objectType];
        if (!expr || typeof expr == 'undefined') {
            var expr_1 = {};
        }
        //let ids = all_index;
        var ids_result = [];
        var resultHasId = {};
        //
        // keyword query
        //
        if (expr.keywordIndex && expr.keywordQuery) {
            var keyword_i = this.index[expr.keywordIndex];
            var keyword = void 0, keyword_index = void 0, itemId = void 0;
            var qtoks = expr.keywordQuery.toLowerCase().split(' ');
            for (var q = 0; q < qtoks.length; q++) {
                keyword = qtoks[q];
                keyword_index = keyword_i[keyword];
                if (keyword_index) {
                    // keyword found in index
                    for (var i = 0; i < keyword_index.length; i++) {
                        itemId = keyword_index[i];
                        // UNION of keywords
                        resultHasId[itemId] = true;
                        //if(ids.indexOf(itemId) == -1){
                        //  ids.push(itemId);
                        //}
                    }
                }
            }
        }
        else {
            //for(var i=0; i<all_index.length; i++){
            for (var key in all_index) {
                resultHasId[key] = true;
            }
        }
        //
        // Apply sortIndex if applicable
        //
        if (expr.sortIndex) {
            var sort_i = this.index[expr.sortIndex];
            //for(var i=0; i<sort_i.length; i++){
            for (var itemId in sort_i) {
                if (resultHasId[itemId]) {
                    ids_result.push(itemId);
                }
            }
        }
        else {
            for (var id in resultHasId) {
                ids_result.push(id);
            }
        }
        //
        // Apply offset/limit if applicable
        //
        if (expr.offset) {
            ids_result = ids_result.splice(expr.offset);
        }
        else {
            expr.offset = 0;
        }
        if (expr.limit) {
            ids_result = ids_result.splice(0, expr.limit);
        }
        //
        // Resolve result items
        //
        var result = [];
        for (var i = 0; i < ids_result.length; i++) {
            // resolve item
            ps.push(this.storage.get(objectType + ':' + ids_result[i]));
        }
        return new Promise(function (resolve) {
            Promise.all(ps).then(function (result) {
                resolve(result);
            });
        });
    };
    DBAdaptorProvider.prototype.loadItem = function (objectType, id) {
        console.warn('DEPRECATED method loadItem in DBAdaptorProvider.  Use loadItemFromLocal instead.');
        return this.loadItemFromLocal(objectType, id);
    };
    DBAdaptorProvider.prototype.loadItemFromLocal = function (objectType, id) {
        var _this = this;
        return new Promise(function (resolve) {
            // try local storage
            var key = (id) ? objectType + ':' + id : objectType;
            _this.storage.get(key).then(function (result) {
                resolve(result);
            });
        });
    };
    DBAdaptorProvider.prototype.removeItemFromLocal = function (objectType, id) {
        var _this = this;
        return new Promise(function (resolve) {
            // try local storage
            var key = (id) ? objectType + ':' + id : objectType;
            _this.loadItemFromLocal(objectType, id).then(function (item) {
                var str_item = JSON.stringify(item);
                _this.bytesInStorage -= str_item.length;
                _this.storage.set('bytesInStorage', _this.bytesInStorage);
                _this.storage.remove(key).then(function (result) {
                    console.log('removed ' + key);
                    // remove from index
                    if (_this.index['all-' + objectType] && id) {
                        delete _this.index['all-' + objectType][id];
                    }
                    resolve(result);
                    //console.warn('TODO dbadaptor.removeItemFromLocal should actually remove data');
                    //resolve(true);
                });
            });
        });
    };
    DBAdaptorProvider.prototype.saveItemToLocal = function (objectType, id, item, doUpdateIndex) {
        var _this = this;
        if (doUpdateIndex === void 0) { doUpdateIndex = false; }
        return new Promise(function (resolve) {
            // try local storage
            var storage_key = (id) ? objectType + ':' + id : objectType;
            var str_item = JSON.stringify(item);
            //this.storage.get(storage_key).then(res => {
            //}, function(){
            //  this.bytesInStorage += str_item.length;
            //});
            _this.storage.set(storage_key, item).then(function (result) {
                _this.storage.set('bytesInStorage', _this.bytesInStorage);
                if (!_this.index['all-' + objectType]) {
                    _this.index['all-' + objectType] = {};
                }
                // add to index
                if (id) {
                    _this.index['all-' + objectType][id] = 1;
                }
                if (_this.isBatchMode && !doUpdateIndex) {
                    // in Batch Mode - indexes are updated at the end with an explicit call
                    // and then batchMode is turned off
                    resolve(result);
                }
                else {
                    // in Normal Mode - index is updated after every insertion (slower)
                    _this.updateIndexesForObjectType(objectType).then(function (res) {
                        resolve(result);
                    });
                }
            });
        });
    };
    //
    // object copy, generate id
    //
    DBAdaptorProvider.prototype.generateLocalId = function (obj) {
        obj.Id = 'local-' + Math.random();
    };
    DBAdaptorProvider.prototype.cloneObject = function (obj, userId) {
        var clone = JSON.parse(JSON.stringify(obj));
        var nowDate = new Date().toISOString();
        clone.LocalClonedFromId = clone.Id;
        clone.CreatedById = userId;
        clone.CreatedDate = nowDate;
        clone.LastModifiedById = userId;
        clone.LastModifiedDate = nowDate;
        clone.Id = 'local-' + Math.random();
        return clone;
    };
    //
    //
    //
    //
    //
    // INDEXING LOCAL DATA
    //
    //
    DBAdaptorProvider.prototype.loadIndexes = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var ps = [];
            for (var indexName in _this.index) {
                if (!_this.index.hasOwnProperty(indexName))
                    continue;
                ps.push(_this.loadIndex(indexName));
            }
            Promise.all(ps).then(function (result) {
                resolve(result);
            });
        });
    };
    DBAdaptorProvider.prototype.saveIndexes = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var ps = [];
            for (var indexName in _this.index) {
                if (!_this.index.hasOwnProperty(indexName))
                    continue;
                ps.push(_this.saveIndex(indexName));
            }
            Promise.all(ps).then(function (result) {
                resolve(result);
            });
        });
    };
    DBAdaptorProvider.prototype.loadIndex = function (indexName) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.loadItemFromLocal('index', indexName).then(function (res) {
                if (res) {
                    _this.index[indexName] = res;
                }
                resolve(_this.index[indexName]);
            });
        });
    };
    DBAdaptorProvider.prototype.saveIndex = function (indexName) {
        var _this = this;
        var indexData = this.index[indexName];
        return new Promise(function (resolve) {
            if (!indexData) {
                resolve(true);
                return;
            }
            _this.saveItemToLocal('index', indexName, indexData).then(function (res) {
                resolve(res);
            });
        });
    };
    DBAdaptorProvider.prototype.updateIndexes = function () {
        var _this = this;
        var ps = [];
        return new Promise(function (resolve) {
            ps.push(_this.updateIndexesForObjectType('opportunity'));
            ps.push(_this.updateIndexesForObjectType('quote'));
            ps.push(_this.updateIndexesForObjectType('quoteline'));
            Promise.all(ps).then(function (res) {
                resolve();
            });
        });
    };
    DBAdaptorProvider.prototype.updateCatalogIndexes = function () {
        var _this = this;
        var ps = [];
        return new Promise(function (resolve) {
            ps.push(_this.updateIndexesForObjectType('catalog'));
            //ps.push(this.updateIndexesForObjectType('catalog'));
            //ps.push(this.updateIndexesForObjectType('catalog'));
            Promise.all(ps).then(function (res) {
                resolve();
            });
        });
    };
    DBAdaptorProvider.prototype.updateIndexesForObjectType = function (objectType) {
        var _this = this;
        var ps = [];
        var sortConfig = this.sortIndexConfig[objectType];
        var keywordConfig = this.keywordIndexConfig[objectType];
        var column;
        return new Promise(function (resolve) {
            if (sortConfig) {
                for (var i = 0; i < sortConfig.length; i++) {
                    column = sortConfig[i];
                    ps.push(_this.updateSortIndex('sort-' + objectType + '-' + column, objectType, column));
                }
            }
            if (keywordConfig) {
                ps.push(_this.updateKeywordIndex('keyword-' + objectType, objectType, keywordConfig));
            }
            ps.push(_this.saveIndex('all-' + objectType));
            Promise.all(ps).then(function (res) {
                resolve();
            });
        });
    };
    // update index sorted by objectType.column
    DBAdaptorProvider.prototype.updateSortIndex = function (indexName, objectType, column) {
        var _this = this;
        return new Promise(function (resolve) {
            // for each object of objectType
            var index = [];
            var itemId, item;
            var ps = [];
            var all = _this.index['all-' + objectType];
            //for(var i=0; i < all.length; i++){
            for (var key in all) {
                // load object from Storage / SQLite
                //ps.push(this.storage.get('retrieve-'+objectType+':'+itemId));
                ps.push(_this.storage.get(objectType + ':' + key));
                // sort by value
            }
            Promise.all(ps).then(function (items) {
                for (var j = 0; j < items.length; j++) {
                    if (items[j] != null) {
                        // if item is available locally
                        index.push({ id: items[j].Id, value: items[j][column] });
                    }
                    else {
                        // must retrieve item from server
                        // TODO
                    }
                }
                // sort index by value descending
                index.sort(function (a, b) {
                    return a.value - b.value;
                });
                //this.index[indexName] = index;
                if (!_this.index[indexName]) {
                    _this.index[indexName] = {};
                }
                for (var key in index) {
                    _this.index[indexName][index[key].id] = 1;
                }
                // save INDEX to Storage/SQLite
                //this.storage.set('index-'+indexName, index);
                _this.saveIndex(indexName).then(function (res) {
                    resolve(true);
                });
            });
        });
    };
    // update index listing all keywords found in paths in objectType, as defined by
    // columns[0], columns[1], ...
    //
    // columns: ['name', 'person.dob']
    //
    // DATA:
    //  { id: 'id0', name: "WordA", person: { dob: "DOB-a"} },
    //  { id: 'id1', name: "WordB" },
    //  { id: 'id2', name: "WordA", person: { dob: "DOB-a"} },
    //  { id: 'id3', name: "WordA", person: { dob: "DOB-c"} },
    //
    // INDEX:
    // {
    //    "WordA": ['id0', 'id2', 'id3'],
    //    "WordB": ['id2']
    //    "DOB-a": ['id0', 'id2']
    //    "DOB-c": ['id3']
    //    ...
    // }
    //
    DBAdaptorProvider.prototype.updateKeywordIndex = function (indexName, objectType, columns) {
        var _this = this;
        return new Promise(function (resolve) {
            // find deep path in object
            // deepFind(item, "PrimaryQuoteId.Id")
            function deepFind(obj, path) {
                if (!path)
                    return null;
                var paths = path.split('.'), current = obj, i;
                for (i = 0; i < paths.length; ++i) {
                    if (current[paths[i]] == undefined) {
                        return undefined;
                    }
                    else {
                        current = current[paths[i]];
                    }
                }
                return current;
            }
            // for each object of objectType
            var index = [];
            var itemId, item, columnVal, toks, keyword;
            var ps = [];
            var all = _this.index['all-' + objectType];
            //for(var i=0; i < all.length; i++){
            for (var key in all) {
                // load object from Storage / SQLite
                ps.push(_this.storage.get(objectType + ':' + key));
                //ps.push(this.storage.get(key));
            }
            Promise.all(ps).then(function (items) {
                for (var j = 0; j < items.length; j++) {
                    if (items[j] != null) {
                        // if item is available locally
                        item = items[j];
                        for (var k = 0; k < columns.length; k++) {
                            columnVal = deepFind(item, columns[k]);
                            if (columnVal) {
                                toks = columnVal.toString().split(' ');
                                for (var t = 0; t < toks.length; t++) {
                                    keyword = toks[t].toLowerCase();
                                    if (!index[keyword]) {
                                        index[keyword] = [];
                                    }
                                    index[keyword].push(item.Id);
                                }
                            }
                        }
                    }
                    else {
                        // must retrieve item from server
                        // TODO
                    }
                }
                _this.index[indexName] = index;
                // save INDEX to Storage/SQLite
                //this.storage.set('index-'+indexName, index);
                _this.saveIndex(indexName).then(function (res) {
                    resolve(true);
                });
            });
        });
    };
    //
    //
    // SAMPLE DATA
    //
    //
    DBAdaptorProvider.prototype.loadSampleData = function () {
        return Promise.all([]);
    };
    DBAdaptorProvider.prototype.loadSampleQuery = function (fileName, objectType) {
        var _this = this;
        var item;
        var index = this.index['all-' + objectType];
        return new Promise(function (resolve) {
            _this.http.get('assets/poc_data/' + fileName)
                .subscribe(function (res) {
                var data = res.json();
                var ps = [];
                _this.bytesInStorage += res._body.length;
                for (var i = 0; i < data.records.length; i++) {
                    item = data.records[i];
                    if (index.indexOf(item.Id) == -1) {
                        index.push(item.Id);
                    }
                    // save record to Storage / SQLite
                    //this.storage.set(objectType+':'+item.Id, item);
                    ps.push(_this.saveItemToLocal(objectType, item.Id, item));
                }
                // save INDEX to Storage/SQLite
                //this.storage.set('index-all-'+objectType, index);
                resolve(index);
            });
        });
    };
    DBAdaptorProvider.prototype.loadSampleItem = function (fileName, objectType) {
        var _this = this;
        var key;
        return new Promise(function (resolve) {
            _this.http.get('assets/poc_data/' + fileName)
                .subscribe(function (res) {
                var data = res.json();
                _this.bytesInStorage += res._body.length;
                if (data.Id) {
                    data.id = data.Id;
                }
                //key = (data.id)? objectType+':'+data.id: objectType;
                // save record to SQLite
                //this.storage.set(key, data);
                _this.saveItemToLocal(objectType, data.id, data).then(function (res) {
                    resolve();
                });
            });
        });
    };
    return DBAdaptorProvider;
}());
DBAdaptorProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Platform,
        Storage,
        SQLite,
        Http])
], DBAdaptorProvider);
export { DBAdaptorProvider };
//# sourceMappingURL=db-adaptor.js.map