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
bot.initAsUser(config.username, config.password).then((isConnected) => {
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
        testLobby.sendPlainTextMessage("BOT SCFR v0.1 CONNECTED :smirk:");

        let commands = new SpectrumCommands();
        commands.setPrefix("!scfr");

        var spam = false;
        var sondages = [];
        let emoSondage = [":grinning:", ':grimacing:', ':joy:', ':smiley:', ':heart_eyes:', ':stuck_out_tounge:', ':sunglasses:', ':scream:', ':flushed:'];

        let randomFrom = (arr: Array<any>) => arr[Math.floor(Math.random() * arr.length)];
        let sSpam = (v: boolean) => spam = v;

        commands.addCommand("bonjour", "bonjour", (message: receivedTextMessage, lobby: SpectrumLobby) => {
            if (spam) return;
            sSpam(true);
            let greetings = ["Coucou", "Salutations", "Hello", "Plop", "Wesh", "Yop", "Hey", "Bizour"];
            lobby.sendPlainTextMessage(randomFrom(greetings) + " " + message.member.displayname + " !").then(() => sSpam(false));
        }, "Vous souhaite le bonjour");

        commands.addCommand("SCFR", "scfr|site", (message: receivedTextMessage, lobby: SpectrumLobby) => {
            sSpam(true);
            let greetings = ["Vous en reprendrez bien un petit peu ?", "La cmmunauté francophone", "Toute Star Citizen, en français", "Les franco-stellaires !"];
            lobby.sendTextMessageWithEmbed(randomFrom(greetings), "https://starcitizen.fr").then(() => sSpam(false));
        }, "Lien vers starcitizen.fr");

        commands.addCommand("Forum", "forum", (message: receivedTextMessage, lobby: SpectrumLobby) => {
            if (spam) return;
            sSpam(true);

            let greetings = ["Un espace de discussion francophone", "Le forum de starcitizen.fr"];
            lobby.sendTextMessageWithEmbed(randomFrom(greetings), "https://starcitizen.fr/forum").then(() => sSpam(false));
        }, "Lien vers le forum sc.fr");

        commands.addCommand("Ambassade", "ambassade|orgs|annuaire", (message: receivedTextMessage, lobby: SpectrumLobby) => {
            if (spam) return;
            sSpam(true);
            lobby.sendTextMessageWithEmbed("La présentation de toutes les organisations francophones !", "https://starcitizen.fr/Forum/viewforum.php?f=29").then(() => sSpam(false));
        },
            "Lien vers l'annuaire de guildes");

        commands.addCommand("Organisation Aléatoire", "randomOrg", (message: receivedTextMessage, lobby: SpectrumLobby) => {
            if (spam) return;
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
                if (data.status != "200") { sSpam(false); return false; }
                else {
                    let t = data.body.topic;
                    lobby.sendTextMessageWithEmbed(randomFrom(greetings), "https://starcitizen.fr/Forum/viewtopic.php?f=29&t=" + t).then(() => sSpam(false));
                }
            });

        }, "Affiche un lien vers une organisation francophone aléatoire !");


        commands.addCommand("Ajouter un sondage", "sondage add ([a-zA-Z0-9]*) (.*)\? (.*)$", (message: receivedTextMessage, lobby: SpectrumLobby, match) => {
            if (match[1] && match[1].length > 0) {
                if (!(match[2] && match[2].length > 0)) return lobby.sendPlainTextMessage("Merci d'indiquer votre question et de verifier qu'elle finit par un '?'.");
                if (!(match[3] && match[3].length > 0) || match[3].indexOf(',') === -1) return lobby.sendPlainTextMessage("Merci de proposer au moins deux réponses séparés par une virgule.");

                var text = match[2] + "? \n [" + match[1] + "] Sondage de " + message.member.displayname + "\n";
                let ass = match[3].split(',');

                var answC = [];
                var emojis = [];
                for (var d = 0; d < ass.length; d++) {
                    text += "   -> " + emoSondage[d] + " " + ass[d]+"\n";
                    answC[d] = 0;
                    emojis[d] = emoSondage[d];
                }
                lobby.sendPlainTextMessage(text).then((sondageMessage) => {

                    let curSondage = {
                        name: match[1],
                        q: match[2] + "?",
                        aNames: ass,
                        a: answC,
                        aEmojis: emojis,
                        message: sondageMessage,
                    };

                    sondages.push(curSondage);
                    let curSondageIndex = sondages.length - 1;

                    sondageMessage.onReaction((reac) => {
                        let i = curSondage.aEmojis.findIndex((emo) => emo === reac.reaction.reaction_type);
                        if(i === -1) return false;

                        if(reac.type == "reaction.remove") sondages[curSondageIndex].a[i]--;
                        else if(reac.type == "reaction.add") sondages[curSondageIndex].a[i]++;
                        console.log("REAAAAAAAACTED");

                        console.log(sondages[curSondageIndex].a);
                    });

                });



            }
            else lobby.sendPlainTextMessage("Merci de donner un nom à votre sondage.");
        }, "");

        commands.addCommand("Manuel", "man|help|commands", (message: receivedTextMessage, lobby: SpectrumLobby) => {
            let str = "Liste des commandes disponibles : \n";
            commands.getCommandList().forEach((command: aSpectrumCommand) => {
                str += " - " + command.name + " \n" + "!scfr " + command.shortCode + "\n  " + command.manual + "\n\n";
            });

            lobby.sendPlainTextMessage(str).then(() => sSpam(false));
        },
            "Affiche cette page d'aide.");

    });

});