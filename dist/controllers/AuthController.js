"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _inversify = require("inversify");
const _types = require("../utils/types");
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
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let AuthController = class AuthController {
    async signIn(req, res) {
        await this.authService.signIn(req, res);
    }
    async updateRole(req, res) {
        await this.authService.udpateRole(req, res);
    }
    async getUserFavOrgs(req, res) {
        await this.authService.getUserByPublicKeyWithOrgs(req, res);
    }
    constructor(authService){
        _define_property(this, "authService", void 0);
        this.authService = authService;
    }
};
AuthController = _ts_decorate([
    (0, _inversify.injectable)(),
    _ts_param(0, (0, _inversify.inject)(_types.TYPES.IAuthService))
], AuthController);
