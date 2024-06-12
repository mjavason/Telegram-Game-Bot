import express, { Request, Response, NextFunction } from 'express';
import { Bot, GrammyError, HttpError } from 'grammy';
import 'express-async-errors';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

//#region app setup
const app = express();
app.use(express.json()); // Middleware to parse JSON or URL-encoded data
app.use(express.urlencoded({ extended: true })); // For complex form data
app.use(cors());
dotenv.config({ path: './.env' });
//#endregion

//#region keys and configs
const PORT = process.env.PORT || 3000;
const baseURL = 'https://httpbin.org';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'xxxx';
// const SITE_LINK = process.env.SITE_LINK || 'xxxx';
const bot = new Bot(TELEGRAM_BOT_TOKEN);
let leaderboard: [{ username: string; clicks: number }] | any = [];
//#endregion

// const getUsername = (ctx: Context): string => {
// 	return ctx?.me?.username || "";
// };

// const getInfo = (ctx: Context): Context["me"] => {
// 	return ctx?.me || {};
// };

function telegramWelcomeCommand(bot: Bot) {
  bot.command('start', (ctx) => {
    // const message = `Hello, welcome, our bot is live. This is the API URL: ${SITE_LINK}`;

    // console.log(ctx.from);
    // ctx.reply(message);
    ctx.replyWithGame('fastfinger');
    console.log(ctx.from);
  });

  bot.on('callback_query:game_short_name', async (ctx) => {
    console.log('Game event button called');

    await ctx.answerCallbackQuery({
      url: `https://telegram-game-bot-frontend.onrender.com?username=${ctx.from.username}`,
    });
  });

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e);
    } else {
      console.error('Unknown error:', e);
    }
  });
}

async function startBot() {
  console.log('Telegram game bot started!');
  telegramWelcomeCommand(bot);

  bot.start();
}

//get complete top 10 leaderboard
app.get('/leaderboard', (req: Request, res: Response) => {
  return res.send(sortLeaderboard());
});

app.post('/new-score', (req: Request, res: Response) => {
  console.log('req.body', req.body);
  for (let i = 0; i < leaderboard.length; i++) {
    if (leaderboard[i].username == req.body.username) {
      if (leaderboard[i].clicks < req.body.clicks) leaderboard[i] = req.body;
      return res.send({
        success: true,
        message: 'Score updated successfully',
        data: leaderboard[i],
      });
    }
  }

  leaderboard.push(req.body);
  return res.send({
    success: true,
    message: 'Score updated successfully',
    data: req.body,
  });
});

function sortLeaderboard() {
  // Sort function for descending order
  const sortByClicks = (a: { clicks: number }, b: { clicks: number }) =>
    b.clicks - a.clicks;

  // Sort the players array by score
  const sortedPlayers = leaderboard.sort(sortByClicks);
  return sortedPlayers;
}
//#region Server setup
async function pingSelf() {
  try {
    const { data } = await axios.get(
      `https://telegram-game-bot-tbdr.onrender.com`
    );

    console.log(`Server pinged successfully: ${data.message}`);
    return true;
  } catch (e: any) {
    console.log(`this the error message: ${e.message}`);
    return;
  }
}

// default message
app.get('/api', async (req: Request, res: Response) => {
  const result = await axios.get(baseURL);
  console.log(result.status);
  return res.send({
    message: 'Demo API called (httpbin.org)',
    data: result.status,
  });
});

//default message
app.get('/', (req: Request, res: Response) => {
  return res.send({ message: 'API is Live!' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  startBot();
});

// (for render services) Keep the API awake by pinging it periodically
setInterval(pingSelf, 600000);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // throw Error('This is a sample error');

  console.log(`${'\x1b[31m'}${err.message}${'\x1b][0m]'}`);
  return res
    .status(500)
    .send({ success: false, status: 500, message: err.message });
});
//#endregion
