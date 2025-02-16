import nock from 'nock';
import config from 'config';
import {
	StartUploadingVideoParams,
	StartUploadingResponse,
	FacebookDebugTokenResponse,
	FinishUploadingVideoParams,
	TransferVideoResponse,
} from '../../../src/facebookClient/interface';
import {UploadPhaseStatus} from '../../../src/facebookClient/enum';

export function mockDebugToken(request: {facebookToken: string}, response: FacebookDebugTokenResponse): nock.Scope {
	const query = {
		input_token: request.facebookToken,
		access_token: `${config.facebook.appId}|${config.facebook.secret}`,
	};

	return nock(config.facebook.url).get('/debug_token').query(query).reply(200, response);
}

export function mockStartUploadingVideo(
	request: StartUploadingVideoParams,
	response: StartUploadingResponse
): nock.Scope {
	const query = {
		upload_phase: UploadPhaseStatus.start,
		access_token: request.accessToken,
		file_size: request.videoSize,
	};

	return nock(config.facebook.videoUrl).post(`/${request.destinationId}/videos`).query(query).reply(200, response);
}

export function mockTransferVideo(request: {destinationId: string}, response: TransferVideoResponse): nock.Scope {
	return nock(config.facebook.videoUrl).post(`/${request.destinationId}/videos`).reply(200, response);
}

export function mockFinishUploadingVideo(request: FinishUploadingVideoParams): nock.Scope {
	const query = {
		upload_phase: UploadPhaseStatus.finish,
		access_token: request.accessToken,
		upload_session_id: request.uploadSessionId,
		description: request.message,
	};

	return nock(config.facebook.videoUrl)
		.post(`/${request.destinationId}/videos`)
		.query(query)
		.reply(200, {success: true});
}