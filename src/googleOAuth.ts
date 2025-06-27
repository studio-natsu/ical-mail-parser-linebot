/*Gmail APIへのOAuth2認証を処理。認証情報を取得し、アクセストークンを保存。 */

  import { google } from "googleapis"; //GoogleのAPIにアクセスするため
  import * as fs from "fs";//ファイルの読み書きを行う
  import * as readline from "readline"; //キーボードからの入力を受け取る
  import * as path from 'path'; //ファイルパスをOSに合わせて扱えるモジュール

  //GoogleAPIのアクセス範囲
  const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',];
  const TOKEN_PATH = path.join(__dirname, '../token.json'); //初回はトークンない
  const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

/*JSONファイルの内容を変数へ代入する*/
  export async function authorize() { 
    const content = fs.readFileSync(CREDENTIALS_PATH, { encoding: 'utf8' }); //utf8で読み込む
    const credentials = JSON.parse(content) ; //JSON文字列からオブジェクトへ変換
    const { client_id, client_secret, redirect_uris } = credentials.installed;  //キーの内容を分割代入

    console.log('✅ credentials 読み込み成功');

  //OAuth2認証クライアントを作成
    const OAuth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, //正規であることを示す
      redirect_uris[0] //認証後に戻ってくるURL
    );
    console.log('✅ OAuth2Client 読み込み成功');

/*トークンファイルがあるか確認、あればOAuth2Clientへ返す */
    //OAuth2クライアントにアクセストークンを設定して、すぐに Google API にアクセスできる状態にする
    if (fs.existsSync(TOKEN_PATH)){ 
        console.log('✅ トークンファイル発見、読み込み中...'); 
      
        const token = fs.readFileSync(TOKEN_PATH, { encoding: 'utf8' });//トークン（JSON 形式の文字列）を読み取る
        OAuth2Client.setCredentials(JSON.parse(token));                 //トークン文字列をJSON（オブジェクト）に変換

        console.log('🔓 トークンを使用して認証しました。');
        return OAuth2Client; 
    }

//トークンなければ次の処理へ

/* 認証URLの表示と、ユーザーに入力してもらう*/
    console.log('🔗 認証URLを生成中～');
    const authURL = OAuth2Client.generateAuthUrl({ //OAuth認可URLを生成するメソッド
        access_type: "offline",                    //リフレッシュトークンを取得
        scope: SCOPES.join(' '),                   //,SCOPEで定義したURLをJOINで文字列へ。
    });
    console.log("URLにアクセスして認証してね～:", authURL); //ターミナルにURLが出力

  //成功すると、Googleが認可コード（短い英数字列）を表示してくれる
  //おそらく「http://localhost」を設定しているので、もしかしたらlocalhost 接続が拒否されるかも
  //そんなときはhttps://qiita.com/n0bisuke/items/680ab634463eee2dbfd3

  //キーボードから入力を受け付け、ターミナルに出力を表示する
    const userInput  = readline.createInterface({ 
        input: process.stdin,   //ユーザーの入力を受け取る
        output: process.stdout  //プロンプトをターミナルに表示する
    });

  //ユーザーの入力が終わるまでawait（待機） 
  //入力が終わるとcodeへ格納
    const code = await new Promise<string>((resolve) =>
        userInput.question('🔑 認可コードを入力してね: ', resolve) 
    );

    userInput .close(); //readlineは入力を待ち続ける性質のため、必ず閉める


/*認可コードを使ってGoogleからトークンを取得。tokensだけを取り出して変数に代入 */
  const { tokens } = await OAuth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens)); //再認証なしでAPIを使える
  OAuth2Client.setCredentials(tokens);                  //取得したtokensをOAuthのクライアントに設定する
  console.log('✅ トークンを保存しました');
  return OAuth2Client;

  }

/*
// テストコード
//D:/arms_LINEにいるとき：npx ts-node src/googleOAuth.ts
authorize()
  .then(() => {
    console.log('✅ 認証に成功しました');
  })
  .catch((err) => {
    console.error('❌ 認証に失敗しました:', err);
  });
*/

