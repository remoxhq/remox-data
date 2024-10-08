import { injectable } from "inversify";
import IStorageService from './IStorageService';
import { Storage } from '@google-cloud/storage';
import { config } from "dotenv";
config();

@injectable()
class StorageManager implements IStorageService {
    private readonly _storage: Storage;

    constructor() {
        this._storage = new Storage({
            projectId: process.env.PROJECT_ID,
            keyFilename: process.env.STORAGE_KEY_FILE_NAME,
        });
    }

    async uploadByteArray(file: any): Promise<string> {
        try {
            if (!file) return "";

            const { mimetype, buffer, originalname } = file;

            const bucketFile = this._storage.bucket(process.env.BUCKET_NAME!).file(originalname);

            const stream = bucketFile.createWriteStream({
                metadata: {
                    contentType: mimetype || 'application/octet-stream', // Set content type (optional)
                },
            });

            stream.write(Buffer.from(buffer));
            stream.end();

            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            await bucketFile.makePublic();

            return `https://storage.googleapis.com/${process.env.BUCKET_NAME!}/${originalname}`;
        } catch (error) {
            throw error;
        }
    }
}

export default StorageManager;