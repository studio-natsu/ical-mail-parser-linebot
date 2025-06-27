import 'dotenv/config'; //.env ファイルの内容を process.env に自動で読み込み
import { authorize } from './googleOAuth';
import { get_Airbnb_Reserve } from './confirmedGmail';//予約メールを解析して宿泊情報を返す
import { pushToLine } from './pushLINE'; //LINEグループに通知を送る関数
import fs from 'fs/promises'; //ファイル操作用
import path from 'path'; //パス結合などに使うユーティリティ


//前回のメッセージIDが保存されているファイル名とパス名
const LAST_ID_PATH = path.join(__dirname, 'lastMessageId.txt'); 

// 前回のメッセージIDを読み込む
async function loadLastMessageId(): Promise<string | null> {
  try {
    return (await fs.readFile(LAST_ID_PATH, 'utf8')).trim(); //ファイルを同期的に読み込む
  } catch {
    return null; // ファイルが存在しない場合などは、返さない
  }
}

// 現在のメッセージIDを保存する
async function saveLastMessageId(id: string): Promise<void> {
  await fs.writeFile(LAST_ID_PATH, id, 'utf8');
}

async function main() {
    console.log('▶ 処理開始');

    const auth = await authorize(); 
    console.log('✅ 認証成功');
    const mail = await get_Airbnb_Reserve(auth);
    if (!mail){
        console.log("✖新しいメールはありません")
        return;
    }

   
    const lastId = await loadLastMessageId();
    if (mail.messageId === lastId) {
    console.log('⏩ 同じメッセージなので通知スキップ');
    return; //処理を終了してなにも行わない
    }
    

    console.log('✉ 予約メールを取得', mail);

    const text = `📥予約が入りました
    部屋番号:  ${mail.summary}
    ID： ${mail.messageId} 
    チェックイン: ${mail.start}
    チェックアウト: ${mail.end} ` ;

    const groupId = process.env.LINE_GROUP_ID;
    console.log('▶ LINE グループID:', groupId);

    console.log('▶ before pushing to LINE');
    await pushToLine(process.env.LINE_GROUP_ID!, text);
    console.log("✅LINEの通知をしました")

    
  await saveLastMessageId(mail.messageId);
  console.log('💾 メッセージIDを保存しました');
}



main().catch(err => {
  console.error('🚨 エラー発生:', err);
  process.exit(1);
});

