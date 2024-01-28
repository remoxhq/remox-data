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
const parseFormData = (fieldArrayPrefix, req)=>{
    let parsedBody = {};
    const dynamicFields = Object.keys(req.body);
    const resultArray = dynamicFields.reduce((acc, field)=>{
        if (!field.startsWith(`${fieldArrayPrefix}[`)) parsedBody[field] = req.body[field];
        const index = /\[(\d+)\]/.exec(field)?.[1];
        if (index !== undefined) {
            const propertyName = field.replace(`[${index}]`, '');
            const resultObject = {
                [propertyName.split(".")[1]]: req.body[field]
            };
            acc[index] = {
                ...acc[index] || {},
                ...resultObject
            };
        }
        return acc;
    }, []);
    if (req.files) {
        Array.from(req.files).forEach((file)=>{
            parsedBody[file.fieldname] = file;
        });
    }
    parsedBody[fieldArrayPrefix] = resultArray;
    return parsedBody;
};
