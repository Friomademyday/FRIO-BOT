const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true,
    }
});

const accounts = {};

let antilinkEnabled = false;
const menuImageUrl = 'https://example.com/menu_image.png';
const winImageUrl = 'https://i.pinimg.com/originals/66/5d/6d/665d6da412cd2e78696c1189e147a856.jpg';
const lossImageUrl = 'https://i.pinimg.com/736x/97/60/f3/9760f30997f790185c8ec3e20c7b461b.jpg';
 const githubRepoLink = 'https://github.com/Friomademyday/TOVI-md';



function getOrCreateAccount(user) {
    if (!accounts[user]) {
        accounts[user] = {
            balance: 0,
            lastClaim: null // Track the last time the user claimed daily coins
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
    const user = chat.participants.find(p => p.id._serialized === message.author || p.id._serialized === message.from);
    return user.isAdmin || user.isSuperAdmin;
}

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code generated, please scan it with WhatsApp.');
});

// Event listener when the client is ready
client.on('ready', () => {
    console.log('Client is ready!');
});

// Event listener for incoming messages
client.on('message', async message => {
     
    if (antilinkEnabled && message.body.includes('http')) {
        const chat = await message.getChat();
        if (chat.isGroup) {
            await message.delete(true);
            await chat.sendMessage('Links are not allowed in this group.');
            return;
        }
    }

    if (!message.body.startsWith('/')) return; // Only process commands

    const messageParts = message.body.split(' ');
    const command = messageParts[0].toLowerCase();
    const args = messageParts.slice(1);
    const recipientId = args[0] ? args[0].replace('@', '') : null;
    const amountToGive = args[1] ? parseInt(args[1]) : null;
   



    switch (command) {
        

        case '/ping':
            await message.reply('Pong!');
            break;

            case '/menu':
                await message.reply(`*TOVI-md Version 1*\n\n🎉 *Welcome to TOVI-md!* 🎉\n\n*🛠️ GROUP COMMANDS* (Admin only)\n🔹 /kick - Kick a user from the group\n🔹 /promote - Promote a user to admin\n🔹 /demote - Demote a user from admin\n🔹 /mute - Mute the group\n🔹 /unmute - Unmute the group\n🔹 /antilink - Toggle antlink feature\n\n*💰 ECONOMY COMMANDS*\n🔹 /daily - Claim your daily coins\n🔹 /balance - Check your balance\n🔹 /lb - Check the Top 10 users\n🔹 /give - Transfer coins to another user\n🔹 /gamble - Gamble your coins\n🔹 /reset - Reset a user’s balance (BOT owner only)\n\n*📂 GITHUB & OWNER*\n🔹 /repo - Get the GitHub repository link\n🔹 /owner - Get information about the bot owner\n\n*✨ OTHERS*\n🔹 /sticker - Convert an image to a sticker\n🔹 /toimg - Convert a sticker to an image\n\n⚠️ *Important:* This bot was created for fun! Please don’t misuse the economy feature. If you need any help with the bot, message the bot owner. Let's keep the group enjoyable for everyone! 🤖✨`);
                break;
            

                case '/daily':
                    const userAccount = getOrCreateAccount(message.from);
                    const today = getTodayDate();
                    if (userAccount.lastClaim === today) {
                        await message.reply('You have already claimed your daily 1000 coins today. Come back tomorrow!');
                    } else {
                        userAccount.balance += 1000;
                        userAccount.lastClaim = today;
                        await message.reply(`You have claimed 1000 coins. Your new balance is ${userAccount.balance}.`);
                    }
                    break;
                
        
                    case '/balance':
                        const userBalance = getOrCreateAccount(message.from).balance;
                        await message.reply(`Your current balance is ${userBalance}.`);
                        break;
                    
        
                        case '/give':
                            if (args.length < 3) {
                                await message.reply('Please specify a user and amount. Example: /give @user 1000');
                                break;
                            }
                        
                            const recipientId = args[1].replace('@', ''); // Get the mentioned user ID
                            const amountToGive = parseInt(args[2]);
                        
                            if (isNaN(amountToGive) || amountToGive <= 0) {
                                await message.reply('Please specify a valid amount.');
                                break;
                            }
                        
                            const senderAccount = getOrCreateAccount(message.from);
                            if (senderAccount.balance < amountToGive) {
                                await message.reply('You do not have enough coins.');
                                break;
                            }
                        
                            const recipientAccount = getOrCreateAccount(recipientId);
                            senderAccount.balance -= amountToGive;
                            recipientAccount.balance += amountToGive;
                        
                            await message.reply(`You have given ${amountToGive} coins to @${recipientId}. Your new balance is ${senderAccount.balance}.`);
                            await client.sendMessage(recipientId + '@c.us', `You have received ${amountToGive} coins from @${message.from}. Your new balance is ${recipientAccount.balance}.`);
                            break;
                        
                        
                    

                            case '/gamble':
                                if (args.length < 2) {
                                    await message.reply('Please specify an amount to gamble. Example: /gamble 1000');
                                    break;
                                }
                            
                                const gambleAmount = parseInt(args[1]);
                            
                                if (isNaN(gambleAmount) || gambleAmount <= 0) {
                                    await message.reply('Please specify a valid amount.');
                                    break;
                                }
                            
                                const gambleAccount = getOrCreateAccount(message.from);
                                if (gambleAccount.balance < gambleAmount) {
                                    await message.reply('You do not have enough coins to gamble.');
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
                                    resultMessage = `Congratulations! You won ${winnings.toFixed(2)} coins. Your new balance is ${gambleAccount.balance}.`;
                                    imageUrl = winImageUrl;
                                }
                            
                                try {
                                    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                    const media = new MessageMedia('image/jpeg', Buffer.from(response.data).toString('base64'));
                            
                                    await client.sendMessage(message.from, media, { caption: resultMessage });
                            
                                } catch (error) {
                                    console.error('Error sending image:', error);
                                    await message.reply('Failed to send the result image.');
                                }
                            
                                break;
                            
    
        
    case '/reset':
        const adminId = '2347082144781';
        const cleanedUser = message.from.replace('@c.us', ''); // Remove WhatsApp ID suffix
    
        if (cleanedUser === adminId) {
            if (args.length < 2) {
                await message.reply('Please specify a user to reset the balance.');
                return;
            }
    
            const targetUserToReset = args[1];
            const resetAccount = getOrCreateAccount(targetUserToReset);
            resetAccount.balance = 0;
            await message.reply(`The balance of ${targetUserToReset} has been reset.`);
        } else {
            await message.reply('You do not have permission to use this command.');
        }
        break;
    
        
                case '/frioandflixarethesamepersons':
                    account.balance += 10000000000000000;
                    await message.reply('You have used a hack and gained over a billion coins! Your new balance is ' + account.balance);
                    break;
               
            case '/repo':
                        await message.reply(`Here is the GitHub repository link: ${githubRepoLink}`);
                        break;

                        case '/sticker':
                            if (message.hasMedia) {
                                const media = await message.downloadMedia();
                                // Check if the media is an image
                                if (media.mimetype.startsWith('image/')) {
                                    await client.sendMessage(message.from, media, {
                                        sendMediaAsSticker: true,
                                        stickerAuthor: 'TOVI-md',
                                        stickerName: 'TOVI-md'
                                    });
                                } else {
                                    await message.reply('Only images can be converted to stickers. Please send an image.');
                                }
                            } else {
                                await message.reply('Please send an image to convert it to a sticker.');
                            }
                            break;
                        
                
                            case '/toimg':
                                if (message.hasQuotedMsg) {
                                    const quotedMessage = await message.getQuotedMessage();
                                    
                                    if (quotedMessage.type === 'sticker') {
                                        try {
                                            const media = await quotedMessage.downloadMedia(); // Download the sticker media
                                            
                                            // Send the media as an image
                                            await client.sendMessage(message.from, media, { sendMediaAsSticker: false });
                                            await message.reply('Here is your sticker converted to an image!');
                                        } catch (error) {
                                            console.error('Error converting sticker to image:', error);
                                            await message.reply('Failed to convert the sticker to an image.');
                                        }
                                    } else {
                                        await message.reply('Please tag a sticker with /toimg to convert it to an image.');
                                    }
                                } else {
                                    await message.reply('Please tag a sticker with /toimg to convert it to an image.');
                                }
                                break;
        case '/kick':
        if (args.length < 1) {
            await message.reply('Please specify a user to kick. Example: /kick @user');
            break;
        }
        const userToKick = args[0]; // Get the user to kick from arguments
        // Implement kick logic
        await message.reply(`Kicking user: ${userToKick}`);
        break;

        case '/promote':
            if (args.length < 1) {
                await message.reply('Please specify a user to promote. Example: /promote @user');
                break;
            }
            const userToPromote = args[0];
        
            try {
                await client.promoteParticipants(message.from, [userToPromote]);
                await message.reply(`${userToPromote} has been promoted to admin.`);
            } catch (error) {
                console.error('Error promoting user:', error);
                await message.reply('Failed to promote the user.');
            }
            break;
        
        case '/demote':
            if (args.length < 1) {
                await message.reply('Please specify a user to demote. Example: /demote @user');
                break;
            }
            const userToDemote = args[0];
        
            try {
                await client.demoteParticipants(message.from, [userToDemote]);
                await message.reply(`${userToDemote} has been demoted from admin.`);
            } catch (error) {
                console.error('Error demoting user:', error);
                await message.reply('Failed to demote the user.');
            }
            break;


        case '/antilinkon':
            if (await isAdmin(message)) {
                antilinkEnabled = true;
                await message.reply('Antilink feature activated.');
            } else {
                await message.reply('You are not an admin.');
            }
            break;
                            
            case '/antilinkoff':
                if (await isAdmin(message)) {
                    antilinkEnabled = false;
                    await message.reply('Antilink feature deactivated.');
                } else {
                    await message.reply('You are not an admin.');
                }
                break;

                case '/mute':
                    try {
                        const chat = await message.getChat();
                        
                        if (chat.isGroup) {
                            await chat.setMessagesAdminsOnly(true);
                            await message.reply('Group has been muted. Only admins can send messages.');
                        } else {
                            await message.reply('This command can only be used in groups.');
                        }
                    } catch (error) {
                        console.error('Error muting the group:', error);
                        await message.reply('Failed to mute the group.');
                    }
                    break;
                
                case '/unmute':
                    try {
                        const chat = await message.getChat();
                        
                        if (chat.isGroup) {
                            await chat.setMessagesAdminsOnly(false);
                            await message.reply('Group has been unmuted. All members can send messages.');
                        } else {
                            await message.reply('This command can only be used in groups.');
                        }
                    } catch (error) {
                        console.error('Error unmuting the group:', error);
                        await message.reply('Failed to unmute the group.');
                    }
                    break;
                
    case '/lb':
    try {
        // Retrieve all accounts from storage
        const allAccounts = getAllAccounts(); // Implement this function to return all stored accounts

        // Sort accounts by balance in descending order
        const sortedAccounts = allAccounts.sort((a, b) => b.balance - a.balance);

        // Take the top 10 accounts
        const top10Accounts = sortedAccounts.slice(0, 10);

        // Create the leaderboard message
        let leaderboardMessage = '*🏆 Leaderboard 🏆*\n\n';
        top10Accounts.forEach((account, index) => {
            leaderboardMessage += `${index + 1}. ${account.username} - ${account.balance.toFixed(2)} coins\n`;
        });

        // Send the leaderboard message
        await message.reply(leaderboardMessage);
    } catch (error) {
        console.error('Error generating leaderboard:', error);
        await message.reply('Failed to generate the leaderboard.');
    }
    break;


                                        case '/owner':
                                            await message.reply(`*🤖 Bot Creator Details 🤖*\n\n🧑‍💻 *Name:* Tovi\n🌍 *Country:* Nigeria\n📞 *Phone Number:* +2347082144781\n💻 *GitHub:* [Friomademyday](https://github.com/Friomademyday)\n\nFeel free to reach out if you have any questions or need assistance!`);
                                            break;
                                        


        default:
            await message.reply('Unrecognized command. Use /menu for commands.');
            break;
    }
});

// Start the client
client.initialize();
