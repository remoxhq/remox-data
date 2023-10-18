"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "fetchOrgs", {
    enumerable: true,
    get: function() {
        return fetchOrgs;
    }
});
const _covalent = require("../covalent");
const _firebasedb = require("../firebase-db");
const _fs = /*#__PURE__*/ _interop_require_wildcard(require("fs"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const fetchOrgs = async ()=>{
    try {
        const organizationCollection = 'organizations';
        const accountCollection = 'accounts';
        const querySnapshot = await (0, _firebasedb.getDocs)((0, _firebasedb.collection)(_firebasedb.db, organizationCollection));
        const list = {};
        await Promise.all(querySnapshot.docs.map(async (document)=>{
            const orgData = document.data();
            await Promise.all(Array.from(orgData.accounts).map(async (item)=>{
                const docRef = (0, _firebasedb.doc)(_firebasedb.db, accountCollection, item.id);
                const docSnap = await (0, _firebasedb.getDoc)(docRef);
                const accountData = docSnap.data();
                if (!list[orgData.name]) list[orgData.name] = {
                    wallets: [
                        {
                            address: accountData.address,
                            network: _covalent.covalentNetworks[accountData.blockchain]
                        }
                    ]
                };
                else list[orgData.name] = {
                    wallets: [
                        ...list[orgData.name].wallets,
                        {
                            address: accountData.address,
                            network: _covalent.covalentNetworks[accountData.blockchain]
                        }
                    ]
                };
            }));
        }));
        if (!list) throw new Error('No organizations found');
        const jsonString = JSON.stringify(list, null, 2);
        const filePath = './orgs.json';
        _fs.writeFileSync(filePath, jsonString, 'utf-8');
        return list;
    } catch (error) {
        throw new Error(error);
    }
};
