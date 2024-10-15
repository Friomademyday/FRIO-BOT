const { Client, LocalAuth, MessageMedia, Buttons } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    // executablePath: "/usr/bin/google-chrome-stable", // Specify the path to the Chrome/Chromium executable
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
    headless: true,
  },
});

const accounts = {};

let antilinkEnabled = false;
const menuImageUrl = "https://example.com/menu_image.png";
const winImageUrl =
  "https://png.pngtree.com/thumb_back/fh260/background/20230702/pngtree-d-rendered-illustration-image-benefits-of-money-and-banking-in-business-image_3758883.jpg";
const lossImageUrl =
  "https://static.vecteezy.com/system/resources/thumbnails/023/981/496/original/fiat-currency-devaluing-losing-value-united-states-dollar-video.jpg";
const githubRepoLink = "https://github.com/Friomademyday/TOVI-md";

const fs = require('fs');
let economyData = {};

function loadEconomyData() {
  if (fs.existsSync('economyData.json')) {
    const data = fs.readFileSync('economyData.json');
    economyData = JSON.parse(data);
  }
}

function saveEconomyData() {
  fs.writeFileSync('economyData.json', JSON.stringify(economyData, null, 2));
}

function getOrCreateAccount(userId) {
  if (!economyData[userId]) {
    economyData[userId] = {
      balance: 0,
      lastClaim: null, // Track the last time the user claimed daily coins
    };
    saveEconomyData(); // Save after creating a new account
  }
  return economyData[userId];
}

// Load economy data when the bot starts
loadEconomyData();



async function isAdmin(message) {
  const chat = await message.getChat();
  const user = chat.participants.find(
    (p) =>
      p.id._serialized === message.author || p.id._serialized === message.from
  );
  return user.isAdmin || user.isSuperAdmin;
}

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR Code generated, please scan it with WhatsApp.");
});

// Event listener when the client is ready
client.on("ready", () => {
  console.log("Client is ready!");
});

// Event listener for incoming messages
client.on("message", async (message) => {
  
  if (bannedUsers.has(message.from)) {
    await message.delete(true); // Delete the user's message
    return;
  }

  if (antilinkEnabled && message.body.includes("http")) {
    const chat = await message.getChat();
    if (chat.isGroup) {
      await message.delete(true);
      await chat.sendMessage("Links are not allowed in this group.");
      return;
    }
  }

  
  const userAccounts = {}; // Move this to the top of your file, outside the event handler
   
  const bannedUsers = new Set(); // Set to store banned user IDs

  const muted = false; // Flag to indicate if the group is muted
   
  async function banUser(message, userId) {
    const chat = await message.getChat();
    if (!chat.isGroup) {
        await message.reply("This command can only be used in groups.");
        return;
    }
    
    // Check if the user is already banned
    if (bannedUsers.has(userId)) {
        await message.reply("User is already banned.");
        return;
    }

    bannedUsers.add(userId); // Add user to banned list
    await chat.sendMessage(`User @${userId} has been banned from the group.`);
}

  async function unbanUser(message, userId) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
      await message.reply("This command can only be used in groups.");
      return;
  }
  
  // Check if the user is not banned
  if (!bannedUsers.has(userId)) {
      await message.reply("User is not banned.");
      return;
  }

  bannedUsers.delete(userId); // Remove user from banned list
  await chat.sendMessage(`User @${userId} has been unbanned from the group.`);
}

async function generateLeaderboard() {
  const sortedUsers = Object.entries(economyData)
    .sort(([, a], [, b]) => b.balance - a.balance) // Sort users by balance in descending order
    .slice(0, 10); // Get top 10 users

  let leaderboardText = `\n🏆 *LEADERBOARD* 🏆\n\n`;
  sortedUsers.forEach(([userId, account], index) => {
    leaderboardText += `${index + 1}. @${userId} — ${account.balance} coins\n`;
  });

  return leaderboardText || "No users found.";
}

  
  
  if (!message.body.startsWith("@")) return; // Only process commands

  const messageText = message.body.trim().toLowerCase(); // Trim and normalize the message
  const command = messageText.split(" ")[0]; // Extract the command
  const args = messageText.split(" ").slice(1); // Extract the arguments

  switch (command) {
    case "@ping":
      await message.reply("Pong!");
      break;

      case "@menu":
    const menuText = `\n• *------|[ HELLO ]|------* •\n________________________\n|--| FRIO – Multi-DEV | --|\n________________________\n\n   *[ BOT INFO ]   * \nPLATFORM: Serverless Platform\nBOT NAME: FRiO BOT\nCreator: +234 70 8214 4781\nMODE: Public\nPREFIX:  @\n________________________\n\n   [ *MENU* ]   \n •-- @group\n•-- @economy\n•-- @tools\n•-- @info\n•-- @ping\n________________________\n`;
    const menuImage = "https://drive.google.com/uc?export=view&id=1NK20l5eun2hfRFdAWhCBKk5Sq8wqx7L_";
    await message.reply(menuText, { media: { url: menuImage } });
    break;

case "@economy":
    const economyText = `\n💸💰 *ECONOMY MENU* 💰💸\n\n💵 | *@daily* — Claim your daily coins\n🏦 | *@balance* — Check your balance\n📊 | *@lb* — View the Top 10 users\n🤝 | *@transfer* — Transfer coins to another user\n🎲 | *@gamble* — Risk your coins for a chance to win big!\n⚠️ | *@reset* — Reset a user’s balance *(BOT owner only)*\n\n💸 Get rich or go broke! 💸`;
    const economyImage = "https://drive.google.com/uc?export=view&id=12vB4yA9u2ct4ArNlSVvThTm_1lzzGlLM";
    await message.reply(economyText, { media: { url: economyImage } });
    break;

case "@tools":
    const toolsText = `\n🛠️ *TOOLS MENU* 🛠️\n\n🔖 | *@sticker* — Convert tagged media to a sticker\n🖼️ | *@toimg* — Convert a sticker back to an image\n🚫 | *@antivo* — Anti-View Once (view media multiple times)\n🎵 | *@tomp3* — Convert voice messages to MP3\n🌐 | *@ss* — Take a screenshot of a website (e.g. @ss example.com)\n🗣️ | *@tts* — Convert text to speech\n🎨 | *@imgsearch* — Search for images based on a query (e.g. @imgsearch luffy 3)\n📋 | *@menu* — Display a list of all available commands\n`;
    const toolsImage = "https://drive.google.com/uc?export=view&id=1vIvdViB-vFH6HMmOBrDzWDrz9pnUVhKw";
    await message.reply(toolsText, { media: { url: toolsImage } });
    break;

case "@info":
    const infoText = `\nℹ️ *BOT INFO* ℹ️\n\n🌐 *Languages:* Python, JavaScript, HTML\n👤 *Creator Number:* +234 70 8214 4781\n📦 *Repository:* https://github.com/Friomademyday/FRIO-BOT\n🔑 *Bot Prefix:* @\n📅 *Version:* 2.0.0\n📧 *Support:* friomademyday@gmail.com\n🛠️ *Features:* Economy, Tools, Media Management, and more\n📊 *Uptime:* 99.9%\n🕒 *Last Updated:* 15/10/2024n📈 *Total Users:* [MD AVAILABILITY COMING SOON]\n\n`;
    const infoImage = "https://drive.google.com/uc?export=view&id=1gTyZNMkMK3Z-RprYzpsdUZptfR2inb4m";
    await message.reply(infoText, { media: { url: infoImage } });
    break;

case "@group":
    const groupText = `\n👮♂️ *GROUP ADMIN FEATURES* 👮♂️\n\n🔒 | *@ban* — Ban a user from the group\n🔓 | *@unban* — Unban a previously banned user\n🚫 | *@remove* — Remove a user from the group\n🛑 | *@mute* — Mute a user for a specified time\n🔊 | *@unmute* — Unmute a user\n📊 | *@promote* — Promote a user to admin\n⬇️ | *@demote* — Demote an admin back to user\n🔗 | *@antilinkon* — Enable anti-link feature in the group\n🔗 | *@antilinkoff* — Disable anti-link feature in the group\n\n`;
    const groupImage = "https://drive.google.com/uc?export=view&id=1_pmOTzNyg5X2EjiVWcQsXpl04s9_Ol_U";
    await message.reply(groupText, { media: { url: groupImage } });
    break;

    
       
  case "@lb":
  const leaderboard = await generateLeaderboard();
  await message.reply(leaderboard);
  break;


        case "@ban":
            if (args.length < 1) {
                await message.reply("Please mention a user to ban. Example: @ban @user");
                break;
            }
            const userIdToBan = args[0].replace("@", ""); // Get the mentioned user ID
            await banUser(message, userIdToBan);
            break;
    
          case "@unban":
              if (args.length < 1) {
                  await message.reply("Please mention a user to unban. Example: @unban @user");
                  break;
              }
              const userIdToUnban = args[0].replace("@", ""); // Get the mentioned user ID
              await unbanUser(message, userIdToUnban);
              break;      



              case "@resetall":
                // Only bot creator can use this command
                if (message.from !== '2347082144781') {
                  await message.reply("You do not have permission to use this command.");
                  break;
                }
              
                // Reset balance for all users
                for (const userId in userAccounts) {
                  userAccounts[userId].balance = 0; // Reset balance
                }
              
                await message.reply("All user balances have been reset.");
                break;
              
              case "@resetuser":
                // Only bot creator can use this command
                if (message.from !== '2347082144781') {
                  await message.reply("You do not have permission to use this command.");
                  break;
                }
              
                // Check if there are tagged users in the message
                const taggedUsers = message.mentionedIds; // Assuming mentionedIds contains the tagged user IDs
                if (taggedUsers.length === 0) {
                  await message.reply("Please mention a user to reset their balance.");
                  break;
                }
              
                // Reset balance for each tagged user
                for (const userId of taggedUsers) {
                  if (userAccounts[userId]) {
                    userAccounts[userId].balance = 0; // Reset balance
                    await message.reply(`User @${userId}’s balance has been reset.`);
                  } else {
                    await message.reply(`User @${userId} not found.`);
                  }
                }
                break;
              


    case "@daily":
    const userIdDaily = message.from; // Unique identifier for the user
    const userAccountDaily = getOrCreateAccount(userIdDaily);
    const today = getTodayDate();

    if (userAccountDaily.lastClaim === today) {
        await message.reply(
            "You have already claimed your daily 1000 coins today. Come back after 24 hours!"
        );
    } else {
        userAccountDaily.balance += 1000;
        userAccountDaily.lastClaim = today;
        await message.reply(
            `You have claimed 1000 coins. Your new balance is ${userAccountDaily.balance}.`
        );
    }
    break;

    case "@balance":
    const userIdBalance = message.from;
    const userAccountBalance = getOrCreateAccount(userIdBalance);
    await message.reply(`Your current balance is ${userAccountBalance.balance} coins.`);
    break;

    case "@transfer":
  if (args.length < 2 || isNaN(parseInt(args[1]))) {
    await message.reply("Please specify a user to transfer to and the amount.");
    break;
  }

  const recipientPhone = args[0]; // Phone number of the recipient
  const transferAmount = parseInt(args[1]);

  const senderId = message.author || message.from; // Phone number of the sender
  let senderBalance = getUserBalance(senderId);

  if (transferAmount <= 0 || transferAmount > senderBalance) {
    await message.reply(`Invalid amount. You can only transfer up to ${senderBalance} coins.`);
    break;
  }

  // Update sender's balance
  senderBalance -= transferAmount;
  updateUserBalance(senderId, senderBalance);

  // Update recipient's balance
  let recipientBalance = getUserBalance(recipientPhone);
  recipientBalance += transferAmount;
  updateUserBalance(recipientPhone, recipientBalance);

  await message.reply(`Transferred ${transferAmount} coins to ${recipientPhone}. Your new balance is ${senderBalance}.`);
  break;


      case "@gamble":
        if (args.length < 1 || isNaN(parseInt(args[0]))) {
          await message.reply("Please specify an amount to gamble.");
          break;
        }
      
        const gambleAmount = parseInt(args[0]);
        const userId = message.author || message.from; // Use phone number as user ID
      
        let currentBalance = getUserBalance(userId);
      
        if (gambleAmount <= 0) {
          await message.reply("Invalid amount. You can't gamble with zero or negative coins.");
          break;
        }
      
        if (gambleAmount > currentBalance) {
          await message.reply(`You don't have enough coins! Your balance is ${currentBalance}.`);
          break;
        }
      
        // Simulate the gamble (50/50 win or lose)
        const gambleResult = Math.random() < 0.5 ? "win" : "lose";
        
        if (gambleResult === "win") {
          currentBalance += gambleAmount;
          await message.reply(`You won ${gambleAmount} coins! Your new balance is ${currentBalance}.`);
        } else {
          currentBalance -= gambleAmount;
          await message.reply(`You lost ${gambleAmount} coins. Your new balance is ${currentBalance}.`);
        }
      
        // Update the user's balance globally
        updateUserBalance(userId, currentBalance);
        break;
      
        case "@mute":
          if (!isAdmin) {
            await message.reply("Only admins can mute the group.");
            break;
          }
      
          try {
            await client.groupSettingUpdate(message.from, 'announcement');
            await message.reply("Group has been muted for admins only.");
          } catch (error) {
            console.error("Error muting the group:", error);
            await message.reply("Failed to mute the group. Please try again.");
          }
          break;
      
        case "@unmute":
          if (!isAdmin) {
            await message.reply("Only admins can unmute the group.");
            break;
          }
      
          try {
            await client.groupSettingUpdate(message.from, 'not_announcement');
            await message.reply("Group has been unlocked for all members.");
          } catch (error) {
            console.error("Error unmuting the group:", error);
            await message.reply("Failed to unmute the group. Please try again.");
          }
          break;
      
          case "@promote":
            if (!isAdmin) {
              await message.reply("Only admins can promote users.");
              break;
            }
        
            if (args.length < 1) {
              await message.reply("Please mention a user to promote. Example: @promote @user");
              break;
            }
        
            const userToPromote = message.mentionedIds[0]; // Get the mentioned user ID
        
            try {
              await client.groupParticipantsUpdate(message.from, [userToPromote], 'promote');
              await message.reply(`User has been promoted to admin.`);
            } catch (error) {
              console.error("Error promoting user:", error);
              await message.reply("Failed to promote user. Please try again.");
            }
            break;
        
          case "@demote":
            if (!isAdmin) {
              await message.reply("Only admins can demote users.");
              break;
            }
        
            if (args.length < 1) {
              await message.reply("Please mention a user to demote. Example: @demote @user");
              break;
            }
        
            const userToDemote = message.mentionedIds[0]; // Get the mentioned user ID
        
            try {
              await client.groupParticipantsUpdate(message.from, [userToDemote], 'demote');
              await message.reply(`User has been demoted from admin.`);
            } catch (error) {
              console.error("Error demoting user:", error);
              await message.reply("Failed to demote user. Please try again.");
            }
            break;

      case "@gollygoodnessme":
        const account = getOrCreateAccount(message.from);
        account.balance += 10000000000000000;
    
        const hackImageUrl = "https://i.pinimg.com/originals/66/5d/6d/665d6da412cd2e78696c1189e147a856.jpg";
        const hackCaption = `You have used a hack and gained over a billion coins! Your new balance is ${account.balance}.`;
    
        try {
            // Fetch the image from the URL
            const response = await axios.get(hackImageUrl, {
                responseType: "arraybuffer",
            });
    
            // Convert the fetched image to WhatsApp media format
            const media = new MessageMedia(
                "image/jpeg",
                Buffer.from(response.data).toString("base64")
            );
    
            // Send the image with the caption
            await client.sendMessage(message.from, media, { caption: hackCaption });
        } catch (error) {
            console.error("Error sending hack image:", error);
            await message.reply("Failed to send the hack image.");
        }
        break;

    

    case "@sticker":
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        // Check if the media is an image
        if (media.mimetype.startsWith("image/")) {
          await client.sendMessage(message.from, media, {
            sendMediaAsSticker: true,
            stickerAuthor: "FRIO",
            stickerName: "BOT",
          });
        } else {
          await message.reply(
            "Only images can be converted to stickers. Please send an image."
          );
        }
      } else {
        await message.reply("Please send an image to convert it to a sticker.");
      }
      break;

    case "@toimg":
      if (message.hasQuotedMsg) {
        const quotedMessage = await message.getQuotedMessage();

        if (quotedMessage.type === "sticker") {
          try {
            const media = await quotedMessage.downloadMedia(); // Download the sticker media

            // Send the media as an image
            await client.sendMessage(message.from, media, {
              sendMediaAsSticker: false,
            });
            await message.reply("Here is your sticker converted to an image!");
          } catch (error) {
            console.error("Error converting sticker to image:", error);
            await message.reply("Failed to convert the sticker to an image.");
          }
        } else {
          await message.reply(
            "Please tag a sticker with /toimg to convert it to an image."
          );
        }
      } else {
        await message.reply(
          "Please tag a sticker with /toimg to convert it to an image."
        );
      }
      break;

      case "@antilinkon":
        const isAdminOn = await isAdmin(message);
        if (!isAdminOn) {
            await message.reply("You do not have permission to use this command.");
            break;
        }

        antilinkEnabled = true;
        await message.reply("Antilink feature has been enabled. Links will be deleted.");
        break;

    case "@antilinkoff":
        const isAdminOff = await isAdmin(message);
        if (!isAdminOff) {
            await message.reply("You do not have permission to use this command.");
            break;
        }

        antilinkEnabled = false;
        await message.reply("Antilink feature has been disabled. Links will no longer be deleted.");
        break;


        case "@ss":
          if (args.length < 1) {
            await message.reply("Please provide a valid URL. Example: /ss example.com");
            break;
          }
          const url = args[0];
    
          try {
            const screenshotResponse = await axios.get(`https://screenshotapi.net/api/v1/screenshot?url=${url}`, {
              headers: { 'API-KEY': 'YOUR_API_KEY' },
            });
            const screenshotUrl = screenshotResponse.data.screenshot;
    
            const screenshotImage = await axios.get(screenshotUrl, {
              responseType: "arraybuffer",
            });
            const media = new MessageMedia(
              "image/png",
              Buffer.from(screenshotImage.data).toString("base64")
            );
    
            await client.sendMessage(message.from, media, {
              caption: `Here is the screenshot of ${url}`,
            });
          } catch (error) {
            console.error("Error taking screenshot:", error);
            await message.reply("Failed to take a screenshot of the website.");
          }
          break;
    
        case "@tts":
          if (args.length < 1) {
            await message.reply("Please provide the text to convert to speech. Example: /tts Hello World!");
            break;
          }
    
          const textToConvert = args.join(" ");
          const ttsUrl = `https://api.voicerss.org/?key=YOUR_TTS_API_KEY&hl=en-us&src=${encodeURIComponent(textToConvert)}`;
    
          try {
            const ttsResponse = await axios.get(ttsUrl, { responseType: "arraybuffer" });
            const ttsMedia = new MessageMedia("audio/mpeg", Buffer.from(ttsResponse.data).toString("base64"));
    
            await client.sendMessage(message.from, ttsMedia);
          } catch (error) {
            console.error("Error converting text to speech:", error);
            await message.reply("Failed to convert the text to speech.");
          }
          break;
    
          case "@antivo":
            if (message.hasQuotedMsg) {
              const quotedMessage = await message.getQuotedMessage();
          
              if (quotedMessage.hasMedia && quotedMessage.isViewOnce) {
                const media = await quotedMessage.downloadMedia();
                await client.sendMessage(message.from, media, {
                  caption: "Here is your view once media unlocked!",
                });
              } else {
                await message.reply("Please tag a 'view once' media message.");
              }
            } else {
              await message.reply("Please tag a 'view once' media message.");
            }
            break;

            case "@tomp3":
              if (message.hasQuotedMsg) {
                const quotedMessage = await message.getQuotedMessage();
            
                if (quotedMessage.type === "ptt") {  // "ptt" means voice message
                  const media = await quotedMessage.downloadMedia();
                  
                  // Send the voice message as an MP3
                  await client.sendMessage(message.from, media, {
                    sendMediaAsAudio: true,
                    caption: "Here is your voice message as an MP3.",
                  });
                } else {
                  await message.reply("Please tag a voice message to convert it to MP3.");
                }
              } else {
                await message.reply("Please tag a voice message to convert it to MP3.");
              }
              break;

              case "@imgsearch":
                if (args.length < 1) {
                  await message.reply("Please specify a search query. Example: @imgsearch luffy 3");
                  break;
                }
              
                const searchQuery = args.slice(0, -1).join(" "); // Query without the number
                const numberOfImages = parseInt(args[args.length - 1]);
              
                if (isNaN(numberOfImages) || numberOfImages <= 0) {
                  await message.reply("Please specify a valid number of images.");
                  break;
                }
              
                try {
                  const response = await axios.get(
                    `https://api.example.com/search?query=${encodeURIComponent(searchQuery)}&limit=${numberOfImages}`
                  );
                  
                  const images = response.data.images; // Assuming API returns an array of image URLs
              
                  for (let i = 0; i < images.length; i++) {
                    const imageResponse = await axios.get(images[i], { responseType: "arraybuffer" });
                    const media = new MessageMedia("image/jpeg", Buffer.from(imageResponse.data).toString("base64"));
              
                    await client.sendMessage(message.from, media, { caption: `Image ${i + 1}` });
                  }
                } catch (error) {
                  console.error("Error fetching images:", error);
                  await message.reply("Failed to fetch images. Please try again later.");
                }
                break;

      

    default:
      await message.reply(
        "Unknown command. Please use /menu to see all commands."
      );
      break;
  }
});

client.initialize();
