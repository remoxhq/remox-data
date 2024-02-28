export function compareEnumerable<T>(
    db_array: T[],
    request_array: T[],
    compare_field: keyof T
): boolean {
    if (!Array.isArray(db_array) || !Array.isArray(request_array))
        return false;

    if (db_array.length !== request_array.length) return false;

    // Create a map of objects by their comparison field value for efficient lookup
    const db_map: any = {}; // Type of map based on compare_field type
    for (const obj of db_array) {
        db_map[obj[compare_field]] = obj;
    }

    // Efficiently check for equality based on the comparison field
    for (const obj of request_array) {
        if (!db_map.hasOwnProperty(obj[compare_field])) {
            return false; // Element not found in the database array
        }
    }

    return true; // All elements matched
}