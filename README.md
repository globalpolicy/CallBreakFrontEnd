# CallBrelte

Digital implementation of the popular card game 'CallBreak'

## Core features

There's no particular order to the list:

1. Multi-player online game with realtime interactions. Anywhere from 2 to 6 players.
2. Register using a Gmail account to become a user, create rooms and invite other players to the room.
3. No need to register to play; just enter the room UID to join the active game in the room.
4. The registered user who created the room is the room admin, and controls when to start new games.
5. Only one active game per room at one time. Starting a new game in the middle of an existing one deactivates it.
6. Ability to view the the scoreboard of a room's games.
7. Game states are persistent between browser sessions, so no worries if a player gets knocked offline. It'll still be there when they come back.
8. Only one active session permitted per player/user. Multiple browsers or devices for the same player or user, and the server notifications won't reach the duplicate clients.

## Core technologies used

1. Svelte 5 (nod in the name) for the front-end
2. ASP.NET Core WebApi in .net 8.0 for the back-end
3. SignalR
4. EFCore wigh npgsql

## Screenshots:

![image](https://github.com/user-attachments/assets/51ecc01d-d2b3-4c7b-a0ea-fe57387d6263)

![image](https://github.com/user-attachments/assets/817cd292-0f4e-4391-a07b-c09b73922fa0)

![image](https://github.com/user-attachments/assets/4b1366f5-a8b2-4448-8659-2c62ce1d386d)

![image](https://github.com/user-attachments/assets/d3d0557b-3d63-472b-af38-e71e810a44e0)

## Credits:

The card images are from Chris Aguilar (webmaster@totalnonsense.com)

## More:

Full write-up at [c0dew0rth](https://c0dew0rth.blogspot.com/2024/12/callbreak-online-card-game.html)
> You can go to [Ajashra](https://callbreak.ajashra.com) to play now
