import { config } from './config/config';
import { Spectrum } from '../spectrum-bot/';
import { SpectrumUser } from '../spectrum-bot/src/Spectrum/components/user.component';
import { SpectrumCommands } from '../spectrum-bot/src/Spectrum/services/commands.service';
import { receivedTextMessage } from '../spectrum-bot/src/Spectrum/interfaces/receivedTextMessage.interface';
import { SpectrumLobby } from '../spectrum-bot/src/Spectrum/components/lobby.component';
import { Lobby } from '../spectrum-bot/src/Spectrum/interfaces/lobby.interface';
import { aSpectrumCommand } from '../spectrum-bot/src/Spectrum/interfaces/command.interface';

const popsicle = require('popsicle');

var bot = new Spectrum();

// Init the bot as user (you need to declare a config)
bot.initAsUser(config.username, config.password).then( (isConnected) => {
    let state = bot.getState();

    // Wait for internal state to be ready
    state.whenReady().then(() => {

        // Get a community
        let global = state.getCommunityByName("Sibylla");
        // Get a lobby in that community
        let testLobby = global.getLobbyByName("leadership");

        // Get events from Lobby
        testLobby.subscribe();
        // Send a nice text
        testLobby.sendPlainTextMessage("BOT SCFR v0.1 CONNECTED");

        let commands = new SpectrumCommands();
        commands.setPrefix("!scfr");

        var spam = false;

        let randomFrom = (arr:Array<any>) => arr[Math.floor(Math.random() * arr.length)];
        let sSpam = (v:boolean) => spam = v;

        commands.addCommand("bonjour", "bonjour", (message:receivedTextMessage, lobby:SpectrumLobby) => {
            if(spam) return;
            sSpam(true);
            let greetings = ["Coucou", "Salutations", "Hello", "Plop", "Wesh", "Yop", "Hey", "Bizour"];
            lobby.sendPlainTextMessage(randomFrom(greetings)+" "+message.member.displayname+" !").then(() => sSpam(false));
        },"Vous souhaite le bonjour");

        commands.addCommand("SCFR", "scfr|site", (message:receivedTextMessage, lobby:SpectrumLobby) => {
            sSpam(true);
            let greetings = ["Vous en reprendrez bien un petit peu ?", "La cmmunauté francophone", "Toute Star Citizen, en français", "Les franco-stellaires !" ];
            lobby.sendTextMessageWithEmbed(randomFrom(greetings),"https://starcitizen.fr").then(() => sSpam(false));
        }, "Lien vers starcitizen.fr");

        commands.addCommand("Forum", "forum", (message:receivedTextMessage, lobby:SpectrumLobby) => {
            if(spam) return;
            sSpam(true);

            let greetings = ["Un espace de discussion francophone", "Le forum de starcitizen.fr" ];
            lobby.sendTextMessageWithEmbed(randomFrom(greetings),"https://starcitizen.fr/forum").then(() => sSpam(false));
        }, "Lien vers le forum sc.fr");

        commands.addCommand("Ambassade", "ambassade|orgs|annuaire", (message:receivedTextMessage, lobby:SpectrumLobby) => {
            if(spam) return;
            sSpam(true);
            lobby.sendTextMessageWithEmbed("La présentation de toutes les organisations francophones !","https://starcitizen.fr/Forum/viewforum.php?f=29").then(() => sSpam(false));
        }, 
        "Lien vers l'annuaire de guildes");

        commands.addCommand("Organisation Aléatoire", "randomOrg", (message:receivedTextMessage, lobby:SpectrumLobby) => {
            if(spam) return;
            sSpam(true);

            let greetings = [
                "De loin la meilleure org francophone !",
                "Des mecs géniaux !",
                "10/10 IGN.fr",
                "Franchement, je serais humain je les aurais déjà rejoins.",
                "Incroyables, Fantastiques.",
                "Une guilde comme on en fait plus."
            ];


            popsicle.get("https://starcitizen.fr/wp-json/Hub/Guilds/Random").use(popsicle.plugins.parse('json')).then((data) => {
                if(data.status != "200") {sSpam(false);return false;}
                else {
                    let t = data.body.topic;
                    lobby.sendTextMessageWithEmbed(randomFrom(greetings),"https://starcitizen.fr/Forum/viewtopic.php?f=29&t="+t).then(() => sSpam(false));
                }
            });

        }, "Affiche un lien vers une organisation francophone aléatoire !");

        commands.addCommand("Manuel", "man|help|commands", (message:receivedTextMessage, lobby:SpectrumLobby) => {
            let str = "Liste des commandes disponibles : \n";
            commands.getCommandList().forEach( (command:aSpectrumCommand) => {
                str += " - "+command.name+" \n"+"!scfr "+command.shortCode+"\n  "+command.manual+"\n\n";
            });

            lobby.sendPlainTextMessage(str).then(() => sSpam(false));
        }, 
        "Affiche cette page d'aide.");

    });
    
});