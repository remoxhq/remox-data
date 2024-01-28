"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "parseFormData", {
    enumerable: true,
    get: function() {
        return parseFormData;
    }
});
function parseFormData(body, field) {
    const parsedBody = {};
    const data = [];
    const bodyAsObject = body;
    Object.keys(body).map((key)=>{
        if (key.startsWith(`${field}[`)) {
            const index = key.split('[')[1].charAt(0);
            if (index) {
                const parsedIndex = parseInt(index);
                const item = {};
                for(const prop in bodyAsObject){
                    if (prop.startsWith(`${field}[${parsedIndex}].`)) {
                        const propName = prop.substring(`${field}[${parsedIndex}].`.length);
                        item[propName] = bodyAsObject[prop];
                    }
                }
                data[parsedIndex] = item;
            }
        } else parsedBody[key] = bodyAsObject[key];
    });
    parsedBody[field] = data;
    return parsedBody;
}
