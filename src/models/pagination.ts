export class Pagination<T> {
    private items: T[];
    private pageSize: number;
    private pageIndex: number
    private totalPages: number
    private totalCount: number

    constructor(items: T[], totalCount: number, pageIndex: number = 1, pageSize: number = 20,) {
        this.items = items;
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        this.totalPages = Math.ceil(totalCount / this.pageSize);
        this.totalCount = totalCount
    }
}