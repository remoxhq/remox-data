"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _inversify = require("inversify");
const _storage = require("@google-cloud/storage");
const _dotenv = require("dotenv");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
(0, _dotenv.config)();
class StorageManager {
    async uploadByteArray(file) {
        try {
            if (!file) return "";
            const { mimetype, buffer, originalname } = file;
            const bucketFile = this._storage.bucket(process.env.BUCKET_NAME).file(originalname);
            const stream = bucketFile.createWriteStream({
                metadata: {
                    contentType: mimetype || 'application/octet-stream'
                }
            });
            stream.write(Buffer.from(buffer));
            stream.end();
            await new Promise((resolve, reject)=>{
                stream.on('finish', resolve);
                stream.on('error', reject);
            });
            await bucketFile.makePublic();
            return `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${originalname}`;
        } catch (error) {
            throw error;
        }
    }
    constructor(){
        _define_property(this, "_storage", void 0);
        this._storage = new _storage.Storage({
            projectId: process.env.PROJECT_ID,
            keyFilename: process.env.STORAGE_KEY_FILE
        });
    }
}
StorageManager = _ts_decorate([
    (0, _inversify.injectable)()
], StorageManager);
const _default = StorageManager;
