import {Readable} from 'stream';

export interface AWSDownloadIterator {
	chunk: Readable;
	range: [start: number, finish: number];
}

export interface DownloadFileByChunksResponse {
	fileSize: number;
	downloadIterator: () => AsyncIterableIterator<AWSDownloadIterator>;
}
