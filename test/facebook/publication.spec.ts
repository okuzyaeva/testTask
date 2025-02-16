
import {Communicator} from '@{ourInternalLibrary}/communicator';
import config from 'config';
import {getServiceToken} from '../../utils/auth';
import {Micros} from '../../../src/enums/services';
import {
    getAvailablePages,
    getPublicationBody,
} from '../fixtures/facebook';
import {
    mockVideoPublicationPostByDestination,   // <-- the most important import, everything else you can just ignore
    validateToken,
} from './utils';

import db from '../../../src/db';
import {Formats, Socials} from '../../../src/enums/socials';
import {
    getVideoProducerMessage,
    getVideoProducerPath,
} from '../../fixtures/publication';
import {handler as amqpHandler} from '../../../src/services/queueService/downloadingQueues/listener';
import {createJob, checkJobStatus} from '../../utils/publication';
import {JobStatus} from '../../../src/db/models/publicationJobsRepository/enum';

describe('Facebook posting API', () => {
    const apiClient = new Communicator({
        baseURL: config.url,
    });
    context('successful posting publication to facebook', () => {
        it('with video content', async () => {
            const userId = db.getNewObjectId();
            const token = await getServiceToken({service: Micros.isoapp, userId: userId.toHexString()});
            const pages = getAvailablePages(10);
            const publicationBody = getPublicationBody({pages, format: Formats.mp4});
            const producerJobId = db.getNewObjectId().toString();

            const downloadId = await createJob({
                jobId: producerJobId,
                token,
                body: publicationBody,
            });

            // process async success amqp message
            const authInfo = await validateToken(userId.toHexString(), Socials.facebook);
            const downloadPath = getVideoProducerPath();
            const stubs = mockVideoPublicationPostByDestination({
				authInfo,
				pages,
				downloadPaths: [downloadPath],
				message: publicationBody.postDetails.message,
				destinationsWithAccess: pages.data.map((destination) => ({
					accessToken: destination.access_token,
					id: destination.id,
				})),
			});

			const message = getVideoProducerMessage({jobId: producerJobId, downloadPaths: [downloadPath]});

			await amqpHandler(message);

			await checkJobStatus({token, downloadId, expectedStatus: JobStatus.publishingCompleted});

			stubs.downloadStub.restore();
			stubs.transferStub.restore();
		});
    });
});