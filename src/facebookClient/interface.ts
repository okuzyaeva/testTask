import {Readable} from 'stream';
import {FacebookTokenType} from './enum';
import {AWSDownloadIterator} from '../utils/aws/interface';

export interface Paging {
	cursors: {
		after: string;
		before: string;
	};
}

export interface FacebookGranularScope {
	scope: string;
	target_ids?: string[];
}

export interface FacebookDebugTokenResponse {
	data: {
		app_id: string;
		type: 'USER';
		application: string;
		data_access_expires_at: number;
		expires_at: number;
		is_valid: boolean;
		issued_at: number;
		scopes: string[];
		granular_scopes: FacebookGranularScope[];
		user_id: string;
	};
}

export interface Picture {
	data: {
		url: string;
		height: 50;
		width: 50;
		is_silhouette: boolean;
	};
}

export interface Page {
	id: string;
	name: string;
	access_token: string;
	tasks: string[];
	picture?: Picture;
}

export interface AvailablePagesResponse {
	data: Page[];
	paging?: Paging;
}

interface PublicationPostParams {
	accessToken: string;
	destinationId: string;
	message?: string;
}

export interface PublicationPostWithVideoParams extends PublicationPostParams {
	videoSize: number;
	downloadIterator: () => AsyncIterableIterator<AWSDownloadIterator>;
}

export interface FacebookErrorResponse {
	error?: {
		message: string;
		type: string;
		code?: number;
		error_subcode?: number;
		fbtrace_id: string;
	};
}

export interface StartUploadingResponse {
	video_id: string;
	start_offset: string;
	end_offset: string;
	upload_session_id: string;
}

export interface TransferVideoResponse {
	start_offset: string;
	end_offset: string;
}

export interface FinishUploadingVideoResponse {
	success?: boolean;
}

export interface StartUploadingVideoResponse {
	videoId: string;
	endOffset: number;
	uploadSessionId: string;
}

interface UploadingParams {
	accessToken: string;
	destinationId: string;
}

export interface UploadVideoByChunksParams extends UploadingParams {
	message?: string;
	videoSize: number;
	downloadIterator: () => AsyncIterableIterator<AWSDownloadIterator>;
}

export interface StartUploadingVideoParams extends UploadingParams {
	videoSize?: number;
}

export interface TransferVideoChunk extends UploadingParams {
	uploadSessionId: string;
	startOffset: number;
	chunk: Readable;
}

export interface TransferVideoChunkResponse {
	newStartOffset: number;
}

export interface FinishUploadingVideoParams extends UploadingParams {
	uploadSessionId: string;
	message?: string;
}

export interface UploadVideoByChunksResponse extends FinishUploadingVideoResponse {
	videoId?: string;
}
