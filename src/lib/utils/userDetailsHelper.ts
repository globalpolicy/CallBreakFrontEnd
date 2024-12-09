import { API_ROUTES } from '$lib/api';
import { accessToken } from '$lib/stores/tokenstore';

export async function getUserDetails(accessToken_: string, refreshToken_: string) {
	const response = await fetch(API_ROUTES.GetUserDetails, {
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + accessToken_,
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	if (!response.ok) {
		console.log('Access token invalid!');
		console.log('Requesting a refresh of the access token..');

		// request a new access token using refresh token
		const newAccessTokenResponse = await refreshAccessToken(accessToken_, refreshToken_);

		const newAccessToken = await newAccessTokenResponse.json();

		//debugger;
		if (!newAccessToken.success) {
			console.log(`${newAccessToken.data}`);
			throw new Error('Could not obtain new access token!');
		} else {
			//debugger;

			accessToken.set(newAccessToken.data);

			console.log('Obtained new access token:');
			console.log(newAccessToken.data);
			return await getUserDetails(newAccessToken.data, refreshToken_);
		}
	} else {
		// user details obtained for the current access token

		const retval = await response.json();
		console.log(retval);
		return retval.data;
	}
}

async function refreshAccessToken(accessToken_: string, refreshToken_: string) {
	const response = await fetch(API_ROUTES.RefreshAccessToken, {
		method: 'POST',
		body: JSON.stringify({
			accessToken: accessToken_,
			refreshToken: refreshToken_
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (!response.ok) throw new Error('Could not refresh access token!');
	else {
		return response;
	}
}
