// TubeDigest AI - YouTube Content Script 4.0 (Full i18n & Direct USDT Gateway)
console.log('%c[TubeDigest AI] 4.0 Active with Full Multi-Language System', 'color: #ff0055; font-weight: 900;');

const HARDCODED_KEY = '';
let currentVideoId = null;
let currentSessionId = 0;
let selectedLanguage = 'fa'; // Default Persian
const videoCache = new Map(); // Key: `${videoId}_${lang}`, Value: summaryData

// Full Multi-Language Dictionary (i18n)
const I18N = {
    fa: {
        btnLabel: '✨ AI خلاصه هوشمند',
        appTitle: '✨ دستیار هوشمند تحلیل محتوا | TubeDigest AI',
        loadingText: 'موتور هوشمند TubeDigest در حال پردازش شناختی، واکاوی عمیق و تدوین خلاصه اجرایی...',
        closeTitle: 'بستن',
        freeBannerTitle: '🎁 شما در حال استفاده از پلن آزمایشی هستید',
        freeBannerRemaining: 'باقی‌مانده: {n} از ۳ خلاصه رایگان',
        paywallTitle: 'سقف استفاده رایگان به پایان رسید',
        paywallDesc: 'شما از هر <b>۳ فرصت رایگان</b> خود استفاده نموده‌اید. برای تحلیل هوشمند، نامحدود و دسترسی همیشگی به تمامی ویدیوها، لایسنس <b>TubeDigest Pro</b> را فعال فرمایید.',
        features: [
            '✔ تحلیل نامحدود و بدون سقف روزانه',
            '✔ استخراج عمیق پیام نهایی (The Big Takeaway)',
            '✔ نشانه‌گذاری زمانی تعاملی و پرش به ویدیو',
            '✔ فعال‌سازی مادام‌العمر و بدون اشتراک ماهانه'
        ],
        depositBoxTitle: '👑 واریز مستقیم ۴.۹۹ تتر (USDT)',
        depositNetwork: 'TRON (TRC-20)',
        depositStep1: '<b>گام اول:</b> مبلغ <b>4.99 USDT</b> را با اسکن کیوآرکد بالا یا به آدرس زیر در شبکه <b>TRC-20</b> واریز فرمایید.',
        depositStep2: '<b>گام دوم:</b> پس از واریز در کیف‌پول خود (تراست‌ولت، صرافی و...)، کد پیگیری یا <b>شناسه تراکنش (TxID)</b> را کپی کنید.',
        depositStep3: '<b>گام سوم:</b> ایمیل و شناسه TxID را در کادر زیر وارد کرده و دکمه تایید را بزنید تا لایسنس شما <b>آنی فعال شود</b>.',
        copyWalletBtn: '📋 کپی آدرس',
        copiedWalletBtn: '✅ کپی شد!',
        activationTitle: 'فرم تایید و فعالسازی آنی لایسنس:',
        emailPlaceholder: 'ایمیل شما (مثال: user@gmail.com)',
        keyPlaceholder: 'شناسه تراکنش TxID یا کد لایسنس',
        activateSubmitBtn: '✨ تایید و فعالسازی آنی',
        activateLoading: 'در حال بررسی...',
        secConclusion: '👑 پیام نهایی و مغز کلام ویدیو (THE BIG TAKEAWAY)',
        secTakeaway: '⚡ خلاصه فشرده و اجرایی ۳۰ ثانیه‌ای',
        secHighlights: '📌 مهم‌ترین نکات کلیدی و استدلال‌های مطرح‌شده گوینده',
        secLessons: '💡 درس‌ها و پیام‌های کاربردی برای بیننده',
        secTimeline: '⏱️ نشانه‌گذاری‌های زمانی و مباحث مطرح‌شده (پرش با کلیک)',
        copySummaryBtn: '📋 کپی خلاصه محتوی ویدیو',
        copiedSummaryBtn: '✅ با موفقیت کپی شد!',
        upgradeLink: '👑 ارتقا به نسخه Pro نامحدود با تتر ↗',
        errAi: '⚠️ خطا در دریافت پاسخ از هسته تحلیلی: {err}. لطفاً فیلترشکن خود را بررسی کرده و مجدداً تلاش فرمایید.'
    },
    en: {
        btnLabel: '✨ AI Smart Digest',
        appTitle: '✨ Cognitive Content Analysis | TubeDigest AI',
        loadingText: 'TubeDigest Neural Engine is synthesizing insights and extracting core takeaways...',
        closeTitle: 'Close',
        freeBannerTitle: '🎁 Free Trial Mode Active',
        freeBannerRemaining: 'Remaining: {n} of 3 free summaries',
        paywallTitle: 'Free Summary Limit Reached',
        paywallDesc: 'You have used all <b>3 free video summaries</b>. To unlock unlimited, high-speed executive analyses for all YouTube videos, activate <b>TubeDigest Pro</b>.',
        features: [
            '✔ Unlimited video summaries without daily caps',
            '✔ Deep extraction of The Big Takeaway & thesis',
            '✔ Interactive chapter seek timestamps',
            '✔ Lifetime license with zero recurring fees'
        ],
        depositBoxTitle: '👑 Direct Instant Deposit: 4.99 USDT',
        depositNetwork: 'TRON (TRC-20)',
        depositStep1: '<b>Step 1:</b> Send <b>4.99 USDT</b> via <b>TRON (TRC-20)</b> network by scanning the QR code or copying the address below.',
        depositStep2: '<b>Step 2:</b> After transferring in your wallet (Trust Wallet, Binance, etc.), copy your <b>Transaction Hash / TxID</b>.',
        depositStep3: '<b>Step 3:</b> Enter your email and TxID below, then click Verify to unlock your lifetime Pro license <b>instantly</b>!',
        copyWalletBtn: '📋 Copy Address',
        copiedWalletBtn: '✅ Copied!',
        activationTitle: 'Instant License Verification & Activation Form:',
        emailPlaceholder: 'Your Email (e.g. user@gmail.com)',
        keyPlaceholder: 'Transaction Hash (TxID) or License Key',
        activateSubmitBtn: '✨ Verify & Activate Now',
        activateLoading: 'Verifying...',
        secConclusion: '👑 Core Thesis & Grand Conclusion (THE BIG TAKEAWAY)',
        secTakeaway: '⚡ 30-Second Executive Brief',
        secHighlights: '📌 Key Arguments, Facts & Turning Points',
        secLessons: '💡 Actionable Lessons & Strategic Takeaways',
        secTimeline: '⏱️ Interactive Chapters & Timestamps (Click to Seek)',
        copySummaryBtn: '📋 Copy Video Summary & Content',
        copiedSummaryBtn: '✅ Copied to clipboard!',
        upgradeLink: '👑 Upgrade to Unlimited Pro with USDT ↗',
        errAi: '⚠️ Error receiving response from cognitive engine: {err}. Please check your connection and try again.'
    },
    ar: {
        btnLabel: '✨ AI الملخص الذكي',
        appTitle: '✨ التحليل المعرفي للمحتوى | TubeDigest AI',
        loadingText: 'محرك TubeDigest الذكي يقوم بالتحليل المعمق واستخراج خلاصة الفيديو التنفيذية...',
        closeTitle: 'إغلاق',
        freeBannerTitle: '🎁 أنت تستخدم الباقة التجريبية المجانية',
        freeBannerRemaining: 'المتبقي: {n} من ٣ ملخصات مجانية',
        paywallTitle: 'تم استنفاد الحد المجاني للملخصات',
        paywallDesc: 'لقد استنفدت جميع <b>الملخصات المجانية الـ٣</b>. لفتح التحليلات الذكية غير المحدودة لجميع مقاطع يوتيوب، قم بتفعيل باقة <b>TubeDigest Pro</b> مدى الحياة.',
        features: [
            '✔ تحليلات غير محدودة بدون سقف يومي',
            '✔ استخراج معمق للفكرة الجوهرية (The Big Takeaway)',
            '✔ فصول زمنية تفاعلية للانتقال الفوري في الفيديو',
            '✔ ترخيص دائم مدى الحياة دون أي اشتراكات دورية'
        ],
        depositBoxTitle: '👑 إيداع مباشر بقيمة 4.99 تيثر (USDT)',
        depositNetwork: 'TRON (TRC-20)',
        depositStep1: '<b>الخطوة ١:</b> أرسل مبلغ <b>4.99 USDT</b> عبر شبكة <b>TRON (TRC-20)</b> بمسح رمز الاستجابة السريعة أعلاه أو نسخ العنوان أدناه.',
        depositStep2: '<b>الخطوة ٢:</b> بعد التحويل من محفظتك (Trust Wallet أو أي منصة)، انسخ <b>معرّف المعاملة (TxID / Hash)</b>.',
        depositStep3: '<b>الخطوة ٣:</b> أدخل بريدك الإلكتروني ومعرّف TxID في الحقل أدناه واضغط على تفعيل لفتح باقة Pro <b>فورياً</b>!',
        copyWalletBtn: '📋 نسخ العنوان',
        copiedWalletBtn: '✅ تم النسخ!',
        activationTitle: 'نموذج التحقق والتفعيل الفوري للترخيص:',
        emailPlaceholder: 'بريدك الإلكتروني (مثال: user@gmail.com)',
        keyPlaceholder: 'معرّف المعاملة (TxID) أو رمز الترخيص',
        activateSubmitBtn: '✨ التحقق والتفعيل الفوري',
        activateLoading: 'جارٍ التحقق...',
        secConclusion: '👑 الفكرة الجوهرية والخلاصة النهائية (THE BIG TAKEAWAY)',
        secTakeaway: '⚡ ملخص تنفيذي مكثف في ٣٠ ثانية',
        secHighlights: '📌 أهم النقاط المحورية والحجج المطروحة في الفيديو',
        secLessons: '💡 الدروس التطبيقية والنصائح العملية للمشاهد',
        secTimeline: '⏱️ الفصول الزمنية التفاعلية (انقر للانتقال)',
        copySummaryBtn: '📋 نسخ ملخص ومحتوى الفيديو',
        copiedSummaryBtn: '✅ تم النسخ بنجاح!',
        upgradeLink: '👑 الترقية إلى باقة Pro غير المحدودة عبر تيثر ↗',
        errAi: '⚠️ خطأ في تلقي الرد من المحرك الذكي: {err}. يرجى التحقق من الاتصال والمحاولة مجدداً.'
    }
};

function getT() {
    return I18N[selectedLanguage] || I18N.fa;
}

// Initialize settings from storage
chrome.storage.local.get(['tubedigest_lang', 'gemini_api_key'], (res) => {
    if (res.tubedigest_lang) selectedLanguage = res.tubedigest_lang;
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.tubedigest_lang) {
        selectedLanguage = changes.tubedigest_lang.newValue;
        updateLangButtonLabel();
        const existing = document.getElementById('tubedigest-panel');
        if (existing) createAndShowPanel();
    }
});

// Watch for YouTube SPA navigation events
init();
window.addEventListener('yt-navigate-finish', handleVideoNavigation);
window.addEventListener('yt-page-data-updated', handleVideoNavigation);
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

setInterval(() => {
    if (window.location.pathname.startsWith('/watch')) {
        const urlParams = new URLSearchParams(window.location.search);
        const v = urlParams.get('v');
        if (v && v !== currentVideoId) {
            handleVideoNavigation();
        }
        ensureButtonExists();
    }
}, 800);

function init() {
    handleVideoNavigation();
}

function handleVideoNavigation() {
    if (!window.location.pathname.startsWith('/watch')) return;
    const urlParams = new URLSearchParams(window.location.search);
    const newVideoId = urlParams.get('v');

    if (newVideoId && newVideoId !== currentVideoId) {
        currentVideoId = newVideoId;
        currentSessionId++; // Invalidate pending requests from the old video
        removeExistingPanel();
    }
    ensureButtonExists();
}

function ensureButtonExists() {
    if (document.getElementById('tubedigest-action-btn')) return;

    const ownerContainer = document.querySelector('#above-the-fold #owner') || 
                           document.querySelector('#owner') ||
                           document.querySelector('ytd-watch-metadata #owner');

    const actionsContainer = document.querySelector('#top-level-buttons-computed') || 
                             document.querySelector('#actions-inner') ||
                             document.querySelector('#actions') ||
                             document.querySelector('#menu #top-level-buttons-computed');

    const target = ownerContainer || actionsContainer;
    if (target) {
        injectButton(target, target === ownerContainer);
    }
}

function injectButton(container, isOwner) {
    if (document.getElementById('tubedigest-action-btn')) return;

    const t = getT();
    const btn = document.createElement('button');
    btn.id = 'tubedigest-action-btn';
    btn.className = 'tubedigest-btn';
    btn.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
        </svg>
        <span id="td-main-btn-text">${t.btnLabel}</span>
    `;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSummaryPanel();
    });

    const langBtn = document.createElement('button');
    langBtn.id = 'tubedigest-lang-toggle-btn';
    langBtn.className = 'tubedigest-lang-pill-btn';
    langBtn.title = 'Language / تغییر زبان';
    langBtn.innerHTML = `🌐 <span id="td-lang-label">${getLangName(selectedLanguage)}</span> ▾`;

    langBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cycleNextLanguage();
    });

    const wrapper = document.createElement('div');
    wrapper.id = 'tubedigest-btn-wrapper';
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '10px';
    wrapper.appendChild(btn);
    wrapper.appendChild(langBtn);

    if (isOwner) {
        container.appendChild(wrapper);
    } else if (container.firstChild) {
        container.insertBefore(wrapper, container.firstChild);
    } else {
        container.appendChild(wrapper);
    }
}

function getLangName(code) {
    const map = { fa: 'فارسی', en: 'English', ar: 'العربية' };
    return map[code] || 'فارسی';
}

function updateLangButtonLabel() {
    const label = document.getElementById('td-lang-label');
    if (label) label.innerText = getLangName(selectedLanguage);

    const btnText = document.getElementById('td-main-btn-text');
    if (btnText) btnText.innerText = getT().btnLabel;
}

function cycleNextLanguage() {
    const langs = ['fa', 'en', 'ar'];
    const idx = langs.indexOf(selectedLanguage);
    selectedLanguage = langs[(idx + 1) % langs.length];
    chrome.storage.local.set({ tubedigest_lang: selectedLanguage });
    updateLangButtonLabel();
    createAndShowPanel();
}

function toggleSummaryPanel() {
    const existing = document.getElementById('tubedigest-panel');
    if (existing) {
        existing.remove();
        return;
    }
    createAndShowPanel();
}

function removeExistingPanel() {
    const p = document.getElementById('tubedigest-panel');
    if (p) p.remove();
}

// Unique Hardware Fingerprint Generator (HWID)
async function getOrCreateHWID() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['tubedigest_hwid'], (res) => {
            if (res.tubedigest_hwid) {
                resolve(res.tubedigest_hwid);
            } else {
                const navInfo = navigator.userAgent + screen.width + 'x' + screen.height + navigator.language;
                let hash = 0;
                for (let i = 0; i < navInfo.length; i++) {
                    hash = ((hash << 5) - hash) + navInfo.charCodeAt(i);
                    hash |= 0;
                }
                const newHwid = 'TD-HW-' + Math.abs(hash).toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                chrome.storage.local.set({ tubedigest_hwid: newHwid }, () => resolve(newHwid));
            }
        });
    });
}

async function checkProStatus() {
    const hwid = await getOrCreateHWID();
    const data = await new Promise(res => chrome.storage.local.get([
        'tubedigest_pro', 
        'tubedigest_bound_hwid', 
        'tubedigest_free_count'
    ], res));

    const isPro = data.tubedigest_pro === true && (data.tubedigest_bound_hwid === hwid || data.tubedigest_bound_hwid === 'ALL');
    const freeCount = Number(data.tubedigest_free_count) || 0;

    return { isPro, freeCount, hwid };
}

// Extract current video details accurately
async function extractCurrentVideoData() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v') || currentVideoId;

    let title = '';
    const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
                    document.querySelector('h1.ytd-watch-metadata') || 
                    document.querySelector('h1.title');
    if (titleEl && titleEl.innerText.trim()) {
        title = titleEl.innerText.trim();
    } else {
        title = document.title.replace(' - YouTube', '').trim();
    }

    const channelEl = document.querySelector('#owner #channel-name a') || 
                      document.querySelector('#channel-name');
    const channelName = channelEl ? channelEl.innerText.trim() : '';

    const descEl = document.querySelector('#description-inline-expander') || 
                   document.querySelector('#description yt-formatted-string') ||
                   document.querySelector('#description') || 
                   document.querySelector('ytd-text-inline-expander');
    let textBody = descEl ? descEl.innerText.trim() : '';

    try {
        const transcriptCues = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (transcriptCues.length > 0) {
            const lines = [];
            transcriptCues.forEach(cue => {
                const txt = cue.querySelector('.segment-text')?.innerText?.trim();
                if (txt) lines.push(txt);
            });
            if (lines.length > 0) {
                textBody = 'Subtitles / Transcript:\n' + lines.join(' ') + '\n\n' + textBody;
            }
        }
    } catch (e) {}

    return { videoId, title, channelName, textBody };
}

async function createAndShowPanel() {
    removeExistingPanel();

    const targetParent = document.querySelector('#below') || 
                         document.querySelector('#primary-inner') || 
                         document.querySelector('#columns');

    if (!targetParent) return;

    const thisSessionId = ++currentSessionId;
    const urlParams = new URLSearchParams(window.location.search);
    const thisVideoId = urlParams.get('v');

    const storage = await new Promise(res => chrome.storage.local.get(['gemini_api_key', 'tubedigest_lang'], res));
    if (storage.tubedigest_lang) selectedLanguage = storage.tubedigest_lang;

    const apiKey = storage.gemini_api_key || HARDCODED_KEY;
    const isRtl = selectedLanguage === 'fa' || selectedLanguage === 'ar';
    const t = getT();

    const panel = document.createElement('div');
    panel.id = 'tubedigest-panel';
    panel.className = isRtl ? 'rtl' : 'ltr';
    panel.dir = isRtl ? 'rtl' : 'ltr';

    panel.innerHTML = `
        <div class="tubedigest-header">
            <div class="tubedigest-title-group">
                <span class="tubedigest-title">${t.appTitle}</span>
                <span class="tubedigest-badge">AI Neural Core 4.0</span>
            </div>

            <!-- Language Pills Bar -->
            <div class="tubedigest-lang-pills">
                <button class="td-pill ${selectedLanguage === 'fa' ? 'active' : ''}" data-lang="fa">🇮🇷 فارسی</button>
                <button class="td-pill ${selectedLanguage === 'en' ? 'active' : ''}" data-lang="en">🇬🇧 English</button>
                <button class="td-pill ${selectedLanguage === 'ar' ? 'active' : ''}" data-lang="ar">🇸🇦 العربية</button>
            </div>

            <div class="tubedigest-actions">
                <button class="tubedigest-tool-btn" id="td-close-btn" title="${t.closeTitle}">✕</button>
            </div>
        </div>

        <div id="td-content-area">
            <div style="display:flex; align-items:center; gap:18px; color:#ffffff; padding: 36px 12px; font-size: 17px; font-weight:800;">
                <div style="width:32px; height:32px; border:4px solid #8b5cf6; border-top-color:#ff0055; border-radius:50%; animation:tubePulse 1s linear infinite; box-shadow: 0 0 20px rgba(139, 92, 246, 0.7);"></div>
                <span>${t.loadingText}</span>
            </div>
        </div>
    `;

    targetParent.insertBefore(panel, targetParent.firstChild);

    setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    document.getElementById('td-close-btn').addEventListener('click', () => panel.remove());

    panel.querySelectorAll('.td-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            selectedLanguage = pill.dataset.lang;
            chrome.storage.local.set({ tubedigest_lang: selectedLanguage });
            updateLangButtonLabel();
            createAndShowPanel();
        });
    });

    const contentArea = document.getElementById('td-content-area');

    // Check Pro Status & 3-Video Free Limit
    const { isPro, freeCount, hwid } = await checkProStatus();

    if (!isPro && freeCount >= 3) {
        renderPaywallLock(contentArea, freeCount, hwid);
        return;
    }

    // Check Cache first for THIS video and THIS language
    const cacheKey = `${thisVideoId}_${selectedLanguage}`;
    if (videoCache.has(cacheKey)) {
        renderGeminiResult(contentArea, videoCache.get(cacheKey), isPro, freeCount);
        return;
    }

    // Show Free Usage Banner if not pro
    if (!isPro) {
        const remaining = Math.max(0, 3 - freeCount);
        contentArea.insertAdjacentHTML('afterbegin', `
            <div class="tubedigest-free-usage-banner" id="td-free-banner">
                <span>${t.freeBannerTitle}</span>
                <span class="td-count-pill">${t.freeBannerRemaining.replace('{n}', remaining)}</span>
            </div>
        `);
    }

    // Extract current video data
    const videoData = await extractCurrentVideoData();

    chrome.runtime.sendMessage({
        action: 'gemini-summary',
        videoId: thisVideoId,
        title: videoData.title,
        channel: videoData.channelName,
        transcript: videoData.textBody,
        lang: selectedLanguage,
        apiKey: apiKey
    }, (response) => {
        const currentUrlV = new URLSearchParams(window.location.search).get('v');
        if (thisSessionId !== currentSessionId || currentUrlV !== thisVideoId) {
            console.log('[TubeDigest AI] Ignored outdated response for video:', thisVideoId);
            return;
        }

        if (!response || !response.success) {
            contentArea.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.15); border: 2px solid #ef4444; border-radius: 16px; padding: 22px; color: #fecaca; font-size: 16px; line-height: 2;">
                    ${t.errAi.replace('{err}', response ? response.error : 'Network Timeout')}
                </div>
            `;
            return;
        }

        if (!isPro) {
            chrome.storage.local.set({ tubedigest_free_count: freeCount + 1 });
        }

        videoCache.set(cacheKey, response.data);
        renderGeminiResult(contentArea, response.data, isPro, freeCount + 1);
    });
}

function renderPaywallLock(container, count, hwid) {
    const isRtl = selectedLanguage === 'fa' || selectedLanguage === 'ar';
    const t = getT();

    container.innerHTML = `
        <div class="tubedigest-paywall-card">
            <div class="tubedigest-paywall-icon">🔒</div>
            <div class="tubedigest-paywall-title">
                ${t.paywallTitle}
            </div>
            <div class="tubedigest-paywall-desc">
                ${t.paywallDesc}
            </div>

            <div class="tubedigest-paywall-features">
                ${t.features.map(f => `<div class="tubedigest-paywall-feature-item">${f}</div>`).join('')}
            </div>

            <!-- Direct USDT Gateway Box with Step-by-Step Guide -->
            <div class="tubedigest-direct-pay-box">
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                    <span style="font-weight:900; color:#fbbf24; font-size:15px;">${t.depositBoxTitle}</span>
                    <span class="tubedigest-net-badge">${t.depositNetwork}</span>
                </div>

                <div class="tubedigest-qr-wrapper">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TZ565aUJX6hhFjmLekK7JZzv2S3wpgFVTZ" alt="USDT QR" class="tubedigest-qr-img">
                </div>

                <!-- 3-Step Clear Instruction Guide -->
                <div class="tubedigest-steps-list">
                    <div class="tubedigest-step-row">
                        <span class="tubedigest-step-num">1</span>
                        <span>${t.depositStep1}</span>
                    </div>
                    <div class="tubedigest-step-row">
                        <span class="tubedigest-step-num">2</span>
                        <span>${t.depositStep2}</span>
                    </div>
                    <div class="tubedigest-step-row">
                        <span class="tubedigest-step-num">3</span>
                        <span>${t.depositStep3}</span>
                    </div>
                </div>

                <div class="tubedigest-wallet-container">
                    <span class="tubedigest-wallet-addr" id="td-wallet-address">TZ565aUJX6hhFjmLekK7JZzv2S3wpgFVTZ</span>
                    <button id="td-copy-wallet-btn" class="tubedigest-wallet-copy-btn">${t.copyWalletBtn}</button>
                </div>
            </div>

            <!-- In-Page License Activation Form -->
            <div class="tubedigest-activation-container">
                <div style="font-size: 14.5px; font-weight: 800; color: #f1f5f9; text-align: center;">
                    ${t.activationTitle}
                </div>
                <div class="tubedigest-activation-inputs">
                    <input type="email" id="td-inpage-email" class="tubedigest-activation-input" placeholder="${t.emailPlaceholder}">
                    <input type="text" id="td-inpage-key" class="tubedigest-activation-input" placeholder="${t.keyPlaceholder}">
                    <button id="td-inpage-activate-btn" class="tubedigest-activation-submit-btn">${t.activateSubmitBtn}</button>
                </div>
                <div id="td-inpage-msg" class="tubedigest-act-msg"></div>
            </div>
        </div>
    `;

    const copyWalletBtn = document.getElementById('td-copy-wallet-btn');
    if (copyWalletBtn) {
        copyWalletBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('TZ565aUJX6hhFjmLekK7JZzv2S3wpgFVTZ').then(() => {
                copyWalletBtn.innerText = t.copiedWalletBtn;
                setTimeout(() => { copyWalletBtn.innerText = t.copyWalletBtn; }, 1800);
            });
        });
    }

    const emailInput = document.getElementById('td-inpage-email');
    const keyInput = document.getElementById('td-inpage-key');
    const activateBtn = document.getElementById('td-inpage-activate-btn');
    const msgEl = document.getElementById('td-inpage-msg');

    activateBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const key = keyInput.value.trim();

        if (!key) {
            msgEl.className = 'tubedigest-act-msg error';
            msgEl.innerText = selectedLanguage === 'en' 
                ? 'Please enter your TxID or License Key.' 
                : (selectedLanguage === 'ar' ? 'يرجى إدخال معرّف المعاملة أو رمز الترخيص.' : 'لطفاً کد لایسنس یا شناسه TxID را وارد فرمایید.');
            return;
        }

        activateBtn.innerText = t.activateLoading;
        activateBtn.disabled = true;

        chrome.runtime.sendMessage({
            action: 'activate-license',
            licenseKey: key,
            email: email,
            hwid: hwid
        }, (res) => {
            activateBtn.innerText = t.activateSubmitBtn;
            activateBtn.disabled = false;

            if (res && res.success) {
                msgEl.className = 'tubedigest-act-msg success';
                msgEl.innerText = res.message || '✅ لایسنس با موفقیت فعال شد!';
                setTimeout(() => {
                    createAndShowPanel();
                }, 1200);
            } else {
                msgEl.className = 'tubedigest-act-msg error';
                msgEl.innerText = res ? res.error : 'خطا در فعال‌سازی لایسنس.';
            }
        });
    });
}

function renderGeminiResult(container, data, isPro, currentUsageCount) {
    const t = getT();

    container.innerHTML = `
        <!-- 1. The Big Takeaway (Golden Highlight Box) -->
        <div class="tubedigest-conclusion-box">
            <div class="tubedigest-conclusion-title">${t.secConclusion}</div>
            <div class="tubedigest-conclusion-text">${data.conclusion}</div>
        </div>

        <!-- 2. 30-Second Quick Takeaway -->
        <div class="tubedigest-takeaway">
            <div class="tubedigest-takeaway-title">${t.secTakeaway}</div>
            <div class="tubedigest-takeaway-text">${data.takeaway}</div>
        </div>

        <!-- 3. Key Highlights & Turning Points -->
        <div class="tubedigest-sec-title">${t.secHighlights}</div>
        <ul class="tubedigest-bullets">
            ${data.highlights.map(h => `<li><span style="color:#ff0055; font-weight:bold; margin-left:10px;">✦</span>${h}</li>`).join('')}
        </ul>

        <!-- 4. Actionable Lessons -->
        ${data.lessons && data.lessons.length > 0 ? `
            <div class="tubedigest-sec-title">${t.secLessons}</div>
            <ul class="tubedigest-bullets">
                ${data.lessons.map(l => `<li><span style="color:#10b981; font-weight:bold; margin-left:10px;">✔</span>${l}</li>`).join('')}
            </ul>
        ` : ''}

        <!-- 5. Interactive Timeline -->
        ${data.timeline && data.timeline.length > 0 ? `
            <div class="tubedigest-sec-title">${t.secTimeline}</div>
            <div class="tubedigest-timeline">
                ${data.timeline.map(item => `
                    <div class="tubedigest-time-item">
                        <span class="tubedigest-timestamp" data-time="${item.time}">▶ ${item.time}</span>
                        <span class="tubedigest-time-desc">${item.text}</span>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <!-- Action Bar: Copy & Upgrade -->
        <div class="tubedigest-footer-bar">
            <button id="td-real-copy-btn" class="tubedigest-copy-btn">
                ${t.copySummaryBtn}
            </button>
            ${!isPro ? `
                <button id="td-show-pay-btn" class="tubedigest-upgrade-link" style="background:none; border:none; cursor:pointer;">
                    ${t.upgradeLink}
                </button>
            ` : ''}
        </div>
    `;

    const showPayBtn = document.getElementById('td-show-pay-btn');
    if (showPayBtn) {
        showPayBtn.addEventListener('click', async () => {
            const hwid = await getOrCreateHWID();
            renderPaywallLock(container, 3, hwid);
        });
    }

    document.getElementById('td-real-copy-btn').addEventListener('click', () => {
        const textToCopy = `${t.appTitle}\n\n${t.secConclusion}\n${data.conclusion}\n\n${t.secTakeaway}\n${data.takeaway}\n\n${t.secHighlights}\n${data.highlights.join('\n')}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const btn = document.getElementById('td-real-copy-btn');
            btn.innerText = t.copiedSummaryBtn;
            setTimeout(() => { btn.innerText = t.copySummaryBtn; }, 1800);
        });
    });

    container.querySelectorAll('.tubedigest-timestamp').forEach(chip => {
        chip.addEventListener('click', () => {
            seekToTime(chip.dataset.time);
        });
    });
}

function seekToTime(timeStr) {
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const video = document.querySelector('video');
    if (video) {
        video.currentTime = seconds;
        video.play();
    }
}
