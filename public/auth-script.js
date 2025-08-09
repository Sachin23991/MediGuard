// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// --- Your MediGuard Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyABDEVe8xJ5oVEkwO38cHPtnEZieB3vxwg",
    authDomain: "mediguard-464af.firebaseapp.com",
    projectId: "mediguard-464af",
    storageBucket: "mediguard-464af.firebasestorage.app",
    messagingSenderId: "394088242237",
    appId: "1:394088242237:web:d5f991ba15eb87d5f3de54",
    measurementId: "G-5VWK1JCDW3"
};

// --- Initialize Firebase Services ---
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// --- Main Script Execution on DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selections ---
    const forms = {
        signin: document.getElementById('signin-form'),
        signup: document.getElementById('signup-form'),
        forgot: document.getElementById('forgot-form')
    };
    let currentForm = 'signin'; // Initial state

    // --- Event Listeners ---

    // Sign In / Sign Up Toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => switchForm(btn.dataset.form));
    });

    // "Forgot Password?" Link
    document.querySelector('.forgot-password-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchForm('forgot');
    });

    // "Back to Sign In" Button
    document.getElementById('back-to-signin-btn').addEventListener('click', (e) => {
        e.preventDefault();
        switchForm('signin');
    });

    // Form Submissions
    document.getElementById('signin').addEventListener('submit', handleSignIn);
    document.getElementById('signup').addEventListener('submit', handleSignUp);
    document.getElementById('forgot-password').addEventListener('submit', handlePasswordReset);

    // Google Authentication
    document.querySelectorAll('.google-btn').forEach(btn => {
        btn.addEventListener('click', () => handleGoogleAuth(btn));
    });

    // Password Visibility Toggles
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            togglePasswordVisibility(e.currentTarget.previousElementSibling, e.currentTarget);
        });
    });

    // Password Strength Meter
    document.getElementById('signup-password').addEventListener('input', (e) => checkPasswordStrength(e.target.value));

    // --- Core Functions ---

    function switchForm(formType) {
        if (formType === currentForm) return;

        // Hide current form
        if (forms[currentForm]) forms[currentForm].classList.remove('active');
        
        // Show new form
        if (forms[formType]) forms[formType].classList.add('active');

        // Update toggle button styles
        if (formType === 'signin' || formType === 'signup') {
            document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
            const targetBtn = document.querySelector(`.toggle-btn[data-form="${formType}"]`);
            if (targetBtn) targetBtn.classList.add('active');

            // Move the slider
            const slider = document.querySelector('.toggle-slider');
            if (slider) {
                slider.style.transform = formType === 'signup' ? 'translateX(calc(100%))' : 'translateX(0)';
            }
        }
        currentForm = formType;
    }

    async function handleSignIn(e) {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const button = e.target.querySelector('.auth-btn.primary');
        if (!email || !password) return showErrorModal('Please fill in all fields.');

        showLoadingState(button);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showSuccessModal('Login successful! Redirecting...', () => {
                window.location.href = 'homepage.html';
            });
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(button, "Sign In");
        }
    }

    async function handleSignUp(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const terms = document.getElementById('terms-agreement').checked;
        const button = e.target.querySelector('.auth-btn.primary');

        if (!name || !email || !password) return showErrorModal('Please fill in all fields.');
        if (!terms) return showErrorModal('You must agree to the Terms & Privacy Policy.');

        showLoadingState(button);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            await createUserDocument(user, name);
            showSuccessModal('Account created successfully! Welcome to MediGuard.', () => {
                window.location.href = 'homepage.html';
            });
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(button, "Create Account");
        }
    }
    
    async function handleGoogleAuth(button) {
        showLoadingState(button);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            await createUserDocument(user, user.displayName, true); // `true` to merge data
            showSuccessModal('Signed in with Google! Redirecting...', () => {
                window.location.href = 'homepage.html';
            });
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(button, 'Continue with Google');
        }
    }

    async function handlePasswordReset(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const button = e.target.querySelector('.auth-btn.primary');
        if (!email) return showErrorModal('Please enter your email address.');

        showLoadingState(button);
        try {
            await sendPasswordResetEmail(auth, email);
            showSuccessModal('Password reset link sent! Please check your email inbox (and spam folder).');
        } catch (error) {
            handleAuthError(error);
        } finally {
            hideLoadingState(button, "Send Reset Link");
        }
    }

    // --- Helper & Utility Functions ---

    async function createUserDocument(user, displayName, merge = false) {
        const userRef = doc(db, 'users', user.uid);
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        };
        await setDoc(userRef, userData, { merge: merge });
    }

    function togglePasswordVisibility(input, button) {
        const icon = button.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    function checkPasswordStrength(password) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        if (!strengthFill || !strengthText) return;

        let score = 0;
        if (password.length > 7) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ef4444', '#ef4444', '#f59e0b', '#10b981', '#10b981'];
        
        strengthFill.style.width = `${(score / 5) * 100}%`;
        strengthFill.style.backgroundColor = colors[score - 1] || '#e5e7eb';
        strengthText.textContent = labels[score - 1] || 'Strength';
    }

    function showLoadingState(button) {
        button.classList.add('loading');
        button.disabled = true;
    }

    function hideLoadingState(button, originalText) {
        button.classList.remove('loading');
        button.disabled = false;
        // The text is handled via CSS, so no need to change it here
    }

    function showSuccessModal(message, callback) {
        const modal = document.getElementById('success-modal');
        modal.querySelector('.modal-message').textContent = message;
        modal.classList.add('active');
        setTimeout(() => {
            modal.classList.remove('active');
            if (callback) callback();
        }, 2500); // Redirect after 2.5 seconds
    }

    function showErrorModal(message) {
        const modal = document.getElementById('error-modal');
        modal.querySelector('#error-message-text').textContent = message;
        modal.classList.add('active');
    }

    function handleAuthError(error) {
        let message = 'An unknown error occurred. Please try again.';
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'Invalid email or password. Please check your credentials.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email address already exists.';
                break;
            case 'auth/weak-password':
                message = 'Your password must be at least 6 characters long.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'The sign-in popup was closed. Please try again.';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Please check your internet connection.';
                break;
        }
        showErrorModal(message);
        console.error("Firebase Auth Error:", error.code, error.message);
    }
});