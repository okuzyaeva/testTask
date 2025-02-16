
import sinon from 'sinon';
import {
	mockDebugToken,
	mockStartUploadingVideo,
	mockFinishUploadingVideo,
} from '../mocks/facebook';
import {
	getStartUploadingVideoResponse,
	getTransferVideoResponse,
} from '../fixtures/facebook';
import {
	MockVideoPublicationParams,
	MockVideoPublicationResult,
} from './interface';
import * as awsHandler from '../../src/utils/aws/index';
import {facebookClient} from '../../src/facebookClient';
import {AWSDownloadIterator, DownloadFileByChunksResponse} from '../../src/utils/aws/interface';

function fakeDownloadIterator(fileSize: number): () => AsyncIterableIterator<AWSDownloadIterator> {
	let start = 0;
	return async function* chunkDownloader(): AsyncIterableIterator<AWSDownloadIterator> {
		while (start < fileSize) {
			yield {chunk: new PassThrough(), range: [start, fileSize]};
			start = fileSize;
		}
	};
}

async function fakeDownloadFileByChunksResponse(videoSize: number): Promise<DownloadFileByChunksResponse> {
	return {fileSize: videoSize, downloadIterator: fakeDownloadIterator(videoSize)};
}

export function mockVideoPublicationPostByDestination(params: MockVideoPublicationParams): MockVideoPublicationResult {
	const {destinationsWithAccess, message, authInfo, pages} = params;
	const videoSize = 1545;
	const startUploadingVideoResponse = getStartUploadingVideoResponse(videoSize);
	const transferVideoResponse = getTransferVideoResponse(videoSize);
	const downloadStub = sinon
		.stub(awsHandler, 'downloadFileByChunks')
		.returns(fakeDownloadFileByChunksResponse(videoSize));
	const transferStub = sinon.stub(facebookClient, 'transferVideo').returns(transferVideoResponse);

	for (const destinationWithAccess of destinationsWithAccess) {
		mockDebugToken({facebookToken: authInfo.token}, authInfo.debugTokenResponse);
		mockGetDestinations({
			token: authInfo.token,
			facebookUserId: authInfo.userId,
			pages,
		});
		mockStartUploadingVideo(
			{
				videoSize,
				accessToken: destinationWithAccess.accessToken,
				destinationId: destinationWithAccess.id,
			},
			startUploadingVideoResponse
		);
		mockFinishUploadingVideo({
			accessToken: destinationWithAccess.accessToken,
			destinationId: destinationWithAccess.id,
			uploadSessionId: startUploadingVideoResponse.upload_session_id,
			message,
		});
	}
	return {downloadStub, transferStub};
}