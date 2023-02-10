import { ChatGPTAPI } from 'chatgpt';
import whatsappweb from "whatsapp-web.js";
import pkg from 'qrcode-terminal';
const generate = pkg.generate;



const api = new ChatGPTAPI({
  apiKey: Z0HzxBqnKYB0F3nrdkJrT3BlbkFJzvW3SI8GR2k0aQowCQKg
});

const { Client, LocalAuth } = whatsappweb;
const whatsapp = new Client({
  puppeteer: {
    executablePath: process.env.CHROME_PATH,
  },
  authStrategy: new LocalAuth(),
});

const conversations = {};

whatsapp.initialize();

whatsapp.on("qr", (qr) => {
  generate(qr, { small: true });
});

whatsapp.on("authenticated", () => {
  console.log("Authentication complete");
});
whatsapp.on("ready", () => {
  console.log("Ready to accept messages");
});

whatsapp.on("message", async (message) => {
  console.log(
    `From: ${message._data.id.remote} (${message._data.notifyName})`
  );
  console.log(`Message: ${message.body}`);

  const chat = await message.getChat();

  if (
    chat.isGroup &&
    !message.mentionedIds.includes(whatsapp.info.wid._serialized)
  ) return;

  if (
    conversations[message._data.id.remote] === undefined ||
    message.body === "reset"
  ) {
    console.log(`Creating new conversation for ${message._data.id.remote}`);
    if (message.body === "reset") {
      message.reply("Conversation reset");
      return;
    }
    conversations[message._data.id.remote] = api;
  }

  const response = await conversations[message._data.id.remote].sendMessage(message.body);
  console.log(`Response: ${response.text}`);
  message.reply(response.text);
});
