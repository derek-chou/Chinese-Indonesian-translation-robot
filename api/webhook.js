const { GoogleGenAI } = require("@google/genai");
const line = require("@line/bot-sdk");

module.exports = async (req, res) => {
  // 1. 處理非 POST 請求，防止 405
  if (req.method !== 'POST') {
    return res.status(200).send('Webhook is active and ready for LINE events!');
  }

  const GEMINI_KEY = process.env.GEMINI_KEY || process.env.API_KEY;
  const LINE_SECRET = process.env.LINE_CHANNEL_SECRET;
  const LINE_TOKEN = process.env.LINE_ACCESS_TOKEN;

  if (!GEMINI_KEY || !LINE_SECRET || !LINE_TOKEN) {
    return res.status(200).send('Missing config. Please check Vercel Env Vars.');
  }

  // 2. 初始化 (遵循最新 SDK 規範)
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const client = new line.Client({
    channelAccessToken: LINE_TOKEN,
    channelSecret: LINE_SECRET
  });

  try {
    const events = req.body.events || [];
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userText = event.message.text;
        
        // 3. 正確的生成內容方式
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: '你是一位專業翻譯官。如果輸入是中文，請翻譯成印尼文；如果輸入是印尼文，請翻譯成繁體中文。只需回傳翻譯結果，不要有額外解釋。內容：' + userText
        });

        // 4. 正確讀取文字內容 (.text 屬性)
        const translatedText = response.text || '無法生成翻譯';

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: translatedText.trim()
        });
      }
    }
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(200).send('Processed with errors');
  }
};