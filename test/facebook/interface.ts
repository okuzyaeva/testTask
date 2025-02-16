import {SinonStub} from 'sinon';
import {
	AvailablePagesResponse,
	FacebookDebugTokenResponse,
} from '../../src/facebookClient/interface';


interface DestinationsWithAccess {
	id: string;
	accessToken: string;
}

export interface MockVideoPublicationParams {
	destinationsWithAccess: DestinationsWithAccess[];
	downloadPaths: string[];
	message?: string;
	authInfo: FacebookAuthInfo;
	pages?: AvailablePagesResponse;
}

export interface FacebookAuthInfo {
	token: string;
	userId: string;
	debugTokenResponse: FacebookDebugTokenResponse;
}

export interface MockVideoPublicationResult {
	downloadStub: SinonStub;
	transferStub: SinonStub;
}
