/*Gmail API を使用して Airbnb予約確認メールを取得し、その本文を抽出 */

  import { google } from 'googleapis'; //Google API にアクセスする
  import { OAuth2Client } from 'google-auth-library'; //認証情報を扱うため


  //GoogleOAuth2認証オブジェクト（auth）を受け取る
  export async function get_Airbnb_Reserve(auth: OAuth2Client) { 
    const gmail = google.gmail({ version: 'v1', auth });
    
    //最新予約メールを検索
    const res = await gmail.users.messages.list({
      userId: 'me', //認証されたユーザーのメールボックス
      q: 'from:@google.com subject:"Reserved"', //Gmailの検索クエリ
      maxResults: 1 //最新の1通のみを取得
    });
    
      console.log("📩 検索結果:", res.data);

    //メール一覧（配列)の[0]一番新しいメールみる。
    const message = res.data.messages?.[0];
    if (!message) {
      console.warn("⚠️ 検索条件に一致するメールなし");
      return null; 
    }

    //メールの本文を取得
    const msg = await gmail.users.messages.get({ 
      userId: 'me',
      id: message.id!, 
      format: 'FULL' //ヘッダー・本文含めて取得
    });

    console.log("✅ メッセージID:", message.id);

    //text/plain の本文があるか探す
    //Base64でエンコードされた本文を取り出す
    //メール本文をBase64形式から文字列（UTF-8）にデコード
    const bodyData = msg.data.payload?.parts?.find(p => p.mimeType === 'text/plain')?.body?.data;
    if (!bodyData) return null;

    const decodedBody = Buffer.from(bodyData.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'); //Base64をデコードして日本語文字列に戻す。
    console.log("📝 デコードされた本文:", decodedBody);

    const today = new Date();
    const currentYear = today.getFullYear(); //今日の年

    //２泊以上
    const dateRangeMatch = decodedBody.match(
     /(\d{1,2})月\s*(\d{1,2})日\s*\([^)]*\)\s*[～~]\s*(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/
    );
    //１泊
    const singleDateMatch = decodedBody.match(
    /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日\s*\([^)]*\)(?!.*[～~])/ //「〜」記号がないことを保証
    );

    let checkinDate: string | null = null;
    let checkoutDate: string | null = null;

    if (dateRangeMatch) {
    // 2泊以上
    const [, sm, sd, ey, em, ed] = dateRangeMatch.map(Number);
    const checkout = new Date(ey, em - 1, ed);

    // チェックイン年を推定
    const checkinYear = (sm > em) ? ey - 1 : ey;
    const checkin = new Date(checkinYear, sm - 1, sd);
    checkout.setDate(checkout.getDate() + 1);

    checkinDate = `${checkin.getMonth() + 1}/${checkin.getDate()}`;
    checkoutDate = `${checkout.getMonth() + 1}/${checkout.getDate()}`;

    } else if (singleDateMatch) {
    // 1泊
    const [, y, m, d] = singleDateMatch.map(Number);
    const checkin = new Date(y, m - 1, d);
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + 1);

    checkinDate = `${checkin.getMonth() + 1}/${checkin.getDate()}`;
    checkoutDate = `${checkout.getMonth() + 1}/${checkout.getDate()} `;
    }
   else {
    console.log("⚠️ 日付が見つかりません");
   return null;
  }

    //部屋番号の判定
    let location: string = "";

    // 件名（Subject）を取得(件名に号室を分けるキーワードがある)
    const subjectHeader = msg.data.payload?.headers?.find(h => h.name === "Subject");//ヘッダー情報の中から "Subject"（件名）を探す
    const subject = subjectHeader?.value || ""; //エラー回避　件名がなかったら空文字
    console.log("📨 件名:", subject);



    console.log("🔍 部屋番号判定開始");

      if (subject.includes('1234567890')) {
        location = '403号室';
        console.log("✅ 403号室");
        
      } else if (subject.includes('10987654321')) {
        location = '402号室';
        console.log("✅ 402号室");

      } else {
        location = '不明';
        console.log("⚠️ 部屋番号不明");
      }

    if (!checkinDate || !checkoutDate) {
    console.warn("⛔ チェックインまたはチェックアウトがnullのままです");
    return null;
    }

    console.log("✅ 最終抽出結果", {
      messageId: message.id!,
      location,
      checkinDate,
      checkoutDate
    }); 

    return {
      messageId: message.id!,
      summary: location,
      start: checkinDate, 
      end: checkoutDate,
    };
    
    }

