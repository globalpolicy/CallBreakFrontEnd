import { accessToken } from '$lib/stores/tokenstore';
import { GetRoomDetails } from '$lib/api';
import type { GetRoomDetailsResponseInfo } from '$lib/api';
import { get } from 'svelte/store';

// This function should load the active room for which this user is the admin
export function load(): { roomDetails: Promise<GetRoomDetailsResponseInfo> } {
	const roomDetails = GetRoomDetails(get(accessToken));
	return {
		roomDetails
	};
}
