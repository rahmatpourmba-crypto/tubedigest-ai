// TubeDigest AI - Popup Script 4.0 (Anti-Piracy Device Binding)

document.addEventListener('DOMContentLoaded', async () => {
    const statusBadge = document.getElementById('statusBadge');
    const buyLink = document.getElementById('buyLink');
    const licenseEmailInput = document.getElementById('licenseEmailInput');
    const licenseKeyInput = document.getElementById('licenseKeyInput');
    const activateBtn = document.getElementById('activateBtn');
    const licenseMsg = document.getElementById('licenseMsg');
    const usagePill = document.getElementById('usagePill');
    const langBtns = document.querySelectorAll('.lang-btn');

    const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const apiMsg = document.getElementById('apiMsg');

    const hwid = await getOrCreateHWID();

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

        if (isPro) {
            setProUI(result.tubedigest_bound_email);
        } else {
            usagePill.innerText = `${count} از ۳ استفاده شده`;
            if (count >= 3) {
                usagePill.style.color = '#ef4444';
            }
        }

        if (result.gemini_api_key) {
            geminiApiKeyInput.value = result.gemini_api_key;
            apiMsg.className = 'msg success';
            apiMsg.innerText = '✅ موتور شناختی آماده فعالیت است';
        }

        const savedLang = result.tubedigest_lang || 'fa';
        langBtns.forEach(btn => {
            if (btn.dataset.lang === savedLang) {
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
            apiMsg.innerText = 'لطفاً کلید معتبر وارد فرمایید.';
            return;
        }

        chrome.storage.local.set({ gemini_api_key: key }, () => {
            apiMsg.className = 'msg success';
            apiMsg.innerText = '✅ کلید با موفقیت ذخیره شد!';
            setTimeout(() => { apiMsg.innerText = '✅ موتور شناختی آماده فعالیت است'; }, 2000);
        });
    });

    // Handle Language Click
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const newLang = btn.dataset.lang;
            chrome.storage.local.set({ tubedigest_lang: newLang });
        });
    });

    // Anti-Piracy Hardware & Account Bound License Activation
    activateBtn.addEventListener('click', () => {
        const key = licenseKeyInput.value.trim().toUpperCase();
        const email = (licenseEmailInput ? licenseEmailInput.value.trim() : '');

        if (!key) {
            licenseMsg.className = 'msg error';
            licenseMsg.innerText = 'لطفاً کد لایسنس را وارد فرمایید.';
            return;
        }

        activateBtn.innerText = 'در حال بررسی...';
        activateBtn.disabled = true;

        chrome.runtime.sendMessage({
            action: 'activate-license',
            licenseKey: key,
            email: email,
            hwid: hwid
        }, (res) => {
            activateBtn.innerText = 'فعالسازی';
            activateBtn.disabled = false;

            if (res && res.success) {
                setProUI(email);
                licenseMsg.className = 'msg success';
                licenseMsg.innerText = res.message || '✅ نسخه Pro دائمی فعال شد!';
            } else {
                licenseMsg.className = 'msg error';
                licenseMsg.innerText = res ? res.error : '❌ کد لایسنس نامعتبر است.';
            }
        });
    });

    const copyPopupWalletBtn = document.getElementById('copyPopupWalletBtn');
    if (copyPopupWalletBtn) {
        copyPopupWalletBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('TZ565aUJX6hhFjmLekK7JZzv2S3wpgFVTZ').then(() => {
                copyPopupWalletBtn.innerText = '✅ کپی شد!';
                setTimeout(() => { copyPopupWalletBtn.innerText = '📋 کپی'; }, 1800);
            });
        });
    }

    function setProUI(email) {
        statusBadge.innerText = 'نسخه Pro دائمی';
        statusBadge.style.color = '#34d399';
        statusBadge.style.borderColor = 'rgba(52, 211, 153, 0.5)';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        const usdtCard = document.getElementById('usdtCard');
        if (usdtCard) usdtCard.style.display = 'none';
        usagePill.innerText = 'دسترسی نامحدود 👑';
        usagePill.style.color = '#34d399';
        if (licenseKeyInput) licenseKeyInput.placeholder = 'لایسنس فعال است';
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
