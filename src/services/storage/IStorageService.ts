interface IStorageService {
    uploadByteArray(file: any): Promise<string>;
}

export default IStorageService;