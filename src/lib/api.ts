const BASE_URL = 'https://immensely-outgoing-barnacle.ngrok-free.app';

export const API_ROUTES = {
	GoogleSignOn: `${BASE_URL}/api/auth/googlesignon`,
	GetUserDetails: `${BASE_URL}/api/auth/getuserdetails`,
	RefreshAccessToken: `${BASE_URL}/api/auth/refreshaccesstoken`,
	CreateRoom: `${BASE_URL}/api/room/createroom`,
	GetRoomDetails: `${BASE_URL}/api/room/getroomdetails`,
	JoinRoom: `${BASE_URL}/api/player/joinroom`,
	GetPlayerDetails: `${BASE_URL}/api/player/getplayerdetails`,
	GetRoomPlayers: `${BASE_URL}/api/room/getroomplayers`,
	DoesActiveGameExist: `${BASE_URL}/api/game/doesactivegameexist`,
	GetPlayersHandCounts: `${BASE_URL}/api/game/getplayershandcounts`,
	GetMyHand: `${BASE_URL}/api/game/getmyhand`,
	GetDiscardPile: `${BASE_URL}/api/game/getplayedcards`,
	StartNewGame: `${BASE_URL}/api/game/startgame`,
	GetLatestPlay: `${BASE_URL}/api/game/getlatestplay`,
	PlayCard: `${BASE_URL}/api/game/playcard`,
	GetScores: `${BASE_URL}/api/game/getscores`,
	DeclareScore: `${BASE_URL}/api/game/declarescore`,
	GetGameWiseScores: `${BASE_URL}/api/room/getgamewisescores`,
	SaveProfileInfo: `${BASE_URL}/api/auth/setprofileinfo`,

	GameHub: `${BASE_URL}/gamehub`
};

interface BaseJsonResponse<T> {
	success: boolean;
	data: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CreateRoomResponseInfo
	extends BaseJsonResponse<
		| {
				roomId: number;
				roomUid: string;
		  }
		| string
	> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetRoomDetailsResponseInfo
	extends BaseJsonResponse<{
		capacity: number;
		roomUid: string;
		players: [
			{
				joinedAt: string;
				playerName: string;
				playerUid: string;
			}
		];
	}> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JoinRoomResponseInfo
	extends BaseJsonResponse<{
		playerName: string;
		playerUid: string;
	}> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetPlayerDetailsInfo
	extends BaseJsonResponse<{
		playerId: number;
		joinedAt: string;
		playerName: string;
		playerUid: string;
		isRoomAdmin: boolean;
		roomInfoShort: {
			capacity: number;
			occupancy: number;
			roomUid: string;
		};
	}> {}

export type Player = {
	joinedAt: string;
	playerId: number;
	playerName: string;
	isOnline: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetRoomPlayersInfo extends BaseJsonResponse<{ players: Player[] }> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DoesActiveGameExistInfo extends BaseJsonResponse<boolean> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetPlayersHandCountsInfo extends BaseJsonResponse<Map<number, number>> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetMyHandInfo extends BaseJsonResponse<string> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetDiscardPileInfo
	extends BaseJsonResponse<
		Array<{
			playerId: number;
			card: string;
		}>
	> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StartNewGameInfo extends BaseJsonResponse<null> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetLatestPlayInfo
	extends BaseJsonResponse<{
		playerId: number;
		playerName: string;
		playedCard: string;
		roundIsOver: boolean;
		gameIsOver: boolean;
		nextTurnPlayerId: number;
	}> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlayCardResponseInfo extends GetLatestPlayInfo {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetScoresInfo
	extends BaseJsonResponse<
		Array<{
			declaredScore: number;
			playerId: number;
			playerName: string;
			actualScore: number;
		}>
	> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeclareScoreResponseInfo extends BaseJsonResponse<string> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetGameWiseScoresInfo
	extends BaseJsonResponse<
		Array<{
			gameId: number;
			gameScores: Array<{
				declaredScore: number;
				playerId: number;
				playerName: string;
				actualScore: number;
			}>;
		}>
	> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SetProfileInfoResponse extends BaseJsonResponse<null> {}

export async function SetProfileInfo(
	jwt: string,
	fullName: string,
	userName: string
): Promise<SetProfileInfoResponse> {
	const response = await fetch(API_ROUTES.SaveProfileInfo, {
		method: 'POST',
		body: JSON.stringify({
			fullName,
			userName
		}),
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + jwt,
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetGameWiseScores(roomUid: string): Promise<GetGameWiseScoresInfo> {
	const response = await fetch(API_ROUTES.GetGameWiseScores + `/${roomUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function DeclareScore(
	playerUid: string,
	declaredScore: number
): Promise<DeclareScoreResponseInfo> {
	const response = await fetch(API_ROUTES.DeclareScore, {
		method: 'POST',
		body: JSON.stringify({
			playerUid,
			predictedScore: declaredScore
		}),
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetScores(playerUid: string): Promise<GetScoresInfo> {
	const response = await fetch(API_ROUTES.GetScores + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function PlayCard(playerUid: string, cardName: string): Promise<PlayCardResponseInfo> {
	const response = await fetch(API_ROUTES.PlayCard, {
		method: 'POST',
		body: JSON.stringify({
			playerUid,
			card: cardName
		}),
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetLatestPlay(playerUid: string): Promise<GetLatestPlayInfo> {
	const response = await fetch(API_ROUTES.GetLatestPlay + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function StartNewGame(adminPlayerUid: string): Promise<StartNewGameInfo> {
	const response = await fetch(API_ROUTES.StartNewGame + `/${adminPlayerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetDiscardPile(playerUid: string): Promise<GetDiscardPileInfo> {
	const response = await fetch(API_ROUTES.GetDiscardPile + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();

	return json;
}

export async function GetMyHand(playerUid: string): Promise<GetMyHandInfo> {
	const response = await fetch(API_ROUTES.GetMyHand + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetPlayersHandCounts(playerUid: string): Promise<GetPlayersHandCountsInfo> {
	const response = await fetch(API_ROUTES.GetPlayersHandCounts + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();

	// convert the JSON object in json.data to Map<number,number>
	const data = new Map<number, number>();
	for (const entry of Object.entries(json.data)) {
		data.set(Number(entry[0]), Number(entry[1]));
	}
	// and assign it back to json.data
	json.data = data;

	return json;
}

export async function DoesActiveGameExist(playerUid: string): Promise<DoesActiveGameExistInfo> {
	const response = await fetch(API_ROUTES.DoesActiveGameExist + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function CreateRoom(
	jwt: string,
	numberOfPlayers: number
): Promise<CreateRoomResponseInfo> {
	const response = await fetch(API_ROUTES.CreateRoom, {
		method: 'POST',
		body: JSON.stringify(numberOfPlayers),
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + jwt,
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetRoomDetails(jwt: string): Promise<GetRoomDetailsResponseInfo> {
	const response = await fetch(API_ROUTES.GetRoomDetails, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + jwt,
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function JoinRoom(playerName: string, roomUid: string): Promise<JoinRoomResponseInfo> {
	const response = await fetch(API_ROUTES.JoinRoom, {
		method: 'POST',
		body: JSON.stringify({
			playerName: playerName,
			roomUid: roomUid
		}),
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetPlayerDetails(playerUid: string): Promise<GetPlayerDetailsInfo> {
	const response = await fetch(API_ROUTES.GetPlayerDetails + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}

export async function GetRoomPlayers(playerUid: string): Promise<GetRoomPlayersInfo> {
	const response = await fetch(API_ROUTES.GetRoomPlayers + `/${playerUid}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'ngrok-skip-browser-warning': 'dont matter'
		}
	});

	const json = await response.json();
	return json;
}
