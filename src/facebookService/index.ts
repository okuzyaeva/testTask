import { facebookClient } from '../facebookClient';
import { Socials } from '../../enums/socials';
import { PostPublicationParams } from './interface';
import { CustomError } from '../../errors';
import { PublicationResult } from '../../db/models/publicationJobsRepository/interface';
import { imageFormats } from '../../constants/socials';
import { downloadFileByChunks } from '../utils/aws';
import { handleExpectedErrors } from '../utils/handlePublicationExpectedErrors';

async function safePostPublication(params: PostPublicationParams): Promise<PublicationResult> {
    const {destinationId, accessToken, downloadUrls, message, format} = params;

    if (!downloadUrls) {
        throw new CustomError('There is no urls for downloading media');
    }
    const metricOptions = {
        social: Socials.facebook,
        format,
    };

    if (imageFormats.includes(format)) {
        return handleExpectedErrors(
            /*
                logic for posting photos to facebook
            */
        );
    }
    const {fileSize: videoSize, downloadIterator} = await downloadFileByChunks(downloadUrls[0] as string);

    return handleExpectedErrors(
        facebookClient.publicationPostWithVideo.bind(facebookClient),
        {
            accessToken,
            destinationId,
            message,
            videoSize,
            downloadIterator,
        },
        metricOptions
    );
}