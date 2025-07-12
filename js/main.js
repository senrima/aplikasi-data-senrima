// --- KONFIGURASI PENTING ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyVbphA9RsRkdx7yg_WOrk8ZqhoNeD7602D-RP_OQbxgS-tNmAXxzUUSY-SyXBG5ivO/exec";

// --- Fungsi Helper ---
async function handleApiCall(buttonId, payload, onSuccess) {
    const btn = document.getElementById(buttonId);
    const originalText = btn.textContent;
    const statusMessage = document.getElementById('status-message');
    
    setLoading(btn, true, 'Memproses...');
    setStatus(statusMessage, '', false);
    try {
        const result = await callAppsScript(payload);
        if (result.status === 'success') {
            setStatus(statusMessage, result.message, false);
            if (onSuccess) onSuccess(result);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        setStatus(statusMessage, error.message, true);
    } finally {
        setLoading(btn, false, originalText);
    }
}

async function callAppsScript(payload) {
    const res = await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

function setStatus(element, message, isError) {
    element.textContent = message;
    element.className = `text-sm text-center mt-4 h-5 ${isError ? 'text-red-600' : 'text-green-600'}`;
}

function setLoading(button, isLoading, loadingText) {
    const defaultText = button.textContent;
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> <span>${loadingText}</span>`;
    } else {
        button.disabled = false;
        button.innerHTML = defaultText;
    }
}

// --- Event Listeners untuk setiap halaman ---
document.addEventListener('DOMContentLoaded', () => {
    // Logika untuk halaman pendaftaran (daftar.html)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            handleApiCall('register-btn', { action: 'register', name, email }, (result) => {
                alert(result.message);
                window.location.href = 'index.html'; // Arahkan ke halaman login
            });
        });
    }

    // Logika untuk halaman login (index.html)
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            // Simpan email untuk digunakan di halaman OTP
            sessionStorage.setItem('userEmailForOTP', email);
            handleApiCall('request-otp-btn', { action: 'requestOTP', email, password }, (result) => {
                // Di sini kita akan menyimpan status bahwa OTP sudah diminta
                sessionStorage.setItem('otpRequested', 'true');
                window.location.href = 'otp.html'; // Arahkan ke halaman OTP
            });
        });
    }
    
    // Logika untuk halaman Lupa Password (misalnya, di dalam index.html atau halaman terpisah)
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            handleApiCall('forgot-btn', { action: 'forgotPassword', email }, (result) => {
                alert(result.message);
            });
        });
    }

    // Logika untuk halaman Reset Password (reset.html)
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (!token) {
            document.body.innerHTML = "<h1>Token reset tidak valid.</h1>";
            return;
        }
        
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            if (newPassword !== confirmPassword) {
                setStatus(document.getElementById('status-message'), "Password baru tidak cocok.", true);
                return;
            }
            handleApiCall('reset-password-btn', { action: 'resetPassword', token, newPassword }, (result) => {
                alert(result.message);
                window.location.href = 'index.html';
            });
        });
    }
});
