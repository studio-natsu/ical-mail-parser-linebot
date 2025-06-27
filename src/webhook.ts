// src/webhook.ts
import express from 'express';
import { middleware, messagingApi } from '@line/bot-sdk';
import 'dotenv/config';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

const app = express();
app.post('/webhook', middleware(config), (req, res) => {
  console.log('📩 Webhookリクエスト受信:', JSON.stringify(req.body, null, 2));
  
  for (const ev of req.body.events) {
    if (ev.source?.type === 'group') {
      console.log('グループID:', ev.source.groupId);
      
    }
    else {
      console.log('ℹ️ 他のイベント:', ev.source?.type);
  }
  }
  res.sendStatus(200); // LINEに正常応答を返す
});


app.listen(3000, () => console.log('✅ Webhook listening on port 3000'));

