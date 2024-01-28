export const parseFormData = (fieldArrayPrefix: string, req: any) => {
    let parsedBody: any = {}

    const dynamicFields = Object.keys(req.body);

    const resultArray = dynamicFields.reduce((acc: any[], field) => {
        if (!field.startsWith(`${fieldArrayPrefix}[`))
            parsedBody[field] = req.body[field]

        const index = /\[(\d+)\]/.exec(field)?.[1];

        if (index !== undefined) {
            const propertyName = field.replace(`[${index}]`, '');
            const resultObject = { [propertyName.split(".")[1]]: req.body[field] };
            acc[index as keyof {}] = { ...(acc[index as keyof {}] || {}), ...resultObject };
        }
        return acc;
    }, []);

    if (req.files) {
        Array.from(req.files).forEach((file: any) => {
            parsedBody[file.fieldname] = file
        })
    }
    parsedBody[fieldArrayPrefix] = resultArray;

    return parsedBody;
};
