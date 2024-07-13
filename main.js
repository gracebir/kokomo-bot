/** @format */

require("dotenv").config();
const { Telegraf } = require("telegraf");

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_BOT_TOKEN;
const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

// Enhanced Emojis ✨ (with escaped !)
const emojis = {
    sparkles: "✨",
    tada: "🎉", // Escaped '!'
    gameDie: "🎲",
    fire: "🔥",
    trophy: "🏆",
    rocket: "🚀",
    energy: "⚡️",
    coconut: "🥥",
};

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const gameImageURL =
    "https://www.kokomo.games/assets/Kokomo-games-C_v_d2aL.png";
const socialFiImageURL =
    "https://www.kokomo.games/assets/koko_phone-DqlVRn08.png";

const USER_CREATION_ENDPOINT = process.env.USER_POINT;

const referrals = {};

bot.start(async (ctx) => {
    const refCode = ctx.startPayload;

    // 1. Get user information by tgUserId
    try {
        const getUserResponse = await fetch(
            `${USER_CREATION_ENDPOINT}/${ctx.from.id}`
        );

        if (!getUserResponse.ok) {
            throw new Error("Failed to fetch user information");
        }

        const userData = await getUserResponse.json();
        // console.log(userData);
        console.log(ctx.from);

        if (Object.keys(userData).length > 0) {
            // User exists, you can now use the userData object
            console.log("User Data:", userData); // Example: Log the user data
        } else {
            // User doesn't exist, create them
            const createUserResponse = await fetch(USER_CREATION_ENDPOINT, {
                method: "POST",
                body: JSON.stringify({
                    tgUserId: ctx.from.id,
                    refCode: refCode, // Pass the refCode here
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!createUserResponse.ok) {
                throw new Error("Failed to create user");
            }
        }
    } catch (error) {
        console.error("Error fetching or creating user:", error);
        // Handle the error appropriately
    }

    // Personalize the Welcome Message
    const username = ctx.from.username || ctx.from.first_name || "Player";
    ctx.replyWithHTML(
        `<b>${emojis.sparkles} Welcome, ${username}! ${emojis.tada}</b>

       <b>Get ready to join the Koko Klick adventure!</b> ${emojis.rocket}

      Kokomo is the world's stickiest hyper-casual gaming platform, bringing skill-based competitive games for cash & crypto prizes right to Telegram & Discord. 💰

      <b>Powered by $KOKO</b>, the first gaming token with real use and investment value. We're building a unique token model that grows in value as more people play – a win-win for everyone! 🚀

      <b>Our Vision:</b> We're revolutionizing Web3 gaming by combining classic games with blockchain tech.  Enjoy the thrill of competition, earn rewards, and be part of a vibrant community! 🎉

      <b>Invite Your Friends and Win Big!</b> 👥
      Share the fun with your friends and family. Each referral earns you points, and the top inviters get amazing prizes. It's time to level up together! 🎁

      <b>Tap below to start your Koko Klick journey!</b> 👇`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: `${emojis.gameDie} Play Koko Klick`,
                            web_app: {
                                url: `${HOST_URL}`,
                            },
                        },
                    ],
                    [
                        { text: "How to Play", callback_data: "help" },
                        {
                            text: `${emojis.trophy} Leaderboard`,
                            callback_data: "leaderboard",
                        },
                    ],
                ],
            },
        }
    );

    // Store Referral (if any)
    if (refCode) {
        // Add code to track the referral in your database or storage
        //@ts-ignore
        referrals[ctx.from.id] = refCode;
        console.log(`User ${ctx.from.id} referred by ${refCode}`);
    }
});

bot.action("help", (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithPhoto(gameImageURL, {
        caption: `<b>How to Play Koko Klick:</b>\n\n${emojis.energy} It&#39;s a simple clicker game! Tap the screen as fast as you can to drain your energy bar. The bar recharges slowly, so keep clicking to maximize your score! ${emojis.fire}`,
        parse_mode: "HTML",
    });
});

// Leaderboard Command (placeholder)
bot.action("leaderboard", (ctx) => {
    ctx.answerCbQuery();
    ctx.reply("Leaderboard coming soon! 🏆"); // Replace with actual leaderboard functionality
});

// Game Description Command with Image
bot.command("gameinfo", (ctx) => {
    ctx.replyWithPhoto(gameImageURL, {
        caption: `<b>Koko Klick Game Description:</b>\n\nA simple but addictive clicker game like Notcoin.\nUse your energy to click as fast as possible!\nRecharge your energy and keep clicking to the top! ${emojis.coconut}`,
        parse_mode: "HTML",
    });
});

// SocialFi/Points System Command with Image
bot.command("socialfi", (ctx) => {
    ctx.replyWithPhoto(socialFiImageURL, {
        caption: `<b>Koko Klick SocialFi/Points System:</b>\n\n${emojis.trophy} Top Inviter Prizes!\n${emojis.energy} Earn points for inviting friends!\n👥 Share points with your friends!\n${emojis.fire} Top clicker of the day bonuses!\nAnd more...`,
        parse_mode: "HTML",
    });
});

console.log("Bot is running" + emojis.rocket);

bot.launch();
