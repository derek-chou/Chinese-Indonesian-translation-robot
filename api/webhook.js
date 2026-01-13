const { GoogleGenAI } = require("@google/genai");
const line = require("@line/bot-sdk");

module.exports = async (req, res) => {
  console.log("--- 收到新的請求 ---");
  console.log("Method:", req.method);
  console.log("Body:", JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(200).send('伺服器運作中！請從 LINE 發送訊息測試。');
  }

  const GEMINI_KEY = process.env.GEMINI_KEY || process.env.API_KEY;
  const LINE_SECRET = process.env.LINE_CHANNEL_SECRET;
  const LINE_TOKEN = process.env.LINE_ACCESS_TOKEN;

  if (!GEMINI_KEY || !LINE_SECRET || !LINE_TOKEN) {
    console.error("環境變數缺失！");
    return res.status(200).send('Config Error');
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const client = new line.Client({ channelAccessToken: LINE_TOKEN, channelSecret: LINE_SECRET });

  try {
    const events = req.body.events || [];
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        console.log("正在處理翻譯:", event.message.text);
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: '你是一位專業翻譯員。將以下文字進行中印互翻（中文翻印尼文，印尼文翻繁體中文）：' + event.message.text
        });

        const translated = response.text || "翻譯失敗";
        console.log("翻譯結果:", translated);

        await client.replyMessage(event.replyToken, { type: 'text', text: translated.trim() });
      }
    }
    return res.status(200).send('OK');
  } catch (err) {
    console.error("執行出錯:", err.message);
    return res.status(200).send('Error');
  }
};