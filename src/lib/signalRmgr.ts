import * as signalR from '@microsoft/signalr';
import { API_ROUTES } from './api';

export type ConnectionClosedHandler = () => void;
export type PlayerCameOnlineHandler = (player: PlayerInfo) => void;
export type PlayerWentOfflineHandler = PlayerCameOnlineHandler;
export type CardsHaveBeenDealtHandler = ConnectionClosedHandler;
export type CardHasBeenPlayedHandler = (playCardResponse: PlayCardCallbackInfo) => void;
export type ScoresUpdatedHandler = () => void;
export interface PlayerInfo {
	id: number;
	name: string;
}
export interface PlayCardCallbackInfo {
	playerId: number;
	playerName: string;
	playedCard: string;
	roundIsOver: boolean;
	gameIsOver: boolean;
	nextTurnPlayerId: number;
}

export class SignalRManager {
	// ref: https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client?view=aspnetcore-9.0&tabs=visual-studio-code#install-the-signalr-client-package

	private static _signalRManager: SignalRManager;

	private _playerUid: string;
	private _signalRConnection: signalR.HubConnection;
	private _connectionClosedHandlers: ConnectionClosedHandler[] = [];
	private _playerCameOnlineHandler: PlayerCameOnlineHandler[] = [];
	private _playerWentOfflineHandler: PlayerWentOfflineHandler[] = [];
	private _cardsHaveBeenDealtHandler: CardsHaveBeenDealtHandler[] = [];
	private _cardHasBeenPlayedHandler: CardHasBeenPlayedHandler[] = [];
	private _scoresHaveBeenUpdatedHandler: ScoresUpdatedHandler[] = [];

	public static async GetInstance(playerUid: string): Promise<SignalRManager> {
		if (!SignalRManager._signalRManager) {
			SignalRManager._signalRManager = new SignalRManager(playerUid);
		} else if (SignalRManager._signalRManager._playerUid != playerUid) {
			await SignalRManager._signalRManager.ConnectionClose(); // close existing connection for another connection as a different playerUID

			SignalRManager._signalRManager = new SignalRManager(playerUid);
		}
		return SignalRManager._signalRManager;
	}

	private constructor(playerUid: string) {
		this._playerUid = playerUid;
		this._signalRConnection = new signalR.HubConnectionBuilder()
			.withUrl(API_ROUTES.GameHub)
			.configureLogging(signalR.LogLevel.Information)
			.build();

		// callbacks to class-methods have to be bound to 'this', similar to C++
		this._signalRConnection.on('CardsHaveBeenDealt', () => {
			this.CardsHaveBeenDealt();
		});
		this._signalRConnection.on('PlayerCameOnline', (x) => this.PlayerCameOnline(x));
		this._signalRConnection.on('PlayerWentOffline', (x) => this.PlayerWentOffline(x));
		this._signalRConnection.on('CardHasBeenPlayed', (x) => this.CardHasBeenPlayed(x));
		this._signalRConnection.on('ScoresUpdated', () => this.ScoresUpdated());
		this._signalRConnection.onclose(() => this.ConnectionClosed());
	}

	public AddPlayerCameOnlineHandler(playerCameOnlineHandler: PlayerCameOnlineHandler) {
		this._playerCameOnlineHandler.push(playerCameOnlineHandler);
	}

	public AddPlayerWentOfflineHandler(playerWentOfflineHandler: PlayerWentOfflineHandler) {
		this._playerWentOfflineHandler.push(playerWentOfflineHandler);
	}

	public AddCardsHaveBeenDealtHandler(cardsHaveBeenDealtHandler: CardsHaveBeenDealtHandler) {
		this._cardsHaveBeenDealtHandler.push(cardsHaveBeenDealtHandler);
	}

	public AddConnectionClosedHandler(connectionClosedHandler: ConnectionClosedHandler) {
		this._connectionClosedHandlers.push(connectionClosedHandler);
	}

	public AddCardHasBeenPlayedHandler(cardHasBeenPlayedHandler: CardHasBeenPlayedHandler) {
		this._cardHasBeenPlayedHandler.push(cardHasBeenPlayedHandler);
	}

	public AddScoresUpdatedHandler(scoreUpdatedHandler: ScoresUpdatedHandler) {
		this._scoresHaveBeenUpdatedHandler.push(scoreUpdatedHandler);
	}

	public async ConnectionStart() {
		try {
			await this._signalRConnection.start();
			console.log('SignalR Connected.');
		} catch (err) {
			console.log(err);
			setTimeout(this.ConnectionStart, 5000);
		}
	}

	public async ConnectionClose() {
		try {
			await this._signalRConnection.stop();
			console.log('SignalR connection closed successfully.');
		} catch (err) {
			console.log(err);
		}
	}

	public async JoinHub() {
		try {
			await this._signalRConnection.invoke('EnablePushNotifications', {
				PlayerUid: this._playerUid
			});
		} catch (err) {
			console.error(err);
		}
	}

	//#region Callbacks from server. Note that the method names need to be an exact match with those present in server's IGameClient interface

	private async ConnectionClosed() {
		this._connectionClosedHandlers.forEach((subscriber) => {
			subscriber();
		});
	}

	private async CardsHaveBeenDealt() {
		//console.log('cards have apparently been dealt..');
		this._cardsHaveBeenDealtHandler.forEach((subscriber) => {
			subscriber();
		});
	}

	private async PlayerCameOnline(player: PlayerInfo) {
		//console.log('player came online: ' + player.name + ' (Id:' + player.id + ')');
		this._playerCameOnlineHandler.forEach((subscriber) => {
			subscriber(player);
		});
	}

	private async PlayerWentOffline(player: PlayerInfo) {
		//console.log('player went offline: ' + player.name + ' (Id:' + player.id + ')');
		this._playerWentOfflineHandler.forEach((subscriber) => {
			subscriber(player);
		});
	}

	private async CardHasBeenPlayed(playedCardInfo: PlayCardCallbackInfo) {
		this._cardHasBeenPlayedHandler.forEach((subscriber) => {
			subscriber(playedCardInfo);
		});
	}

	private async ScoresUpdated() {
		this._scoresHaveBeenUpdatedHandler.forEach((subscriber) => {
			subscriber();
		});
	}
	//#endregion Callbacks end
}
