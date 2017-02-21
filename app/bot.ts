import { config } from './config';
import { Spectrum } from '../spectrum-bot/';
import { SpectrumUser } from '../spectrum-bot/src/Spectrum/components/user.component';

var bot = new Spectrum();

// Init the bot as user (you need to declare a config)
bot.initAsUser(config.username, config.password).then( (isConnected) => {
    let state = bot.getState();

    // Wait for internal state to be ready
    state.whenReady().then(() => {

        // Get a community
        let global = state.getCommunityByName("Star Citizen");
        // Get a lobby in that community
        let testLobby = global.getLobbyByName("general");

        // Get events from Lobby
        testLobby.subscribe();
        // Send a nice text
        testLobby.sendPlainTextMessage("Hello this is a test !");

        // Look for an user
        bot.LookForUserByName("UserNameOrHandle").then((users:SpectrumUser[]) => {
            let user = users[0];

            if(user)
            // Get a private Lobby with the user
            user.getPrivateLobbyWithUser().then((pmLobby) => {
                // subscribe to messages there
                pmLobby.subscribe();

                // Wait till we get a message from that user
                user.onMessage((message) => {
                    // Answer back !
                    pmLobby.sendPlainTextMessage("I got your text !");
                });
            });

        });
    });
    
});