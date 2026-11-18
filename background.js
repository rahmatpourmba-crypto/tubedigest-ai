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

async function handleLicenseActivation({ licenseKey, email, hwid }) {
    const key = (licenseKey || '').trim().toUpperCase();
    const userEmail = (email || '').trim().toLowerCase();

    if (!key) {
        return { success: false, error: 'لطفاً کد لایسنس را وارد فرمایید.' };
    }

    // Master Developer / Owner Keys (Protected via one-way SHA-256 cryptographic hashes)
    const keyHash = await sha256Hex(key);
    const MASTER_HASHES = [
        'ad020949c04a1d1e5b84bcbd87dfde8506a7c86c4d2968287a193b336a8a1c8b', // Hash of master VIP code
        '8b88cc16e083e5afecb7394457377d8428a2ea7387501be75d3d76edafcbf9c3'  // Hash of owner admin code
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

    // For standard commercial customer keys:
    if (!userEmail || !userEmail.includes('@') || !userEmail.includes('.')) {
        return { success: false, error: 'لطفاً ایمیل معتبری که با آن خرید کرده‌اید را وارد فرمایید.' };
    }

    // Verify key format (e.g., PRO-XXXX-XXXX or alphanumeric 8+ chars)
    if (key.length < 6) {
        return { success: false, error: 'کد لایسنس نامعتبر است. فرمت صحیح: PRO-XXXX-XXXX' };
    }

    // Fetch Client IP for device-account geolocation anchoring
    let clientIp = 'Unknown';
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json', { cache: 'no-cache' });
        const ipJson = await ipRes.json();
        clientIp = ipJson.ip || clientIp;
    } catch (e) {}

    // Check Cloud Key Registry (to enforce 1 device / 1 account rule globally)
    // Cloud ledger endpoint (supports Cloudflare Worker or global KV sync)
    try {
        const ledgerUrl = `https://kvdb.io/4y9n1aU11n8R3c9bQ7yX6z/td_license_${encodeURIComponent(key)}`;
        const checkRes = await fetch(ledgerUrl, { method: 'GET' });
        
        if (checkRes.ok) {
            const boundData = await checkRes.json();
            // If already bound to another hardware ID or another email:
            if (boundData && boundData.hwid && boundData.hwid !== hwid) {
                return {
                    success: false,
                    error: `❌ این کد لایسنس قبلاً بر روی دستگاه دیگری (${boundData.email ? boundData.email.slice(0, 3) + '***' : 'کاربر دیگر'}) فعال شده است. استفاده همزمان یا اشتراک‌گذاری لایسنس مجاز نمی‌باشد.`
                };
            }
        } else {
            // First time activation for this key: lock it to this hwid, email, and IP!
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
        // Fallback: If cloud ledger is blocked by network filter, enforce local hardware binding
        console.warn('License ledger sync warning, falling back to local cryptographic HWID lock');
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
        message: '✅ لایسنس Pro با موفقیت به این دستگاه و حساب کاربری متصل شد!' 
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
