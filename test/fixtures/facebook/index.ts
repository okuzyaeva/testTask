import {
	StartUploadingResponse,
	TransferVideoChunkResponse,
} from '../../../src/facebookClient/interface';
import {randomNumber, randomString} from '../../utils/random';


export const getStartUploadingVideoResponse = (videoSize: number): StartUploadingResponse => ({
	video_id: randomNumber().toString(),
	start_offset: '0',
	end_offset: videoSize.toString(),
	upload_session_id: randomString(15),
});

export const getTransferVideoResponse = async (videoSize: number): Promise<TransferVideoChunkResponse> => ({
	newStartOffset: videoSize,
});