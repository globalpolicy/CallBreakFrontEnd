import { accessToken, refreshToken, playerDetails } from '$lib/stores/tokenstore';
import { getUserDetails } from '$lib/utils/userDetailsHelper';
import { get } from 'svelte/store';

export const ssr = false;

export async function load({depends}) {
	depends("some:rootlayoutloadfunction");

	const accessTokenValue = get(accessToken);
	const refreshTokenValue = get(refreshToken);
	const playerDetailsValue = get(playerDetails);
//debugger;
	if (accessTokenValue && refreshTokenValue && accessTokenValue!='' && refreshTokenValue!='') {
		// if access and refresh tokens are present in localStorage, try to load user details
		try {
			const userDetails = await getUserDetails(accessTokenValue, refreshTokenValue);
			return {
				userMode: true, // this needs to be true for '/user' to load
				userDetails: userDetails
			};
		} catch (ex) {
			// need to re-signin
			return {
				userMode: false
			};
		}
	} else if (playerDetailsValue && playerDetailsValue!='') {
		// if player details are present in localStorage, return relevant info
		return {
			userMode: false,
			playerDetails: playerDetailsValue
		};
	}

	return {
		userMode: false,
		playerMode: false,
	};
}
