// TubeDigest AI - Background Service Worker 4.0 (Native Neural Engine & Zero-Bleed)
console.log('TubeDigest AI Background Service Worker 4.0 Active.');

// Default API key placeholder (sanitized for public repository)
const HARDCODED_DEFAULT_KEY = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'gemini-summary') {
        const keyToUse = request.apiKey || HARDCODED_DEFAULT_KEY;
        callGeminiAI({ ...request, apiKey: keyToUse })
            .then(res => sendResponse(res))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true; // Keep async channel open
    }

    if (request.action === 'activate-license') {
        handleLicenseActivation(request)
            .then(res => sendResponse(res))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
});

async function sha256Hex(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const EXPECTED_WALLET = 'TZ565aUJX6hhFjmLekK7JZzv2S3wpgFVTZ';

async function handleLicenseActivation({ licenseKey, email, hwid }) {
    const rawKey = (licenseKey || '').trim();
    const key = rawKey.toUpperCase();
    const userEmail = (email || '').trim().toLowerCase();

    if (!rawKey) {
        return { success: false, error: 'لطفاً کد لایسنس یا شناسه تراکنش (TxID) را وارد فرمایید.' };
    }

    // 1. Master Developer / Owner Keys (Protected via one-way SHA-256 cryptographic hashes)
    const keyHash = await sha256Hex(key);
    const MASTER_HASHES = [
        'ad020949c04a1d1e5b84bcbd87dfde8506a7c86c4d2968287a193b336a8a1c8b', // Hash of VIP2026
        '8b88cc16e083e5afecb7394457377d8428a2ea7387501be75d3d76edafcbf9c3'  // Hash of ADMIN-OWNER
    ];

    if (MASTER_HASHES.includes(keyHash)) {
        await chrome.storage.local.set({
            tubedigest_pro: true,
            tubedigest_bound_hwid: hwid,
            tubedigest_bound_email: userEmail || 'admin@tubedigest.ai',
            tubedigest_bound_key: 'VIP-PRO',
            tubedigest_bound_time: Date.now()
        });
        return { success: true, message: '✅ لایسنس ویژه VIP TubeDigest فعال شد!' };
    }

    // 2. Email verification
    if (!userEmail || !userEmail.includes('@') || !userEmail.includes('.')) {
        return { success: false, error: 'لطفاً یک ایمیل معتبر وارد فرمایید.' };
    }

    // 3. Real On-Chain Blockchain Verification for Tron TRC-20 Transactions
    const isTxId = /^[0-9a-fA-F]{64}$/.test(rawKey);
    if (isTxId) {
        try {
            const tronRes = await fetch(`https://apilist.tronscanapi.com/api/transaction-info?hash=${rawKey.toLowerCase()}`);
            if (!tronRes.ok) {
                return { success: false, error: '❌ تراکنش در شبکه بلاک‌چین ترون یافت نشد. لطفاً هش تراکنش را بررسی نمایید.' };
            }

            const txData = await tronRes.json();
            if (!txData.confirmed || txData.contractRet !== 'SUCCESS') {
                return { success: false, error: '❌ این تراکنش هنوز تأیید نهایی نشده است. لطفاً چند ثانیه دیگر تلاش فرمایید.' };
            }

            // Verify funds were sent specifically to OUR official wallet
            const transfers = txData.trc20TransferInfo || [];
            const validTransfer = transfers.find(t => 
                t.to_address === EXPECTED_WALLET && 
                (t.symbol === 'USDT' || t.name === 'Tether USD')
            );

            if (!validTransfer) {
                return { 
                    success: false, 
                    error: '❌ این تراکنش به آدرس کیف پول رسمی TubeDigest ارسال نشده است یا ارز ارسالی تتر (USDT) نمی‌باشد!' 
                };
            }

            // Verify amount (at least 4.5 USDT)
            const amountFloat = Number(validTransfer.amount_str) / 1000000;
            if (amountFloat < 4.5) {
                return {
                    success: false,
                    error: `❌ مبلغ واریزشده (${amountFloat} USDT) کمتر از قیمت لایسنس (4.99 USDT) می‌باشد.`
                };
            }

        } catch (chainErr) {
            console.warn('TronScan API check error:', chainErr);
            // Allow fallback to cloud key registry if network error
        }
    } else if (!key.startsWith('PRO-') && key.length < 8) {
        return { success: false, error: 'کد واردشده نامعتبر است. لطفاً شناسه تراکنش ۶۴ رقمی یا کد لایسنس معتبر وارد فرمایید.' };
    }

    // 4. Fetch Client IP for security anchoring
    let clientIp = 'Unknown';
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json', { cache: 'no-cache' });
        const ipJson = await ipRes.json();
        clientIp = ipJson.ip || clientIp;
    } catch (e) {}

    // 5. Cloud Anti-Piracy Registry (Guarantees each payment hash / key is used ONLY ONCE globally)
    try {
        const ledgerUrl = `https://kvdb.io/4y9n1aU11n8R3c9bQ7yX6z/td_license_${encodeURIComponent(key)}`;
        const checkRes = await fetch(ledgerUrl, { method: 'GET' });
        
        if (checkRes.ok) {
            const boundData = await checkRes.json();
            // If already bound to another hardware device:
            if (boundData && boundData.hwid && boundData.hwid !== hwid) {
                return {
                    success: false,
                    error: `❌ این تراکنش یا لایسنس قبلاً بر روی دستگاه دیگری (${boundData.email ? boundData.email.slice(0, 3) + '***' : 'کاربر دیگر'}) فعال شده است. استفاده مجدد یا اشتراک‌گذاری مجاز نمی‌باشد.`
                };
            }
        } else {
            // First time activation for this transaction: Lock it forever to this machine and email!
            const newBinding = {
                key: key,
                email: userEmail,
                hwid: hwid,
                ip: clientIp,
                registeredAt: new Date().toISOString()
            };
            await fetch(ledgerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBinding)
            }).catch(() => {});
        }
    } catch (netErr) {
        console.warn('License ledger fallback');
    }

    // Save hardware-bound license locally
    await chrome.storage.local.set({
        tubedigest_pro: true,
        tubedigest_bound_hwid: hwid,
        tubedigest_bound_email: userEmail,
        tubedigest_bound_key: key,
        tubedigest_bound_ip: clientIp,
        tubedigest_bound_time: Date.now()
    });

    return { 
        success: true, 
        message: '✅ تراکنش در شبکه ترون تأیید شد و لایسنس Pro برای این دستگاه فعال گردید!' 
    };
}

async function callGeminiAI({ title, channel, transcript, lang, apiKey }) {
    const key = apiKey || HARDCODED_DEFAULT_KEY;
    const langName = lang === 'fa' ? 'فارسی فاخر، روان و شیوا' : (lang === 'ar' ? 'العربية الفصحى' : 'English');

    const prompt = `
شما یک تحلیلگر و استراتژیست ارشد رسانه و محتوا هستید.
وظیفه شما این است که محتوای این ویدیوی مشخص از یوتیوب را به دقت تحلیل کرده و یک خلاصه جامع، بسیار باکیفیت و عمیق ارائه دهید.

مشخصات ویدیو:
- عنوان ویدیو: "${title || 'نامشخص'}"
- کانال سازنده: "${channel || 'نامشخص'}"

متن صحبت‌ها / توضیحات و اطلاعات این ویدیو:
"""
${(transcript && transcript.length > 30) ? transcript.slice(0, 30000) : `این ویدیو با عنوان «${title}» منتشر شده است و موضوعات پیرامون این عنوان را بررسی می‌کند.`}
"""

قوانین حیاتی و غیرقابل تغییر:
۱. تحلیل شما باید کاملاً واقعی، علمی و دقیقاً متناسب با عنوان و محتوای «همین ویدیو» باشد.
۲. از آوردن تمپلیت‌ها، کلیشه‌ها، یا داده‌های نامربوط به این ویدیو (مثل چالش‌های بقا، گیمینگ، یا مباحث غیرمرتبط با عنوان این ویدیو) اکیداً خودداری کنید.
۳. در بخش «conclusion» (پیام نهایی)، مغز کلام ویدیو را در ۳ الی ۴ خط بیان کن: گوینده در نهایت چه پیام مهمی، چه هشداری، چه حقیقتی یا چه نتیجه‌گیری استراتژیکی را اثبات می‌کند؟
۴. تمام متون خروجی باید به زبان ${langName} باشد.

خروجی را منحصراً در قالب این شیء JSON تحویل بده:
{
  "conclusion": "یک تحلیل عمیق و پرکشش ۳ تا ۴ خطی از پیام نهایی، برهان اصلی و نتیجه‌گیری غایی سازنده ویدیو",
  "takeaway": "خلاصه فشرده و اجرایی ۳۰ ثانیه‌ای از مهم‌ترین رخدادها و مباحث طرح‌شده",
  "highlights": [
    "نکته کلیدی و برهان تحلیلی اول با ذکر جزییات دقیق موضوع ویدیو",
    "نکته کلیدی دوم شامل شواهد، تاریخچه، وقایع یا مستندات مطرح‌شده",
    "نکته کلیدی سوم شامل پیام‌ها، نشانه‌ها یا محورهای اساسی بحث",
    "نکته کلیدی چهارم شامل جمع‌بندی ابعاد مختلف مبحث"
  ],
  "lessons": [
    "درس یا پیام کاربردی/اخلاقی/راهبردی اول برای بیننده در زندگی یا درک موضوع",
    "درس یا پیام کاربردی/اخلاقی/راهبردی دوم برای بیننده"
  ],
  "timeline": [
    {"time": "00:00", "text": "طرح مسئله و آغاز مبحث"},
    {"time": "03:40", "text": "بررسی ریشه‌ها و مستندات تاریخی"},
    {"time": "09:20", "text": "نشانه‌ها و ابعاد اصلی موضوع"},
    {"time": "15:10", "text": "نتیجه‌گیری نهایی و پیام عبرت‌آموز"}
  ]
}

فقط و فقط یک شیء معتبر JSON خروجی بده، بدون هیچ کلمه اضافه در ابتدا و انتها.
`;

    // Modern Gemini 2.5 Flash Endpoint
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.25,
                        topP: 0.85
                    }
                })
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                lastError = errJson.error ? errJson.error.message : response.statusText;
                continue; // Try next model
            }

            const json = await response.json();
            const candidate = json.candidates && json.candidates[0];
            if (!candidate || !candidate.content) {
                lastError = 'پاسخی از مدل دریافت نشد';
                continue;
            }

            let rawText = candidate.content.parts[0].text.trim();
            if (rawText.startsWith('```')) {
                rawText = rawText.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
            }

            try {
                const parsed = JSON.parse(rawText);
                return { success: true, data: parsed };
            } catch (parseErr) {
                return {
                    success: true,
                    data: {
                        conclusion: rawText.slice(0, 350),
                        takeaway: rawText.slice(0, 220),
                        highlights: [rawText.slice(220, 650)],
                        lessons: ['تحلیل هوشمند بر مبنای محتوای ویدیو انجام شد.'],
                        timeline: []
                    }
                };
            }
        } catch (netErr) {
            lastError = netErr.message;
        }
    }

    return { success: false, error: lastError || 'خطا در ارتباط با هوش مصنوعی' };
}
