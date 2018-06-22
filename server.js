/*
Welcome to the pits of hell with this shitty code
Don't start whining cause the code is bad, this is
the best of the best shit code, if you want it to
be better, make it better yourself, was fun making
the bot while it lasted, im pretty sure there's a
memory leak in the server shit, but idc honestly.
    -ItzNop
*/
 
const apiai = require('apiai')
const app = apiai("04b5878f87e54a11a8c0c023bf948546");
const Discord = require("discord.js");
const botconfig = require("./colors.json");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");
const sf = require("snekfetch")
const msg = require("./msg.js")
let coins = require("./coins.json");
let xp = require("./xp.json");
let purple = botconfig.purple;
client.colors = require("./servers.json");
let rainbow = 0;

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    setInterval(function() {
        client.user.setPresence({ game: { name: config.prefix + "help | " + client.guilds.size + " Servers! | " + client.users.size + " Users!", url: "https://www.twitch.tv/ProESTGaming", type: 1 } });
    //Update every 60 seconds
    }, 60 * 1000);


    client.setInterval(() =>{

        rainbow += 0.2;
        if(rainbow >= 1) rainbow = 0;

        //try to change role color for every server
        for(let i in client.colors) {
            let guildId = client.colors[i].guild;
            let guild = client.guilds.get(guildId);


            //if server gets deleted or bot gets kicked, remove from config
            if(guild === null) {
                delete client.colors[i];
                fs.writeFile("./servers.json", JSON.stringify(client.colors, null, 4), err => {
                    if(err) throw err;
                });
                return;
            }

            
            //try to change the role
            try{
                guild.roles.find("name", client.colors[i].role).setColor(hslToRgb(rainbow, 1, 0.5))
                .catch(err => { 
                    delete client.colors[i]
                    fs.writeFile("./servers.json", JSON.stringify(client.colors, null, 4), err => {
                        if(err) throw err;
                    });
                    return;
                });
            }catch(err){
                delete client.colors[i]
                fs.writeFile("./servers.json", JSON.stringify(client.colors, null, 4), err => {
                    if(err) throw err;
                });
                return;
            }
        }
        //Change it every 5 seconds
    }, 1 * 1000)
});

client.on("message", async message =>{


    //Does stuff and removes char length
    let command = message.content.split(" ")[0].slice(config.prefix.length);
    let args = message.content.split(" ").slice(1);
    //let mention = message.guild.member(message.mentions.users.first());


    if(!message.content.startsWith(config.prefix)) return;
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;


    if(command === "help")
        return msg.help(message);


    if(command === "ping")
        return msg.info(message, "Ping: `" + Math.round(client.ping) + "ms`");
     
    if(command === "say"){
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    msg.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    msg.channel.send(sayMessage);
    }
  if(command === "limpar") {
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
      if(!message.member.hasPermission("ADMINISTRATOR"))
            return msg.error(message, "You must have the **`ADMINISTRATOR`** permission!")
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Por-favor digite um numero de 2 a 100, que será o tanto de mensagens a serem deletetadas");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Não posso deletar por algum motivo: ${error}`));
  } 
  if(command === "ban"){ 
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("No can do pal!");
    if(args[0] == "help"){
      message.reply("Use: !ban <usario> <motivo>");
      return;
    }
    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return msg.error(message, "**`Mencione um usuario`**");
    let bReason = args.join(" ").slice(22);
    if(bUser.hasPermission("ADMINISTRATOR")) return message.channel.send("Esta pessoa pode ser banida");

    let banEmbed = new Discord.RichEmbed()
    .setDescription("~Ban~")
    .setColor("#bc0000")
    .addField("Usuario banido", `${bUser} with ID ${bUser.id}`)
    .addField("Banido por", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Banido em", message.channel)
    .addField("Data", message.createdAt)
    .addField("Motivo", bReason);

    let incidentchannel = message.guild.channels.find(`name`, "incidents");
    if(!incidentchannel) return message.channel.send("Can't find incidents channel.");

    message.guild.member(bUser).ban(bReason);
    incidentchannel.send(banEmbed); 
 }
    if(command === "rainbow") {
        let rainbowRole = args.join(" ");

        if(!message.member.hasPermission("ADMINISTRATOR"))
            return msg.error(message, "Você precisa ter permissão de **`ADMINISTRADOR`**")


        if(!message.guild.me.hasPermission("ADMINISTRATOR"))
            return msg.error(message, "Preciso ter permissão de **`ADMINISTRADOR`**")
        
            
        if(!message.member.guild.roles.find("name", rainbowRole))
            return msg.error(message, "Use: **`(role name)`**");


        if(message.member.guild.roles.find("name", rainbowRole).position >= message.guild.me.highestRole.position)
            return msg.error(message, "Meu cargo, precisa ser mais alto que o cargo mencionado.")


        msg.success(message, "As cores foram aplicadas **`" + rainbowRole + "`**")

        client.colors[message.guild.name] = {
            guild: message.guild.id,
            role: rainbowRole
        }

        

        fs.writeFile("./servers.json", JSON.stringify(client.colors, null, 4), err => {
            if(err) throw err;
        });
    }


    if(command === "cat") {
        sf.get("http://aws.random.cat/meow")
            .then(res => {
                msg.picture(message, res.body.file)
            })
    }
   
    
    if(command === "shibe") {
        sf.get("http://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true")
            .then(res => {
                msg.picture(message, res.body[0])
            })
    }
  


    if(command === "dog") {
        sf.get("http://random.dog/woof.json")
            .then(res => {
                msg.picture(message, res.body.url)
            })
    }
});

client.on("message", msg => {

    //let prefix = config.prefix;

    //if (!msg.content.startsWith(prefix)) return;
    // ignore if Author is a bot
    //if (msg.author.bot) return;

    //const request = app.textRequest(msg.content.slice(2), {
        sessionId: msg.author.id
    //});
    //request.on('response', function(response) {
      //  console.log(response);
        //var intent = response.result.metadata.intentName

        // Here you can make if statements to check if an intent it used
        // e.x 
        // if (intent == "yes") {
        //     msg.channel.send('no')
        // }
    });

    //request.on('error', function(error) {
    //    console.log(error);
    //});

    //request.end()

    //request.on('response', function(response) {
      //  let responseText = response.result.fulfillment.speech;
        //msg.channel.send(`${responseText}`);
    //});

    ///request.on('error', function(error) {
  //      console.log(error);
  //  });

//});
//rgb junk copy pasted from stackoverflow since i was too lazy to code it myself
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
client.login(config.token);