const { GoogleGenAI } = require("@google/genai");
const line = require("@line/bot-sdk");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
const client = new line.Client({
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const events = req.body.events;
    for (let event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const prompt = `你是一個翻譯機器人。如果輸入是中文，請翻譯成印尼文；如果輸入是印尼文，請翻譯成中文。請直接輸出翻譯結果即可。內容："${event.message.text}"`;
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "..."
        });
        const translated = result.response.text();
        
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: translated.trim()
        });
      }
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
};