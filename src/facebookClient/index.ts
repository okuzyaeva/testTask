import {Communicator} from '@{ourInternalLibrary}/communicator';
import config from 'config';
import FormData from 'form-data';
import {
    PublicationPostWithVideoParams,
    FacebookErrorResponse,
    StartUploadingVideoParams,
    StartUploadingVideoResponse,
    StartUploadingResponse,
    FinishUploadingVideoParams,
    FinishUploadingVideoResponse,
    UploadVideoByChunksParams,
    UploadVideoByChunksResponse,
    TransferVideoChunk,
    TransferVideoChunkResponse,
    TransferVideoResponse,
} from './interface';
import {redirectPostUrl} from './constants';
import {FacebookError} from './error';
import {UploadPhaseStatus} from './enum';

export class FacebookClient {
    readonly facebookApi: Communicator;
    readonly facebookVideoApi: Communicator;

    constructor() {
        this.facebookApi = new Communicator({
            baseURL: config.facebook.url,
        });

        this.facebookVideoApi = new Communicator({
            baseURL: config.facebook.videoUrl,
        });
    }

    private async startUploadingVideo(params: StartUploadingVideoParams): Promise<StartUploadingVideoResponse> {
        const {videoSize, accessToken, destinationId} = params;

        const response = await this.facebookVideoApi.post<StartUploadingResponse>(`/${destinationId}/videos`, {
            query: {
                upload_phase: UploadPhaseStatus.start,
                access_token: accessToken,
                file_size: videoSize,
            },
        });

        if (!response.isOk) {
            const context = (response.body.responseData as FacebookErrorResponse)?.error;
            const status = response.statusCode;
            throw new FacebookError('Facebook failed to start posting video', {
                context,
                status,
                facebookErrorCode: context?.code,
            });
        }

        return {
            videoId: response.body.video_id,
            endOffset: Number(response.body.end_offset),
            uploadSessionId: response.body.upload_session_id,
        };
    }

    public async transferVideo(params: TransferVideoChunk): Promise<TransferVideoChunkResponse> {
        const {accessToken, destinationId, uploadSessionId, startOffset, chunk} = params;

        const formData = new FormData();
        formData.append('upload_phase', UploadPhaseStatus.transfer);
        formData.append('access_token', accessToken);
        formData.append('upload_session_id', uploadSessionId);
        formData.append('start_offset', startOffset.toString());
        formData.append('video_file_chunk', chunk, {filename: 'chunk'});

        const response = await this.facebookVideoApi.post<TransferVideoResponse>(`/${destinationId}/videos`, {
            headers: formData.getHeaders(),
            body: formData,
        });

        if (!response.isOk) {
            const context = (response.body.responseData as FacebookErrorResponse)?.error;
            const status = response.statusCode;
            throw new FacebookError('Facebook failed to transfer video by chunks', {
                context,
                status,
                facebookErrorCode: context?.code,
            });
        }

        return {
            newStartOffset: Number(response.body.end_offset),
        };
    }

    private async finishUploadingVideo(params: FinishUploadingVideoParams): Promise<FinishUploadingVideoResponse> {
        const {accessToken, destinationId, uploadSessionId, message} = params;

        const response = await this.facebookVideoApi.post<FinishUploadingVideoResponse>(`/${destinationId}/videos`, {
            query: {
                upload_phase: UploadPhaseStatus.finish,
                access_token: accessToken,
                upload_session_id: uploadSessionId,
                description: message ?? '',
            },
        });

        if (!response.isOk) {
            const context = (response.body.responseData as FacebookErrorResponse)?.error;
            const status = response.statusCode;
            throw new FacebookError('Facebook failed to finish posting video', {
                context,
                status,
                facebookErrorCode: context?.code,
            });
        }

        return {
            success: response.body.success,
        };
    }

    private async uploadVideoByChunks(params: UploadVideoByChunksParams): Promise<UploadVideoByChunksResponse> {
        const {accessToken, destinationId, message, videoSize, downloadIterator} = params;

        const startResult = await this.startUploadingVideo({
            videoSize,
            accessToken,
            destinationId,
        });

        for await (const {chunk, range} of downloadIterator()) {
            await this.transferVideo({
                accessToken,
                destinationId,
                uploadSessionId: startResult.uploadSessionId,
                startOffset: range[0],
                chunk,
            });
        }

        const finishResult = await this.finishUploadingVideo({
            accessToken,
            destinationId,
            uploadSessionId: startResult.uploadSessionId,
            message,
        });

        return {
            videoId: startResult.videoId,
            success: finishResult.success,
        };
    }

    public async publicationPostWithVideo(params: PublicationPostWithVideoParams): Promise<string> {
        const {accessToken, destinationId, message, videoSize, downloadIterator} = params;

        const {success, videoId} = await this.uploadVideoByChunks({
            accessToken,
            message,
            destinationId,
            videoSize,
            downloadIterator,
        });

        if (!success || !videoId) {
            throw new FacebookError('Facebook failed to upload video');
        }

        return `${redirectPostUrl}/${videoId}`;
    }
}

export const facebookClient = new FacebookClient();