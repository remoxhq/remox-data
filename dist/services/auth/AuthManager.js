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
const _dotenv = require("dotenv");
const _types = require("../../utils/types");
const _jsonwebtoken = /*#__PURE__*/ _interop_require_default(require("jsonwebtoken"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
(0, _dotenv.config)();
const usersCollection = "Users";
let AuthManager = class AuthManager {
    async signIn(req, res) {
        const publicKey = req.headers.address;
        if (!publicKey) return res.status(404).send(_types.ResponseMessage.OrganizationNotFound);
        const db = req.app.locals.db;
        const collection = db.collection(usersCollection);
        let existingUser = await collection.findOne({
            publicKey
        });
        if (!existingUser) {
            const newUser = {
                publicKey,
                role: _types.Roles.User,
                favoriteOrgs: []
            };
            const createdUser = await collection.insertOne(newUser);
            if (!createdUser.insertedId) return res.status(500).send(_types.ResponseMessage.UnknownServerError);
            existingUser = {
                ...newUser,
                _id: createdUser.insertedId
            };
        }
        const jwtToken = _jsonwebtoken.default.sign({
            role: existingUser.role,
            publicKey
        }, process.env.AUTH_SECRET_KEY);
        return res.status(200).send(jwtToken);
    }
    async udpateRole(req, res) {
        const publicKey = req.body.to;
        const newRole = req.body.role;
        if (!publicKey) return res.status(404).send(_types.ResponseMessage.OrganizationNotFound);
        const db = req.app.locals.db;
        const collection = db.collection(usersCollection);
        const result = await collection.updateOne({
            publicKey
        }, {
            $set: {
                role: newRole
            }
        });
        if (result.acknowledged) return res.json({
            message: _types.ResponseMessage.OrganizationUpdated
        });
        return res.status(404).json(_types.ResponseMessage.OrganizationNotFound);
    }
};
AuthManager = _ts_decorate([
    (0, _inversify.injectable)()
], AuthManager);
const _default = AuthManager;
