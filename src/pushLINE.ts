import { messagingApi } from "@line/bot-sdk"; //API呼び出し
//import { group } from "console";

const { MessagingApiClient } = messagingApi;
const LineCliant = new MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!, //Botにメッセージ送信権限を与える
});

export async function pushToLine(groupID: string,massage: string){
    await LineCliant.pushMessage({
        to: process.env.LINE_GROUP_ID!, //Botがメッセージを送る相手
        messages: [{type: 'text',text: massage }], //送信するテキストを指定
    });
}

