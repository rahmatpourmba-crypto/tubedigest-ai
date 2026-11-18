// TubeDigest AI - Popup Script 4.0 (Full i18n & Anti-Piracy Device Binding)

const POPUP_I18N = {
    fa: {
        statusActive: 'موتور شناختی فعال',
        statusPro: 'نسخه Pro دائمی',
        unlimited: 'دسترسی نامحدود 👑',
        usageText: '{n} از ۳ استفاده شده',
        saveBtn: 'ذخیره',
        activateBtn: 'فعالسازی',
        savedSuccess: '✅ با موفقیت ذخیره شد!',
        readyMsg: '✅ موتور شناختی آماده فعالیت است',
        copiedWallet: '✅ کپی شد!',
        copyBtn: '📋 کپی',
        licenseActive: 'لایسنس فعال است',
        verifying: 'در حال بررسی...'
    },
    en: {
        statusActive: 'Neural Engine Active',
        statusPro: 'Lifetime Pro Active',
        unlimited: 'Unlimited Access 👑',
        usageText: '{n} of 3 free used',
        saveBtn: 'Save',
        activateBtn: 'Activate',
        savedSuccess: '✅ Saved successfully!',
        readyMsg: '✅ Cognitive Engine is Ready',
        copiedWallet: '✅ Copied!',
        copyBtn: '📋 Copy',
        licenseActive: 'License is Active',
        verifying: 'Verifying...'
    },
    ar: {
        statusActive: 'المحرك المعرفي نشط',
        statusPro: 'باقة Pro مدى الحياة',
        unlimited: 'وصول غير محدود 👑',
        usageText: 'تم استهلاك {n} من ٣',
        saveBtn: 'حفظ',
        activateBtn: 'تفعيل',
        savedSuccess: '✅ تم الحفظ بنجاح!',
        readyMsg: '✅ المحرك الذكي جاهز للعمل',
        copiedWallet: '✅ تم النسخ!',
        copyBtn: '📋 نسخ',
        licenseActive: 'الترخيص نشط',
        verifying: 'جارٍ التحقق...'
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const statusBadge = document.getElementById('statusBadge');
    const licenseEmailInput = document.getElementById('licenseEmailInput');
    const licenseKeyInput = document.getElementById('licenseKeyInput');
    const activateBtn = document.getElementById('activateBtn');
    const licenseMsg = document.getElementById('licenseMsg');
    const usagePill = document.getElementById('usagePill');
    const langBtns = document.querySelectorAll('.lang-btn');

    const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const apiMsg = document.getElementById('apiMsg');
    const copyPopupWalletBtn = document.getElementById('copyPopupWalletBtn');

    let currentLang = 'fa';
    const hwid = await getOrCreateHWID();

    function getT() {
        return POPUP_I18N[currentLang] || POPUP_I18N.fa;
    }

    function applyI18n(isPro, count) {
        const t = getT();
        const isRtl = currentLang === 'fa' || currentLang === 'ar';
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;

        if (isPro) {
            statusBadge.innerText = t.statusPro;
            usagePill.innerText = t.unlimited;
        } else {
            statusBadge.innerText = t.statusActive;
            usagePill.innerText = t.usageText.replace('{n}', count);
            if (count >= 3) usagePill.style.color = '#ef4444';
        }

        if (saveApiKeyBtn) saveApiKeyBtn.innerText = t.saveBtn;
        if (activateBtn) activateBtn.innerText = t.activateBtn;
        if (copyPopupWalletBtn) copyPopupWalletBtn.innerText = t.copyBtn;
    }

    // Load Pro Status, Language & API Key from Chrome Storage
    chrome.storage.local.get([
        'tubedigest_pro', 
        'tubedigest_bound_hwid', 
        'tubedigest_bound_email', 
        'tubedigest_free_count', 
        'tubedigest_lang', 
        'gemini_api_key'
    ], (result) => {
        const isPro = result.tubedigest_pro === true && (result.tubedigest_bound_hwid === hwid || result.tubedigest_bound_hwid === 'ALL');
        const count = Number(result.tubedigest_free_count) || 0;
        currentLang = result.tubedigest_lang || 'fa';

        applyI18n(isPro, count);

        if (isPro) {
            setProUI(result.tubedigest_bound_email);
        }

        if (result.gemini_api_key) {
            geminiApiKeyInput.value = result.gemini_api_key;
            apiMsg.className = 'msg success';
            apiMsg.innerText = getT().readyMsg;
        }

        langBtns.forEach(btn => {
            if (btn.dataset.lang === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });

    // Save Cloud Engine Key
    saveApiKeyBtn.addEventListener('click', () => {
        const key = geminiApiKeyInput.value.trim();
        if (!key) {
            apiMsg.className = 'msg error';
            apiMsg.innerText = currentLang === 'en' ? 'Please enter a valid key.' : 'لطفاً کلید معتبر وارد فرمایید.';
            return;
        }

        chrome.storage.local.set({ gemini_api_key: key }, () => {
            const t = getT();
            apiMsg.className = 'msg success';
            apiMsg.innerText = t.savedSuccess;
            setTimeout(() => { apiMsg.innerText = t.readyMsg; }, 2000);
        });
    });

    // Handle Language Click
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            chrome.storage.local.set({ tubedigest_lang: currentLang });
            chrome.storage.local.get(['tubedigest_pro', 'tubedigest_free_count'], (res) => {
                applyI18n(res.tubedigest_pro === true, Number(res.tubedigest_free_count) || 0);
            });
        });
    });

    // Anti-Piracy Hardware & Account Bound License Activation
    activateBtn.addEventListener('click', () => {
        const key = licenseKeyInput.value.trim().toUpperCase();
        const email = (licenseEmailInput ? licenseEmailInput.value.trim() : '');
        const t = getT();

        if (!key) {
            licenseMsg.className = 'msg error';
            licenseMsg.innerText = currentLang === 'en' ? 'Please enter license key.' : 'لطفاً کد لایسنس را وارد فرمایید.';
            return;
        }

        activateBtn.innerText = t.verifying;
        activateBtn.disabled = true;

        chrome.runtime.sendMessage({
            action: 'activate-license',
            licenseKey: key,
            email: email,
            hwid: hwid
        }, (res) => {
            activateBtn.innerText = t.activateBtn;
            activateBtn.disabled = false;

            if (res && res.success) {
                setProUI(email);
                licenseMsg.className = 'msg success';
                licenseMsg.innerText = res.message || '✅ Pro Activated!';
            } else {
                licenseMsg.className = 'msg error';
                licenseMsg.innerText = res ? res.error : '❌ Invalid License Key.';
            }
        });
    });

    if (copyPopupWalletBtn) {
        copyPopupWalletBtn.addEventListener('click', () => {
            const t = getT();
            navigator.clipboard.writeText('TZ565aUJX6hhFjmLekK7JZzv2S3wpgFVTZ').then(() => {
                copyPopupWalletBtn.innerText = t.copiedWallet;
                setTimeout(() => { copyPopupWalletBtn.innerText = t.copyBtn; }, 1800);
            });
        });
    }

    function setProUI(email) {
        const t = getT();
        statusBadge.innerText = t.statusPro;
        statusBadge.style.color = '#34d399';
        statusBadge.style.borderColor = 'rgba(52, 211, 153, 0.5)';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        const usdtCard = document.getElementById('usdtCard');
        if (usdtCard) usdtCard.style.display = 'none';
        usagePill.innerText = t.unlimited;
        usagePill.style.color = '#34d399';
        if (licenseKeyInput) licenseKeyInput.placeholder = t.licenseActive;
    }

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
});
