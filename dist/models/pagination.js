"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Pagination", {
    enumerable: true,
    get: function() {
        return Pagination;
    }
});
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Pagination {
    constructor(items, totalCount, pageIndex = 0, pageSize = 20){
        _define_property(this, "items", void 0);
        _define_property(this, "pageSize", void 0);
        _define_property(this, "pageIndex", void 0);
        _define_property(this, "totalPages", void 0);
        _define_property(this, "totalCount", void 0);
        this.items = items;
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        this.totalPages = Math.ceil(totalCount / this.pageSize);
        this.totalCount = totalCount;
    }
}
