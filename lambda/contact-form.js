const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: "us-east-1" });
const TO_EMAIL = "info@nftt.co.jp";
const FROM_EMAIL = "noreply@nftt.co.jp";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://nftt.co.jp",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // CORS preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, subject, message, honeypot } = body;

    // Honeypot check (spam protection)
    if (honeypot) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // Validation
    const errors = [];
    if (!name || name.trim().length < 2) errors.push("お名前を入力してください");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("有効なメールアドレスを入力してください");
    if (!subject || subject.trim().length < 2) errors.push("件名を入力してください");
    if (!message || message.trim().length < 10) errors.push("メッセージを10文字以上入力してください");

    if (errors.length > 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, errors }) };
    }

    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    // Send notification email to admin
    await ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [TO_EMAIL] },
      Message: {
        Subject: { Data: `[お問い合わせ] ${subject}`, Charset: "UTF-8" },
        Body: {
          Text: {
            Data: `NFTテクノロジー株式会社 お問い合わせフォームより

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${name}
メールアドレス: ${email}
件名: ${subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【お問い合わせ内容】
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
送信日時: ${now}
`,
            Charset: "UTF-8"
          }
        }
      }
    }));

    // Send auto-reply to user
    await ses.send(new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "【NFTテクノロジー】お問い合わせありがとうございます", Charset: "UTF-8" },
        Body: {
          Text: {
            Data: `${name} 様

この度はNFTテクノロジー株式会社へお問い合わせいただき、
誠にありがとうございます。

以下の内容でお問い合わせを受け付けました。
担当者より折り返しご連絡いたしますので、
今しばらくお待ちくださいませ。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ内容】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
件名: ${subject}

${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※このメールは自動送信されています。
※このメールに返信いただいても対応できない場合がございます。

──────────────────────────────
NFTテクノロジー株式会社
https://nftt.co.jp
──────────────────────────────
`,
            Charset: "UTF-8"
          }
        }
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "お問い合わせを受け付けました" })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, errors: ["送信に失敗しました。時間をおいて再度お試しください。"] })
    };
  }
};
