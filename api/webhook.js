const { GoogleGenAI } = require("@google/genai");
const line = require("@line/bot-sdk");

const ai = new GoogleGenAI({ apiKey: AIzaSyASnQfAT7RX7QceufOVWkGWOPMy0790JMk });
const client = new line.Client({
  channelAccessToken: '2008872994',
  channelSecret: '6f8db9ef2b670a216169e3695755ae57'
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const events = req.body.events;
    for (let event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `你是一個翻譯機器人。如果輸入是中文，請翻譯成印尼文；如果輸入是印尼文，請翻譯成中文。請直接輸出翻譯結果即可。內容："${event.message.text}"`;
        const result = await model.generateContent(prompt);
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