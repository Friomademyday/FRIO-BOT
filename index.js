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

function getOrCreateAccount(user) {
  if (!accounts[user]) {
    accounts[user] = {
      balance: 0,
      lastClaim: null, // Track the last time the user claimed daily coins
    };
  }
  return accounts[user];
}

// Helper function to get today's date string
function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

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
  if (antilinkEnabled && message.body.includes("http")) {
    const chat = await message.getChat();
    if (chat.isGroup) {
      await message.delete(true);
      await chat.sendMessage("Links are not allowed in this group.");
      return;
    }
  }

  const userAccounts = {}; // This will store user data globally

function getOrCreateAccount(userId) {
    if (!userAccounts[userId]) {
        userAccounts[userId] = { balance: 0, lastClaim: null };
    }
    return userAccounts[userId];
}

  
  if (!message.body.startsWith("/")) return; // Only process commands

  const messageText = message.body.trim().toLowerCase(); // Trim and normalize the message
  const command = messageText.split(" ")[0]; // Extract the command
  const args = messageText.split(" ").slice(1); // Extract the arguments

  switch (command) {
    case "/ping":
      await message.reply("Pong!");
      break;

      case "/menu":
    const menuText = `*TOVI-md Version 1*\n\n🎉 *Welcome to TOVI-md!* 🎉\n\n*🛠️ GROUP COMMANDS* (Admin only)\n🔹 /antilink - Toggle antlink feature\n\n*💰 ECONOMY COMMANDS*\n🔹 /daily - Claim your daily coins\n🔹 /balance - Check your balance\n🔹 /lb - Check the Top 10 users\n🔹 /give - Transfer coins to another user\n🔹 /gamble - Gamble your coins\n🔹 /reset - Reset a user’s balance (BOT owner only)\n\n*📂 GITHUB & OWNER*\n🔹 /repo - Get the GitHub repository link\n🔹 /owner - Get information about the bot owner\n\n*✨ OTHERS*\n🔹 /sticker - Convert an image to a sticker\n🔹 /toimg - Convert a sticker to an image\n\n⚠️ *Important:* This bot was created for fun purposes, not to do everything an admin can literally do!\n\nPlease don’t misuse the economy feature. If you need any help with the bot, JOIN SUPPORT GROUP.\n\nhttps://chat.whatsapp.com/HLKi3Z5VJPg2H4eWMvW5Lu\n\n Let's keep the group enjoyable for everyone! 🤖✨`;

    await message.reply(menuText);
    break;


    

    case "/daily":
    const userIdDaily = message.from; // Unique identifier for the user
    const userAccountDaily = getOrCreateAccount(userIdDaily);
    const today = getTodayDate();

    if (userAccountDaily.lastClaim === today) {
        await message.reply(
            "You have already claimed your daily 1000 coins today. Come back tomorrow!"
        );
    } else {
        userAccountDaily.balance += 1000;
        userAccountDaily.lastClaim = today;
        await message.reply(
            `You have claimed 1000 coins. Your new balance is ${userAccountDaily.balance}.`
        );
    }
    break;

    case "/balance":
    const userIdBalance = message.from;
    const userAccountBalance = getOrCreateAccount(userIdBalance);
    await message.reply(`Your current balance is ${userAccountBalance.balance} coins.`);
    break;

    case "/give":
      if (args.length < 2) {
        await message.reply(
          "Please specify a user and amount. Example: /give @user 1000"
        );
        break;
      }

      const recipientId = args[0].replace("@", ""); // Get the mentioned user ID
      const amountToGive = parseInt(args[1]);

      if (isNaN(amountToGive) || amountToGive <= 0) {
        await message.reply("Please specify a valid amount.");
        break;
      }

      const senderAccount = getOrCreateAccount(message.from);
      if (senderAccount.balance < amountToGive) {
        await message.reply("You do not have enough coins.");
        break;
      }

      const recipientAccount = getOrCreateAccount(recipientId);
      senderAccount.balance -= amountToGive;
      recipientAccount.balance += amountToGive;

      await message.reply(
        `You have given ${amountToGive} coins to @${recipientId}. Your new balance is ${senderAccount.balance}.`
      );
      await client.sendMessage(
        recipientId + "@c.us",
        `You have received ${amountToGive} coins from @${message.from}. Your new balance is ${recipientAccount.balance}.`
      );
      break;

    case "/gamble":
      if (args.length < 1) {
        await message.reply(
          "Please specify an amount to gamble. Example: /gamble 1000"
        );
        break;
      }

      const gambleAmount = parseInt(args[0]);

      if (isNaN(gambleAmount) || gambleAmount <= 0) {
        await message.reply("Please specify a valid amount.");
        break;
      }

      const gambleAccount = getOrCreateAccount(message.from);
      if (gambleAccount.balance < gambleAmount) {
        await message.reply("You do not have enough coins to gamble.");
        break;
      }

      const gambleOutcome = Math.random();
      let resultMessage;
      let imageUrl;

      if (gambleOutcome < 0.5) {
        gambleAccount.balance -= gambleAmount;
        resultMessage = `You lost ${gambleAmount} coins. Your new balance is ${gambleAccount.balance}.`;
        imageUrl = lossImageUrl;
      } else {
        const winnings = gambleAmount * (Math.random() * 3 + 1); // Random multiplier between 1 and 4
        gambleAccount.balance += winnings;
        resultMessage = `Congratulations! You won ${winnings.toFixed(
          2
        )} coins. Your new balance is ${gambleAccount.balance}.`;
        imageUrl = winImageUrl;
      }

      try {
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        const media = new MessageMedia(
          "image/jpeg",
          Buffer.from(response.data).toString("base64")
        );

        await client.sendMessage(message.from, media, {
          caption: resultMessage,
        });
      } catch (error) {
        console.error("Error sending image:", error);
        await message.reply("Failed to send the result image.");
      }

      break;


      case "/toviandfrioandflixarethesamepersons":
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

    case "/repo":
      await message.reply(
        `Here is the GitHub repository link: ${githubRepoLink}`
      );
      break;

    case "/sticker":
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        // Check if the media is an image
        if (media.mimetype.startsWith("image/")) {
          await client.sendMessage(message.from, media, {
            sendMediaAsSticker: true,
            stickerAuthor: "TOVI-md",
            stickerName: "TOVI-md",
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

    case "/toimg":
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

      case "/antilinkon":
        const isAdminOn = await isAdmin(message);
        if (!isAdminOn) {
            await message.reply("You do not have permission to use this command.");
            break;
        }

        antilinkEnabled = true;
        await message.reply("Antilink feature has been enabled. Links will be deleted.");
        break;

    case "/antilinkoff":
        const isAdminOff = await isAdmin(message);
        if (!isAdminOff) {
            await message.reply("You do not have permission to use this command.");
            break;
        }

        antilinkEnabled = false;
        await message.reply("Antilink feature has been disabled. Links will no longer be deleted.");
        break;


    default:
      await message.reply(
        "Unknown command. Please use /menu to see all commands."
      );
      break;
  }
});

client.initialize();
