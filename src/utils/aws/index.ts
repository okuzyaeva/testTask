import AWS from 'aws-sdk';
import config from 'config';
import {URL} from 'url';
import {CustomError} from '../../errors';
import {defaultRange, minTimeout, retries} from './constants';
import {AWSDownloadIterator, DownloadFileByChunksResponse} from './interface';
import {asyncRetry} from '../asyncRetry';

const S3 = new AWS.S3({
    ...config.aws.credentials,
});

function createChunkDownloader(
    key: string,
    fileSize: number,
    chunkSize: number = defaultRange
): () => AsyncIterableIterator<AWSDownloadIterator> {
    let start = 0;
    return async function* chunkDownloader(): AsyncIterableIterator<AWSDownloadIterator> {
        while (start < fileSize) {
            const end = Math.min(fileSize, start + chunkSize);
            const downloadRange = `bytes=${start}-${end - 1}`;

            const result = await asyncRetry(
                async () =>
                    S3.getObject({
                        Bucket: config.aws.s3.bucket,
                        Key: key,
                        Range: downloadRange,
                    }).createReadStream(),
                {retries, minTimeout}
            );

            yield {chunk: result, range: [start, end]};
            start = end;
        }
    };
}

export async function downloadFileByChunks(path: string): Promise<DownloadFileByChunksResponse> {
    const key = new URL(path).pathname.slice(1);
    const {ContentLength: fileSize} = await S3.headObject({Bucket: config.aws.s3.bucket, Key: key}).promise();

    if (fileSize == null) {
        throw new CustomError('Can not get file size');
    }

    return {fileSize, downloadIterator: createChunkDownloader(key, fileSize)};
}