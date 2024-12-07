import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { ACCESSTOKEN, PLAYERDETAILS, REFRESHTOKEN } from '@/constants';

export const accessToken = writable(browser ? localStorage.getItem(ACCESSTOKEN) || '' : '');
export const refreshToken = writable(browser ? localStorage.getItem(REFRESHTOKEN) || '' : '');

export const playerDetails = writable(browser ? localStorage.getItem(PLAYERDETAILS) || '' : '');

accessToken.subscribe((newValue) => {
	if (browser) localStorage.setItem(ACCESSTOKEN, newValue ? newValue : '');
});

refreshToken.subscribe((newValue) => {
	if (browser) localStorage.setItem(REFRESHTOKEN, newValue ? newValue : '');
});



playerDetails.subscribe((newValue) => {
	if (browser) localStorage.setItem(PLAYERDETAILS, newValue ? newValue : '');
});
