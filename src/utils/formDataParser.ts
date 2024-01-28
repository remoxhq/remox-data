export function parseFormData<T>(body: any, field: string) {
    const parsedBody: any = {}
    const data: T[] = [];
    const bodyAsObject = body as { [key: string]: any };

    Object.keys(body).map((key) => {
        if (key.startsWith(`${field}[`)) {
            const index = key.split('[')[1].charAt(0)

            if (index) {
                const parsedIndex = parseInt(index);
                const item = {} as T;

                for (const prop in bodyAsObject) {
                    if (prop.startsWith(`${field}[${parsedIndex}].`)) {
                        const propName = prop.substring(`${field}[${parsedIndex}].`.length);
                        item[propName as keyof T] = bodyAsObject[prop];
                    }
                }
                data[parsedIndex] = item;
            }
        }
        else parsedBody[key] = bodyAsObject[key]
    })

    parsedBody[field] = data

    return parsedBody;
}