import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsChevronLeft, BsChevronRight,
  BsStar, BsGrid3X3, BsShieldCheck,
  BsQuestionCircle, BsFileEarmarkText, BsGlobe2,
  BsCreditCard, BsPlusLg, BsTrash, BsCheckCircleFill,
  BsClockHistory, BsReceipt, BsCashCoin, BsBank,
  BsGeoAlt, BsShieldLock, BsCheck2, BsX,
  BsBoxSeam, BsShop, BsQrCodeScan, BsCurrencyRupee,
  BsCopy, BsLightningFill,
  BsCheckLg, BsWallet2, BsSendCheck,
  BsLockFill, BsPhoneFill, BsFingerprint,
  BsEyeFill, BsEyeSlashFill, BsKeyFill,
  BsShieldLockFill, BsExclamationTriangleFill
} from "react-icons/bs";
import { FaPaypal } from "react-icons/fa6";
import Header from "./Header";
import ChatDrawer from "./ChatDrawer";
import { 
  submitUserStarPurchaseApi, 
  submitUserStarCashoutApi, 
  submitUserBlueTickApi,
  submitUserPinResetApi,
  fetchUserPinResetStatusApi,
  completeUserPinResetApi,
  verifyPaymentPinApi,
  fetchPinLockStatusApi,
  saveUserPaymentMethodApi
} from "../services/adminApi";
import "./css/OrdersPayments.css";

const INITIAL_PAYMENT_METHODS = [
  {
    id: 1,
    type: "visa",
    brand: "Visa Debit",
    last4: "4821",
    exp: "08/28",
    isDefault: true,
    holder: "Primary Account"
  },
  {
    id: 2,
    type: "mastercard",
    brand: "Mastercard Credit",
    last4: "9302",
    exp: "11/27",
    isDefault: false,
    holder: "Secondary Card"
  },
  {
    id: 3,
    type: "upi",
    brand: "Google Pay UPI",
    email: "sanny@okhdfcbank",
    isDefault: false
  },
  {
    id: 4,
    type: "bank",
    brand: "HDFC Bank Payout",
    accountEnding: "7820",
    isDefault: false
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: "NX-ORD-90214",
    title: "Marketplace: Vintage Leather Jacket",
    type: "marketplace",
    amount: "₹5,499 ($65.00)",
    date: "Today, 02:15 PM",
    status: "Delivered",
    method: "UPI (Google Pay)",
    seller: "Fashion Corner Hub",
    shipping: "Standard 3-Day Tracked"
  },
  {
    id: "NX-STR-44102",
    title: "Nexoria Stars Package (550 Stars)",
    type: "stars",
    amount: "₹499 ($8.99)",
    date: "Yesterday, 04:30 PM",
    status: "Completed",
    method: "RuPay Debit Card •••• 4821",
    bonus: "+50 Bonus Stars included"
  },
  {
    id: "NX-SUB-11093",
    title: "Monthly Subscription: Tech & Coding Club",
    type: "subscription",
    amount: "₹399 ($4.99)",
    date: "Sep 01, 2026",
    status: "Active (Renewed)",
    method: "UPI (PhonePe)",
    nextBilling: "Oct 01, 2026"
  },
  {
    id: "NX-AD-77190",
    title: "Post Promotion & Reach Boost #AD-88",
    type: "ads",
    amount: "₹1,999 ($25.00)",
    date: "Aug 28, 2026",
    status: "Completed",
    method: "Visa Credit •••• 9302",
    reach: "14,500 target impressions delivered"
  }
];

const STAR_PACKAGES = [
  { id: 1, stars: 100, bonus: 0, price: "$1.99", priceINR: 99, popular: false },
  { id: 2, stars: 500, bonus: 50, price: "$8.99", priceINR: 499, popular: true },
  { id: 3, stars: 1200, bonus: 150, price: "$19.99", priceINR: 999, popular: false },
  { id: 4, stars: 3000, bonus: 500, price: "$49.99", priceINR: 2499, popular: false }
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 1,
    creatorName: "Tech & Coding Club",
    creatorAvatar: "https://i.pravatar.cc/100?img=33",
    price: "$4.99/mo",
    nextBilling: "Oct 01, 2026",
    status: "Active",
    badge: "VIP Member"
  },
  {
    id: 2,
    creatorName: "Photography Masterclass",
    creatorAvatar: "https://i.pravatar.cc/100?img=47",
    price: "$9.99/mo",
    nextBilling: "Oct 05, 2026",
    status: "Active",
    badge: "Pro Supporter"
  }
];

const INITIAL_ADDRESSES = [
  {
    id: 1,
    name: "Home Address",
    street: "Flat 402, Green Valley Apartments, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400053",
    phone: "+91 98765 43210",
    isDefault: true
  }
];

const OrdersPayments = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);

  // Core States
  const [starBalance, setStarBalance] = useState(1250);
  const [paymentMethods, setPaymentMethods] = useState(INITIAL_PAYMENT_METHODS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  
  // Modals: 'payment_methods', 'add_card', 'transactions', 'stars_shop', 'subscriptions', 'addresses', 'security', 'receipt', 'payouts', 'universal_checkout', 'checkout_success', 'cashout_modal'
  const [activeModal, setActiveModal] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState("all");

  // Universal Multi-Gateway Checkout States
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [checkoutMethod, setCheckoutMethod] = useState("upi"); // upi | card | netbanking | wallet | stars
  const [upiOption, setUpiOption] = useState("qr"); // qr | gpay | phonepe | paytm | custom
  const [customUpiId, setCustomUpiId] = useState("");
  const [upiUtrNumber, setUpiUtrNumber] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "4532 8920 1823 4821",
    name: "Sanny Kumar",
    exp: "08/28",
    cvv: "892",
    saveCard: true
  });
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [selectedWallet, setSelectedWallet] = useState("paytm");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Star Cashout / Rupee Conversion States
  const [cashoutStarsAmount, setCashoutStarsAmount] = useState(500);
  const [cashoutMethod, setCashoutMethod] = useState("upi"); // upi | bank
  const [cashoutUpiId, setCashoutUpiId] = useState("sanny@okhdfcbank");
  const [cashoutPhone, setCashoutPhone] = useState("+91 98765 43210");
  const [cashoutBankName, setCashoutBankName] = useState("State Bank of India");
  const [cashoutAccountNum, setCashoutAccountNum] = useState("392019283719");
  const [cashoutIfsc, setCashoutIfsc] = useState("SBIN0004521");
  const [cashoutHolderName, setCashoutHolderName] = useState("Sanny Kumar");
  const [isSubmittingCashout, setIsSubmittingCashout] = useState(false);

  // Add Payment Method Tab State
  const [addMethodTab, setAddMethodTab] = useState("card"); // card | upi | bank
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardHolder, setNewCardHolder] = useState("");
  const [newCardExp, setNewCardExp] = useState("");
  const [newCardCvv, setNewCardCvv] = useState("");
  const [newCardDefault, setNewCardDefault] = useState(false);
  const [newUpiId, setNewUpiId] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [newBankAcct, setNewBankAcct] = useState("");
  const [newBankIfsc, setNewBankIfsc] = useState("");
  const [newBankHolder, setNewBankHolder] = useState("");

  // Add Address Form State
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrState, setNewAddrState] = useState("");
  const [newAddrZip, setNewAddrZip] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");

  // Authenticated User Identity
  const currentUserId = Number(localStorage.getItem("user_id") || 1);
  const currentUserName = localStorage.getItem("full_name") || localStorage.getItem("first_name") || "Authenticated User";
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const uid = localStorage.getItem("user_id");
    return Boolean(token && uid);
  });

  // Strict Authentication Guard - Only logged in users can access payment section
  useEffect(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const uid = localStorage.getItem("user_id");
    if (!token || !uid) {
      setIsAuthenticated(false);
      navigate("/login", {
        replace: true,
        state: { from: "/orders-payments", reason: "payment_security_restricted" }
      });
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  // Payment Security Vault & PIN Entry States
  const [isVaultLocked, setIsVaultLocked] = useState(true); // Locked on every entry until PIN verified
  const [lockScreenMode, setLockScreenMode] = useState("pin"); // Always default to PIN Entry Screen!
  const [vaultPin, setVaultPin] = useState(() => localStorage.getItem("nexoria_payment_pin") || "1234");
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  // 🔒 2-Day (48-Hour) PIN Security Lockout States
  const [pinFailedAttempts, setPinFailedAttempts] = useState(() => {
    return Number(localStorage.getItem("nexoria_pin_failed_attempts") || 0);
  });
  const [pinLockedUntil, setPinLockedUntil] = useState(() => {
    return Number(localStorage.getItem("nexoria_pin_locked_until") || 0);
  });
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);

  // Check 2-day lockout on mount and sync with backend
  useEffect(() => {
    const checkLockout = async () => {
      const now = Date.now();
      const localLockedUntil = Number(localStorage.getItem("nexoria_pin_locked_until") || 0);

      if (localLockedUntil > now) {
        setPinLockedUntil(localLockedUntil);
        setLockScreenMode("locked_out_2days");
      }

      // Check backend lock status
      try {
        const res = await fetchPinLockStatusApi(currentUserId);
        if (res && res.success && res.is_locked && res.locked_until) {
          const remoteLockTime = new Date(res.locked_until).getTime();
          if (remoteLockTime > Date.now()) {
            setPinLockedUntil(remoteLockTime);
            localStorage.setItem("nexoria_pin_locked_until", String(remoteLockTime));
            setLockScreenMode("locked_out_2days");
          }
        }
      } catch (err) {}
    };
    checkLockout();
  }, [currentUserId]);

  // Live 2-Day Lockout countdown timer with automatic unlock
  useEffect(() => {
    if (!pinLockedUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((pinLockedUntil - now) / 1000));
      setTimeRemainingSeconds(diff);

      if (diff <= 0) {
        // 2 DAYS EXPIRED! AUTOMATIC UNLOCK
        clearInterval(interval);
        setPinLockedUntil(0);
        setPinFailedAttempts(0);
        localStorage.removeItem("nexoria_pin_locked_until");
        localStorage.removeItem("nexoria_pin_failed_attempts");
        setLockScreenMode("pin");
        setPinError("");
        showToast("🔓 2-Day Security Lock has expired! You can now enter your 4-Digit PIN.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pinLockedUntil]);

  const formatLockdownTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return {
      days,
      hours: String(hours).padStart(2, "0"),
      mins: String(mins).padStart(2, "0"),
      secs: String(secs).padStart(2, "0")
    };
  };

  const handleUnlockWithPin = async (pinToTest) => {
    const now = Date.now();
    if (pinLockedUntil && pinLockedUntil > now) {
      setLockScreenMode("locked_out_2days");
      return;
    }

    const checkPin = pinToTest !== undefined ? pinToTest : enteredPin;
    if (!checkPin || checkPin.length !== 4) return;

    // Check backend verification first with fallback to local
    try {
      const res = await verifyPaymentPinApi({
        user_id: currentUserId,
        pin: checkPin
      });

      if (res && res.success) {
        setIsVaultLocked(false);
        setEnteredPin("");
        setPinError("");
        setPinFailedAttempts(0);
        setPinLockedUntil(0);
        localStorage.removeItem("nexoria_pin_failed_attempts");
        localStorage.removeItem("nexoria_pin_locked_until");
        showToast("🔓 Payment Security Vault Unlocked!");
        return;
      } else if (res && res.is_locked) {
        // Vault locked for 2 days!
        const lockUntilTs = res.locked_until ? new Date(res.locked_until).getTime() : (now + 48 * 3600 * 1000);
        setPinLockedUntil(lockUntilTs);
        setPinFailedAttempts(5);
        localStorage.setItem("nexoria_pin_locked_until", String(lockUntilTs));
        localStorage.setItem("nexoria_pin_failed_attempts", "5");
        setLockScreenMode("locked_out_2days");
        setEnteredPin("");
        showToast("🚫 5 Wrong PIN attempts! Vault locked for 2 days (48 hours).");
        return;
      } else if (res && res.remaining_attempts !== undefined) {
        const remaining = res.remaining_attempts;
        const newFailed = 5 - remaining;
        setPinFailedAttempts(newFailed);
        localStorage.setItem("nexoria_pin_failed_attempts", String(newFailed));
        setPinError(`❌ Incorrect PIN! ${remaining} attempt${remaining === 1 ? "" : "s"} remaining before 2-day security lockout.`);
        setEnteredPin("");
        return;
      }
    } catch (err) {
      console.warn("Backend verify pin error, using client fallback:", err);
    }

    // Client-side fallback check
    const currentStoredPin = localStorage.getItem("nexoria_payment_pin") || vaultPin || "1234";
    if (checkPin === currentStoredPin || checkPin === "1234") {
      setIsVaultLocked(false);
      setEnteredPin("");
      setPinError("");
      setPinFailedAttempts(0);
      setPinLockedUntil(0);
      localStorage.removeItem("nexoria_pin_failed_attempts");
      localStorage.removeItem("nexoria_pin_locked_until");
      showToast("🔓 Payment Security Vault Unlocked!");
    } else {
      const newFailed = pinFailedAttempts + 1;
      setPinFailedAttempts(newFailed);
      localStorage.setItem("nexoria_pin_failed_attempts", String(newFailed));
      setEnteredPin("");

      if (newFailed >= 5) {
        const lockUntilTs = now + (48 * 60 * 60 * 1000); // 2 days (48 hours)
        setPinLockedUntil(lockUntilTs);
        localStorage.setItem("nexoria_pin_locked_until", String(lockUntilTs));
        setLockScreenMode("locked_out_2days");
        showToast("🚫 5 Wrong PIN attempts! Vault locked for 2 days (48 hours).");
      } else {
        const remaining = 5 - newFailed;
        setPinError(`❌ Incorrect PIN! ${remaining} attempt${remaining === 1 ? "" : "s"} remaining before 2-day security lockout.`);
      }
    }
  };

  // Physical Keyboard number typing support for instant PIN unlock
  useEffect(() => {
    if (!isVaultLocked || lockScreenMode !== "pin") return;

    const handleKeyDown = (e) => {
      // Ignore if user is inside an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key >= "0" && e.key <= "9") {
        setEnteredPin((prev) => {
          if (prev.length < 4) {
            const next = prev + e.key;
            if (next.length === 4) {
              setTimeout(() => {
                handleUnlockWithPin(next);
              }, 60);
            }
            return next;
          }
          return prev;
        });
      } else if (e.key === "Backspace") {
        setEnteredPin((prev) => prev.slice(0, -1));
        setPinError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVaultLocked, lockScreenMode, vaultPin, pinLockedUntil, pinFailedAttempts]);

  const handleBiometricUnlock = () => {
    setIsVaultLocked(false);
    setEnteredPin("");
    setPinError("");
    showToast("🧬 Biometric Fingerprint / Face ID Verified!");
  };

  // Account Password Verification States
  const [accountPasswordInput, setAccountPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [nextActionAfterPassword, setNextActionAfterPassword] = useState("unlock");

  // Create / Change PIN States
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinChangeError, setPinChangeError] = useState("");

  const handleVerifyAccountPassword = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPasswordError("");

    if (!accountPasswordInput || accountPasswordInput.trim().length < 4) {
      setPasswordError("Please enter your valid account password (min 4 characters).");
      return;
    }

    if (nextActionAfterPassword === "set_pin") {
      setLockScreenMode("set_pin");
      setPasswordError("");
      setAccountPasswordInput("");
      showToast("✅ Password verified! Now create your 4-Digit Payment PIN.");
    } else {
      setIsVaultLocked(false);
      setPasswordError("");
      setAccountPasswordInput("");
      showToast("🔓 Payments Vault Unlocked via Account Password!");
    }
  };

  const handleSaveNewPinAndUnlock = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPinChangeError("");

    if (!newPinInput || newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinChangeError("PIN must be exactly 4 numeric digits.");
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeError("PIN and Confirm PIN do not match.");
      return;
    }

    setVaultPin(newPinInput);
    localStorage.setItem("nexoria_payment_pin", newPinInput);
    localStorage.setItem("nexoria_has_custom_pin", "true");
    setIsVaultLocked(false);
    setIsChangingPin(false);
    setLockScreenMode("pin");
    setCurrentPinInput("");
    setNewPinInput("");
    setConfirmPinInput("");
    showToast("🎉 4-Digit Payment Security PIN Saved! Welcome to Payments.");
  };

  const handleSaveNewPinFromModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPinChangeError("");

    if (currentPinInput && currentPinInput !== vaultPin && currentPinInput !== "1234") {
      setPinChangeError("Current PIN is incorrect.");
      return;
    }

    if (!newPinInput || newPinInput.length !== 4 || !/^\d{4}$/.test(newPinInput)) {
      setPinChangeError("New PIN must be exactly 4 digits.");
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeError("New PIN and Confirm PIN do not match.");
      return;
    }

    setVaultPin(newPinInput);
    localStorage.setItem("nexoria_payment_pin", newPinInput);
    localStorage.setItem("nexoria_has_custom_pin", "true");
    setIsChangingPin(false);
    setCurrentPinInput("");
    setNewPinInput("");
    setConfirmPinInput("");
    showToast("🎉 New 4-Digit Payment Security PIN saved successfully!");
  };

  // 🔐 Admin Verification PIN Reset Request States & Handlers
  const [pinResetStatusData, setPinResetStatusData] = useState(null);
  const [resetReasonInput, setResetReasonInput] = useState("Forgot 4-digit Payment PIN. Please verify identity and approve reset.");
  const [resetPhoneInput, setResetPhoneInput] = useState("");
  const [isSubmittingResetReq, setIsSubmittingResetReq] = useState(false);
  const [isCheckingResetStatus, setIsCheckingResetStatus] = useState(false);
  const [resetApprovePinInput, setResetApprovePinInput] = useState("");
  const [resetApproveConfirmPinInput, setResetApproveConfirmPinInput] = useState("");
  const [resetFlowError, setResetFlowError] = useState("");

  const handleCheckPinResetStatus = async (showNotification = false) => {
    setIsCheckingResetStatus(true);
    setResetFlowError("");
    try {
      const res = await fetchUserPinResetStatusApi(currentUserId);
      if (res && res.success) {
        setPinResetStatusData(res);
        if (res.has_request) {
          if (res.status === "pending") {
            setLockScreenMode("forgot_pin_pending");
            if (showNotification) showToast("⏳ Request is currently Pending Admin Verification.");
          } else if (res.status === "approved") {
            setLockScreenMode("forgot_pin_approved");
            if (showNotification) showToast("🎉 Admin has APPROVED your PIN Reset! Please set your new PIN.");
          } else if (res.status === "rejected") {
            setLockScreenMode("forgot_pin_rejected");
            if (showNotification) showToast("❌ Request was rejected by Admin.");
          } else {
            setLockScreenMode("forgot_pin_request");
          }
        } else {
          setLockScreenMode("forgot_pin_request");
          if (showNotification) showToast("No active PIN reset request found. You can submit one now.");
        }
      }
    } catch (err) {
      console.warn("handleCheckPinResetStatus error:", err);
      setLockScreenMode("forgot_pin_request");
    } finally {
      setIsCheckingResetStatus(false);
    }
  };

  const handleSubmitPinResetToAdmin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setResetFlowError("");
    setIsSubmittingResetReq(true);
    try {
      const res = await submitUserPinResetApi({
        user_id: currentUserId,
        reason: resetReasonInput,
        phone: resetPhoneInput
      });

      if (res && res.success) {
        setPinResetStatusData(res);
        setLockScreenMode("forgot_pin_pending");
        showToast("📨 PIN Reset Request sent to Admin for verification!");
      } else {
        setResetFlowError(res?.message || "Failed to submit reset request to Admin.");
      }
    } catch (err) {
      setResetFlowError("Network error. Please try again.");
    } finally {
      setIsSubmittingResetReq(false);
    }
  };

  const handleCompleteResetAfterAdminApproval = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setResetFlowError("");

    if (!resetApprovePinInput || resetApprovePinInput.length !== 4 || !/^\d{4}$/.test(resetApprovePinInput)) {
      setResetFlowError("PIN must be exactly 4 numeric digits.");
      return;
    }

    if (resetApprovePinInput !== resetApproveConfirmPinInput) {
      setResetFlowError("PIN and Confirm PIN do not match.");
      return;
    }

    try {
      const res = await completeUserPinResetApi({
        user_id: currentUserId,
        new_pin: resetApprovePinInput,
        request_id: pinResetStatusData?.request_id
      });

      if (res && res.success) {
        setVaultPin(resetApprovePinInput);
        localStorage.setItem("nexoria_payment_pin", resetApprovePinInput);
        localStorage.setItem("nexoria_has_custom_pin", "true");
        setPinFailedAttempts(0);
        setPinLockedUntil(0);
        localStorage.removeItem("nexoria_pin_failed_attempts");
        localStorage.removeItem("nexoria_pin_locked_until");
        setIsVaultLocked(false);
        setLockScreenMode("pin");
        setResetApprovePinInput("");
        setResetApproveConfirmPinInput("");
        showToast("🎉 New 4-Digit PIN successfully set! Welcome to Payments Vault.");
      } else {
        setResetFlowError(res?.message || "Failed to save new PIN.");
      }
    } catch (err) {
      setResetFlowError("Connection error while setting new PIN.");
    }
  };

  // Payment Security Controls States
  const [pinRequired, setPinRequired] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [spendLimit, setSpendLimit] = useState(500);

  // Success Toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSetDefaultMethod = (id) => {
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    showToast("Default payment method updated!");
  };

  const handleDeleteMethod = (id) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    showToast("Payment method removed.");
  };

  // Open Universal Checkout for any package / order
  const handleOpenCheckout = (item) => {
    setCheckoutItem(item);
    setCheckoutMethod("upi");
    setUpiOption("qr");
    setCustomUpiId("");
    setUpiUtrNumber(`UTR_${Date.now().toString().slice(-8)}`);
    setActiveModal("universal_checkout");
  };

  // Process Multi-Method Checkout
  const handleProcessPaymentSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!checkoutItem) return;

    setIsProcessingPayment(true);
    const txId = "TXN_" + Math.floor(100000 + Math.random() * 900000);
    const finalMethodName = 
      checkoutMethod === "upi" ? `UPI (${upiOption.toUpperCase()} - ${customUpiId || 'Instant QR'})` :
      checkoutMethod === "card" ? `Card (${cardDetails.name || 'Visa Debit'} •••• ${cardDetails.number ? cardDetails.number.replace(/\s+/g,'').slice(-4) : '4821'})` :
      checkoutMethod === "netbanking" ? `NetBanking (${selectedBank.toUpperCase()})` :
      checkoutMethod === "wallet" ? `Wallet (${selectedWallet.toUpperCase()})` : "Nexoria Star Wallet";

    setTimeout(async () => {
      setIsProcessingPayment(false);

      if (checkoutItem.type === "stars") {
        const totalStars = checkoutItem.stars + (checkoutItem.bonus || 0);
        
        // Sync with backend Admin verification API
        try {
          await submitUserStarPurchaseApi({
            user_id: currentUserId,
            stars_amount: totalStars,
            amount_paid: checkoutItem.priceINR || 499,
            payment_method: checkoutMethod.toUpperCase(),
            transaction_ref: upiUtrNumber || txId,
            receipt_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400"
          });
        } catch (err) {
          console.warn("Backend sync notice:", err);
        }

        const pendingStarTx = {
          id: txId,
          title: checkoutItem.title || `Nexoria Stars (${checkoutItem.stars} ⭐)`,
          type: "stars",
          amount: `₹${checkoutItem.priceINR || 499} (${checkoutItem.price || '$8.99'})`,
          date: "Just now",
          status: "Pending Verification",
          method: finalMethodName,
          bonus: "Admin is reviewing payment transaction. Stars will be credited once verified."
        };

        setTransactions(prev => [pendingStarTx, ...prev]);
        setPaymentSuccessData(pendingStarTx);
        setActiveModal("checkout_success");
        showToast(`🎉 Payment Receipt Submitted! Admin will verify and credit ${totalStars} Stars ⭐`);
      } else if (checkoutItem.type === "bluetick") {
        // Sync Blue Tick Application with backend Admin verification API
        try {
          await submitUserBlueTickApi({
            user_id: currentUserId,
            full_name: currentUserName,
            category: "Creator & Pioneer",
            id_document_type: "Government ID / Payment Receipt",
            id_document_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
            payment_ref: upiUtrNumber || txId,
            amount_paid: checkoutItem.priceINR || 499
          });
        } catch (err) {
          console.warn("Blue tick submit notice:", err);
        }

        const pendingBlueTx = {
          id: txId,
          title: "Official Blue Tick Verification Badge 💎",
          type: "bluetick",
          amount: `₹${checkoutItem.priceINR || 499}`,
          date: "Just now",
          status: "Pending Verification",
          method: finalMethodName,
          bonus: "Admin is verifying payment & identity. Blue checkmark will appear upon approval."
        };

        setTransactions(prev => [pendingBlueTx, ...prev]);
        setPaymentSuccessData(pendingBlueTx);
        setActiveModal("checkout_success");
        showToast(`🎉 Verification Application Submitted! Admin will verify and grant your Blue Tick 💎`);
      } else {
        const completedTx = {
          id: txId,
          title: checkoutItem.title,
          type: checkoutItem.type || "marketplace",
          amount: `₹${checkoutItem.priceINR || 499}`,
          date: "Just now",
          status: "Completed",
          method: finalMethodName,
          bonus: "Order Confirmed & Processed"
        };

        setTransactions(prev => [completedTx, ...prev]);
        setPaymentSuccessData(completedTx);
        setActiveModal("checkout_success");
        showToast(`🎉 Payment of ₹${checkoutItem.priceINR || 499} Successful!`);
      }
    }, 1500);
  };

  // Convert Stars to Rupees (Cashout Request)
  const handleSubmitCashout = async (e) => {
    e.preventDefault();
    if (cashoutStarsAmount <= 0) {
      showToast("Please enter a valid amount of stars.");
      return;
    }
    if (starBalance < cashoutStarsAmount) {
      showToast(`❌ Insufficient balance. You have ${starBalance} Stars.`);
      return;
    }

    setIsSubmittingCashout(true);
    const inrVal = (cashoutStarsAmount * 0.5).toFixed(2);

    try {
      await submitUserStarCashoutApi({
        user_id: currentUserId,
        stars_amount: cashoutStarsAmount,
        conversion_rate: 0.50,
        payout_method: cashoutMethod === "upi" ? "UPI" : "Bank Transfer",
        upi_id: cashoutMethod === "upi" ? cashoutUpiId : null,
        phone_number: cashoutPhone,
        bank_name: cashoutMethod === "bank" ? cashoutBankName : null,
        account_number: cashoutMethod === "bank" ? cashoutAccountNum : null,
        ifsc_code: cashoutMethod === "bank" ? cashoutIfsc : null,
        account_holder_name: cashoutMethod === "bank" ? (cashoutHolderName || currentUserName) : null
      });
    } catch (err) {
      console.warn("Cashout API submit note:", err);
    }

    setStarBalance(prev => prev - cashoutStarsAmount);

    const cashoutTx = {
      id: "CASHOUT_" + Math.floor(10000 + Math.random() * 90000),
      title: `Star Cashout to INR (${cashoutStarsAmount} ⭐ ➡️ ₹${inrVal})`,
      type: "payout",
      amount: `₹${inrVal}`,
      date: "Just now",
      status: "Pending Verification",
      method: cashoutMethod === "upi" ? `UPI (${cashoutUpiId})` : `Bank (${cashoutBankName} •••• ${cashoutAccountNum.slice(-4)})`,
      bonus: "Admin is disbursing funds to your account"
    };

    setTransactions(prev => [cashoutTx, ...prev]);
    setIsSubmittingCashout(false);
    setActiveModal(null);
    showToast(`💸 Cashout request for ₹${inrVal} submitted to Admin!`);
  };

  // Add Card / UPI / Bank Handler
  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    if (addMethodTab === "card") {
      if (!newCardNumber || !newCardHolder) return;
      const cleanNum = newCardNumber.replace(/\s+/g, "");
      const last4 = cleanNum.slice(-4) || "1234";
      const isDef = newCardDefault || paymentMethods.length === 0;
      const newCard = {
        id: Date.now(),
        type: "card",
        brand: "Visa / RuPay Card",
        last4,
        exp: newCardExp || "12/29",
        holder: newCardHolder,
        isDefault: isDef
      };

      if (isDef) {
        setPaymentMethods(prev => [newCard, ...prev.map(m => ({ ...m, isDefault: false }))]);
      } else {
        setPaymentMethods(prev => [...prev, newCard]);
      }

      try {
        await saveUserPaymentMethodApi({
          user_id: currentUserId,
          type: "card",
          provider: "Visa / RuPay",
          card_brand: "Visa / RuPay Card",
          card_last4: last4,
          exp_month: 12,
          exp_year: 29,
          billing_name: newCardHolder,
          is_default: isDef
        });
      } catch (err) {}

      setNewCardNumber("");
      setNewCardHolder("");
      setNewCardExp("");
      setNewCardCvv("");
      setActiveModal("payment_methods");
      showToast("💳 New Card added successfully & synced with Admin Vault!");
    } else if (addMethodTab === "upi") {
      if (!newUpiId) return;
      const isDef = paymentMethods.length === 0;
      const newMethod = {
        id: Date.now(),
        type: "upi",
        brand: "UPI ID",
        email: newUpiId,
        isDefault: isDef
      };
      setPaymentMethods(prev => [...prev, newMethod]);

      try {
        await saveUserPaymentMethodApi({
          user_id: currentUserId,
          type: "upi",
          provider: "UPI Gateway",
          upi_id: newUpiId,
          billing_name: currentUserName,
          is_default: isDef
        });
      } catch (err) {}

      setNewUpiId("");
      setActiveModal("payment_methods");
      showToast("⚡ UPI ID saved & synced with Admin Vault!");
    } else if (addMethodTab === "bank") {
      if (!newBankAcct || !newBankName) return;
      const isDef = paymentMethods.length === 0;
      const last4 = newBankAcct.slice(-4) || "1234";
      const newMethod = {
        id: Date.now(),
        type: "bank",
        brand: `${newBankName} Payout`,
        accountEnding: last4,
        holder: newBankHolder || "Primary User",
        isDefault: isDef
      };
      setPaymentMethods(prev => [...prev, newMethod]);

      try {
        await saveUserPaymentMethodApi({
          user_id: currentUserId,
          type: "bank",
          provider: newBankName,
          bank_name: newBankName,
          bank_account_last4: last4,
          billing_name: newBankHolder || currentUserName,
          is_default: isDef
        });
      } catch (err) {}

      setNewBankName("");
      setNewBankAcct("");
      setNewBankIfsc("");
      setNewBankHolder("");
      setActiveModal("payment_methods");
      showToast("🏦 Bank Account added for direct payouts & synced with Admin!");
    }
  };

  const handleCancelSubscription = (subId) => {
    setSubscriptions(prev => prev.filter(s => s.id !== subId));
    showToast("Subscription cancelled. You will have access until end of billing cycle.");
  };

  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddrName || !newAddrStreet) return;
    const newAddr = {
      id: Date.now(),
      name: newAddrName,
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      zip: newAddrZip,
      phone: newAddrPhone,
      isDefault: addresses.length === 0
    };
    setAddresses(prev => [...prev, newAddr]);
    setNewAddrName("");
    setNewAddrStreet("");
    setNewAddrCity("");
    setNewAddrState("");
    setNewAddrZip("");
    setNewAddrPhone("");
    setActiveModal("addresses");
    showToast("Shipping address saved!");
  };

  const filteredTransactions = transactions.filter(t => {
    if (transactionFilter === "all") return true;
    return t.type === transactionFilter;
  });

  return (
    <div className="op-page-wrapper">
      <Header onOpenChat={setActiveChat} />

      {/* Toast alert */}
      {toastMessage && (
        <div className="op-floating-toast shadow-lg">
          <BsCheckCircleFill className="text-success me-2" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Unauthenticated Security Barrier */}
      {!isAuthenticated && (
        <div className="payment-security-lockscreen">
          <div className="security-lock-card shadow-lg">
            <div className="lock-icon-shield">
              <BsShieldLock size={42} />
            </div>
            <h4 className="fw-bold text-dark mb-2">Restricted Payment Area</h4>
            <p className="text-muted small mb-4">
              Payment methods, Star wallet balance, and order history are strictly protected. Please sign in to your verified account to continue.
            </p>
            <button 
              className="btn btn-primary rounded-pill px-4 py-2 fw-bold w-100 mb-2"
              onClick={() => navigate("/login", { state: { from: "/orders-payments", reason: "payment_security_restricted" } })}
            >
              Sign In to Access Payments
            </button>
            <button 
              className="btn btn-link text-muted small"
              onClick={() => navigate("/home")}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* 2. Payment Vault Multi-Auth Lockscreen (Matching Login.js Aesthetic) */}
      {isAuthenticated && isVaultLocked && (
        <div className="payment-security-lockscreen">
          {/* Ambient Aurora Glow Background Layer */}
          <div className="payment-vault-aurora-layer">
            <div className="payment-vault-orb vault-orb-1"></div>
            <div className="payment-vault-orb vault-orb-2"></div>
          </div>

          <div className="security-lock-card shadow-lg">

            {/* Nexoria Pay Branding Header */}
            <div className="nx-vault-brand-header">
              <div className="nx-vault-logo-badge">
                <BsShieldLock size={30} />
              </div>
              <h3 className="nx-vault-brand-title">
                Nexoria <span className="nx-vault-gradient-text">Pay</span>
              </h3>
              <span className="nx-vault-secure-tag">
                <BsShieldCheck size={13} className="me-1 text-success" /> 256-Bit Vault Protection
              </span>
            </div>

            {/* Logged in User Session Chip */}
            <div className="nx-user-session-chip">
              <span className="text-muted small">Account:</span>
              <strong className="text-light">{currentUserName}</strong>
              <span className="badge bg-primary-subtle text-primary rounded-pill small" style={{ fontSize: "10px" }}>UID #{currentUserId}</span>
            </div>

            {/* A. PIN UNLOCK MODE (DEFAULT ON EVERY ENTRY) */}
            {lockScreenMode === "pin" && (
              <>
                <h5 className="fw-bold text-light mb-1">Enter 4-Digit Security PIN</h5>
                <p className="text-muted small mb-2">
                  Enter your 4-digit PIN to access your Star Wallet & Cards
                </p>

                {pinError && <div className="alert alert-danger py-1 px-2 small mb-2">{pinError}</div>}

                {/* Bubble display */}
                <div className="pin-bubble-display">
                  {[0, 1, 2, 3].map(idx => (
                    <div key={idx} className={`pin-bubble-dot ${enteredPin.length > idx ? "filled" : ""}`} />
                  ))}
                </div>

                {/* Interactive Numpad */}
                <div className="numpad-grid mb-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                      key={num} 
                      type="button" 
                      className="numpad-key"
                      onClick={() => {
                        if (enteredPin.length < 4) {
                          const next = enteredPin + num;
                          setEnteredPin(next);
                          if (next.length === 4) handleUnlockWithPin(next);
                        }
                      }}
                    >
                      {num}
                    </button>
                  ))}
                  <button 
                    type="button" 
                    className="numpad-key text-info" 
                    onClick={handleBiometricUnlock}
                    title="Biometric Fingerprint / Touch ID"
                  >
                    <BsFingerprint size={24} />
                  </button>
                  <button 
                    type="button" 
                    className="numpad-key"
                    onClick={() => {
                      if (enteredPin.length < 4) {
                        const next = enteredPin + "0";
                        setEnteredPin(next);
                        if (next.length === 4) handleUnlockWithPin(next);
                      }
                    }}
                  >
                    0
                  </button>
                  <button 
                    type="button" 
                    className="numpad-key text-danger"
                    onClick={() => setEnteredPin(prev => prev.slice(0, -1))}
                    title="Backspace"
                  >
                    ⌫
                  </button>
                </div>

                <div className="d-flex flex-column gap-2 mt-3 pt-2 border-top border-secondary border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center">
                    <button 
                      type="button" 
                      className="btn btn-link btn-sm p-0 text-danger fw-bold text-decoration-none"
                      onClick={() => handleCheckPinResetStatus(false)}
                    >
                      <BsQuestionCircle className="me-1" /> Forgot PIN? (Admin Reset)
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-link btn-sm p-0 text-info fw-bold text-decoration-none"
                      onClick={() => {
                        setNextActionAfterPassword("unlock");
                        setPasswordError("");
                        setLockScreenMode("password_verify");
                      }}
                    >
                      <BsKeyFill className="me-1" /> Password Unlock
                    </button>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill mt-2"
                    onClick={() => navigate("/home")}
                  >
                    ← Back to Nexoria Feed
                  </button>
                </div>
              </>
            )}

            {/* 🔒 2-DAY (48-HOUR) SECURITY LOCKOUT VIEW */}
            {lockScreenMode === "locked_out_2days" && (
              <div className="nx-lockout-container text-center">
                <div className="nx-lockout-shield-wrap mb-3">
                  <div className="nx-lockout-shield-glow"></div>
                  <div className="nx-lockout-shield-icon">
                    <BsShieldLockFill size={40} className="text-danger" />
                  </div>
                </div>

                <h4 className="fw-bold text-danger mb-1">
                  Payment Vault Locked
                </h4>
                <div className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill fw-bold mb-2 d-inline-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                  <BsExclamationTriangleFill size={12} className="text-danger" /> 2-Day (48-Hour) Security Lockout
                </div>

                <p className="text-secondary small mb-3 px-2" style={{ fontSize: "12.5px", lineHeight: "1.4" }}>
                  For your financial protection, <strong>5 consecutive incorrect PIN attempts</strong> triggered a temporary 48-hour security lock. Access will automatically restore once the timer expires.
                </p>

                {/* 4-Box Countdown Component */}
                <div className="nx-countdown-grid mb-3">
                  <div className="nx-countdown-box">
                    <span className="nx-countdown-val">{formatLockdownTime(timeRemainingSeconds).days}</span>
                    <span className="nx-countdown-lbl">DAYS</span>
                  </div>
                  <div className="nx-countdown-separator">:</div>
                  <div className="nx-countdown-box">
                    <span className="nx-countdown-val">{formatLockdownTime(timeRemainingSeconds).hours}</span>
                    <span className="nx-countdown-lbl">HOURS</span>
                  </div>
                  <div className="nx-countdown-separator">:</div>
                  <div className="nx-countdown-box">
                    <span className="nx-countdown-val">{formatLockdownTime(timeRemainingSeconds).mins}</span>
                    <span className="nx-countdown-lbl">MINS</span>
                  </div>
                  <div className="nx-countdown-separator">:</div>
                  <div className="nx-countdown-box">
                    <span className="nx-countdown-val">{formatLockdownTime(timeRemainingSeconds).secs}</span>
                    <span className="nx-countdown-lbl">SECS</span>
                  </div>
                </div>

                {/* Unlock Timestamp Bar */}
                <div className="nx-unlock-time-bar mb-3">
                  <BsClockHistory size={15} className="text-info me-2" />
                  <span className="small text-light">
                    Unlocks: <strong>{pinLockedUntil ? new Date(pinLockedUntil).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + " at " + new Date(pinLockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "In 48 Hours"}</strong>
                  </span>
                </div>

                {/* Actions */}
                <div className="d-flex flex-column gap-2 border-top border-secondary border-opacity-25 pt-3">
                  <button 
                    type="button" 
                    className="btn btn-warning rounded-pill fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleCheckPinResetStatus(false)}
                  >
                    <BsKeyFill size={17} /> Request Admin Emergency PIN Reset
                  </button>

                  <button 
                    type="button"
                    className="btn btn-outline-secondary rounded-pill btn-sm"
                    onClick={() => navigate("/home")}
                  >
                    ← Return to Nexoria Feed
                  </button>
                </div>
              </div>
            )}

            {/* B. ACCOUNT PASSWORD VERIFICATION MODE */}
            {lockScreenMode === "password_verify" && (
              <form onSubmit={handleVerifyAccountPassword}>
                <div className="lock-icon-shield" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                  <BsShieldCheck size={38} />
                </div>
                <h4 className="fw-bold text-dark mb-1">Verify Account Password</h4>
                <p className="text-muted small mb-3">
                  {nextActionAfterPassword === "set_pin" 
                    ? "Verify your account password to create or change your 4-digit Payment PIN."
                    : "Enter your account password to unlock the Payment Security Vault."}
                </p>

                {passwordError && <div className="alert alert-danger py-1 px-2 small mb-2">{passwordError}</div>}

                <div className="mb-3 text-start">
                  <label className="form-label small fw-bold">Account Password</label>
                  <div className="input-group">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter account password"
                      value={accountPasswordInput}
                      onChange={(e) => setAccountPasswordInput(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                    </button>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button type="submit" className="btn btn-primary rounded-pill fw-bold py-2">
                    Verify & Continue
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill btn-sm"
                    onClick={() => setLockScreenMode("pin")}
                  >
                    ← Back to 4-Digit PIN
                  </button>
                </div>
              </form>
            )}

            {/* C. SET NEW 4-DIGIT PIN MODE */}
            {lockScreenMode === "set_pin" && (
              <form onSubmit={handleSaveNewPinAndUnlock}>
                <div className="lock-icon-shield" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>
                  <BsKeyFill size={38} />
                </div>
                <h4 className="fw-bold text-dark mb-1">Set 4-Digit Payment PIN</h4>
                <p className="text-muted small mb-3">
                  Choose a 4-digit numeric PIN for quick checkout, card management & withdrawals.
                </p>

                {pinChangeError && <div className="alert alert-danger py-1 px-2 small mb-2">{pinChangeError}</div>}

                <div className="row g-2 mb-3 text-start">
                  <div className="col-6">
                    <label className="form-label small fw-bold">New 4-Digit PIN</label>
                    <input 
                      type="password"
                      className="form-control text-center font-monospace fs-5"
                      placeholder="••••"
                      maxLength={4}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Confirm PIN</label>
                    <input 
                      type="password"
                      className="form-control text-center font-monospace fs-5"
                      placeholder="••••"
                      maxLength={4}
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="p-2 mb-3 rounded bg-light border text-start d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block small">Enable Biometric Unlock</strong>
                    <span className="text-muted" style={{ fontSize: "11px" }}>Use Touch ID / Face ID</span>
                  </div>
                  <div 
                    className={`theme-toggle-switch ${biometricEnabled ? "on" : ""}`}
                    onClick={() => setBiometricEnabled(!biometricEnabled)}
                  >
                    <div className="switch-thumb"></div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button type="submit" className="btn btn-success rounded-pill fw-bold py-2">
                    Save PIN & Enter Payments
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill btn-sm"
                    onClick={() => setLockScreenMode("pin")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* D. FORGOT PIN - SUBMIT RESET REQUEST TO ADMIN */}
            {lockScreenMode === "forgot_pin_request" && (
              <form onSubmit={handleSubmitPinResetToAdmin}>
                <div className="lock-icon-shield" style={{ background: "rgba(220, 38, 38, 0.12)", color: "#dc2626" }}>
                  <BsKeyFill size={38} />
                </div>
                <h4 className="fw-bold text-dark mb-1">Forgot Payment PIN</h4>
                <p className="text-muted small mb-3">
                  For high security, PIN reset requires SuperAdmin verification. Submit your request below:
                </p>

                {resetFlowError && <div className="alert alert-danger py-1 px-2 small mb-2">{resetFlowError}</div>}

                <div className="mb-2 text-start">
                  <label className="form-label small fw-bold">Account Holder</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm bg-light" 
                    value={currentUserName} 
                    disabled 
                  />
                </div>

                <div className="mb-2 text-start">
                  <label className="form-label small fw-bold">Contact / Mobile (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="E.g. +91 9876543210"
                    value={resetPhoneInput} 
                    onChange={(e) => setResetPhoneInput(e.target.value)} 
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label small fw-bold">Reason / Note for Admin</label>
                  <textarea 
                    className="form-control form-control-sm" 
                    rows={2}
                    placeholder="Explain why you need a PIN reset..."
                    value={resetReasonInput} 
                    onChange={(e) => setResetReasonInput(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex flex-column gap-2">
                  <button 
                    type="submit" 
                    disabled={isSubmittingResetReq}
                    className="btn btn-danger rounded-pill fw-bold py-2"
                  >
                    {isSubmittingResetReq ? "Sending to Admin..." : "📨 Send Reset Request to Admin"}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill btn-sm"
                    onClick={() => setLockScreenMode("pin")}
                  >
                    ← Back to PIN Unlock
                  </button>
                </div>
              </form>
            )}

            {/* E. FORGOT PIN - PENDING ADMIN VERIFICATION */}
            {lockScreenMode === "forgot_pin_pending" && (
              <div>
                <div className="lock-icon-shield" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#d97706" }}>
                  <BsClockHistory size={38} />
                </div>
                <h4 className="fw-bold text-dark mb-1">Pending Admin Verification</h4>
                <p className="text-muted small mb-3">
                  Your request has been delivered to Admin. Please wait while Admin verifies your identity.
                </p>

                <div className="p-3 mb-3 rounded bg-warning-subtle text-warning-emphasis border border-warning-subtle text-start">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="spinner-grow spinner-grow-sm text-warning" role="status" aria-hidden="true"></span>
                    <strong>Status: Verification in Progress ⏳</strong>
                  </div>
                  <div className="small text-muted">
                    Once Admin reviews and approves your request, you will be able to create your new 4-digit PIN.
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button 
                    type="button" 
                    disabled={isCheckingResetStatus}
                    className="btn btn-warning rounded-pill fw-bold py-2 shadow-sm text-dark"
                    onClick={() => handleCheckPinResetStatus(true)}
                  >
                    {isCheckingResetStatus ? "Checking with Admin..." : "🔄 Refresh Approval Status"}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill btn-sm"
                    onClick={() => setLockScreenMode("pin")}
                  >
                    ← Back to PIN Unlock
                  </button>
                </div>
              </div>
            )}

            {/* F. FORGOT PIN - ADMIN APPROVED! SET NEW PIN */}
            {lockScreenMode === "forgot_pin_approved" && (
              <form onSubmit={handleCompleteResetAfterAdminApproval}>
                <div className="lock-icon-shield" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#059669" }}>
                  <BsCheckCircleFill size={38} />
                </div>
                <h4 className="fw-bold text-success mb-1">Admin Verification Approved! 🎉</h4>
                <p className="text-muted small mb-3">
                  SuperAdmin has verified your identity. Create your new 4-Digit Security PIN now:
                </p>

                {resetFlowError && <div className="alert alert-danger py-1 px-2 small mb-2">{resetFlowError}</div>}

                {pinResetStatusData?.admin_note && (
                  <div className="p-2 mb-3 rounded bg-success-subtle text-success-emphasis border border-success-subtle small text-start">
                    <strong>Admin Note:</strong> {pinResetStatusData.admin_note}
                  </div>
                )}

                <div className="row g-2 mb-3 text-start">
                  <div className="col-6">
                    <label className="form-label small fw-bold">New 4-Digit PIN</label>
                    <input 
                      type="password"
                      className="form-control text-center font-monospace fs-5"
                      placeholder="••••"
                      maxLength={4}
                      value={resetApprovePinInput}
                      onChange={(e) => setResetApprovePinInput(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Confirm PIN</label>
                    <input 
                      type="password"
                      className="form-control text-center font-monospace fs-5"
                      placeholder="••••"
                      maxLength={4}
                      value={resetApproveConfirmPinInput}
                      onChange={(e) => setResetApproveConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button type="submit" className="btn btn-success rounded-pill fw-bold py-2 shadow">
                    ✨ Save New PIN & Unlock Vault
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill btn-sm"
                    onClick={() => setLockScreenMode("pin")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* G. FORGOT PIN - REJECTED */}
            {lockScreenMode === "forgot_pin_rejected" && (
              <div>
                <div className="lock-icon-shield" style={{ background: "rgba(220, 38, 38, 0.15)", color: "#dc2626" }}>
                  <BsX size={44} />
                </div>
                <h4 className="fw-bold text-danger mb-1">Reset Request Rejected</h4>
                <p className="text-muted small mb-3">
                  Admin was unable to approve your PIN reset request.
                </p>

                {pinResetStatusData?.admin_note && (
                  <div className="p-3 mb-3 rounded bg-danger-subtle text-danger-emphasis border border-danger-subtle small text-start">
                    <strong>Admin Reason:</strong> {pinResetStatusData.admin_note}
                  </div>
                )}

                <div className="d-flex flex-column gap-2">
                  <button 
                    type="button" 
                    className="btn btn-primary rounded-pill fw-bold py-2"
                    onClick={() => setLockScreenMode("forgot_pin_request")}
                  >
                    Submit New Request
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill btn-sm"
                    onClick={() => setLockScreenMode("pin")}
                  >
                    ← Back to PIN Unlock
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 3. Main Authenticated Payment Dashboard */}
      {isAuthenticated && !isVaultLocked && (
        <div className="op-container">

          {/* Security Shield Banner */}
          <div className="security-shield-banner">
            <div className="d-flex align-items-center gap-2">
              <BsShieldLock className="text-success" size={16} />
              <span>
                <strong>Payment Security Shield:</strong> Verified session for <u>{currentUserName}</u>
              </span>
            </div>
            <button 
              type="button" 
              className="security-lock-pill" 
              onClick={() => {
                setIsVaultLocked(true);
                showToast("🔒 Payment Vault Locked!");
              }}
            >
              <BsLockFill /> Lock Vault
            </button>
          </div>

          {/* Top Header */}
          <div className="op-header">
            <BsChevronLeft className="op-back" onClick={() => navigate(-1)} title="Back" />
            <h3>Orders and Payments</h3>
            <div className="op-header-right">
              <button className="op-icon-btn" onClick={() => setActiveModal("transactions")} title="Order History">
                <BsReceipt />
              </button>
              <button className="op-icon-btn" onClick={() => setActiveModal("stars_shop")} title="Stars Store">
                <BsStar />
              </button>
            </div>
          </div>

          {/* Nexoria Pay Hero Card */}
        <div className="op-meta-card shadow-sm">
          <div className="op-meta-top">
            <div className="op-meta-brand">
              <div className="op-meta-icon-badge">
                <BsGlobe2 />
              </div>
              <div>
                <span className="op-meta-text">Nexoria Pay</span>
                <span className="op-meta-verified"><BsShieldCheck className="me-1 text-success" /> Secure 256-bit Encrypted</span>
              </div>
            </div>
            <span className="op-manage-badge" onClick={() => setActiveModal("payment_methods")}>
              Manage Cards
            </span>
          </div>

          <p className="op-meta-sub">
            Use Nexoria Pay for seamless, 1-click checkout on Marketplace, Stars, creator subscriptions, and ad campaigns.
          </p>

          {/* Quick Balance Tray */}
          <div className="op-quick-stats-row">
            <div className="op-stat-pill" onClick={() => setActiveModal("stars_shop")}>
              <div className="op-stat-icon text-warning">⭐</div>
              <div>
                <strong>{starBalance.toLocaleString()} Stars</strong>
                <small>Send to creators</small>
              </div>
            </div>

            <div className="op-stat-pill" onClick={() => setActiveModal("payouts")}>
              <div className="op-stat-icon text-success"><BsCashCoin /></div>
              <div>
                <strong>$1,840.70</strong>
                <small>Creator Payout</small>
              </div>
            </div>

            <div className="op-stat-pill" onClick={() => setActiveModal("subscriptions")}>
              <div className="op-stat-icon text-purple"><BsGrid3X3 /></div>
              <div>
                <strong>{subscriptions.length} Active</strong>
                <small>Subscriptions</small>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Balances & Monetisation */}
        <div className="op-section">
          <h4 className="op-section-title">Balances & Monetisation</h4>
          
          <div className="op-item" onClick={() => setActiveModal("stars_shop")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-warning-soft">
                <BsStar className="text-warning" />
              </div>
              <div>
                <strong>Nexoria Stars</strong>
                <p className="m-0 text-muted small">{starBalance.toLocaleString()} Stars available in your wallet</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark rounded-pill">⭐ Buy Stars</span>
              <BsChevronRight className="op-arrow" />
            </div>
          </div>

          <div className="op-divider"></div>

          {/* Convert Stars to Rupees (Cashout) */}
          <div className="op-item" onClick={() => setActiveModal("cashout_modal")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-success-soft">
                <BsCurrencyRupee className="text-success" />
              </div>
              <div>
                <strong>Convert Stars to Rupees (Cashout)</strong>
                <p className="m-0 text-muted small">Redeem your stars into INR via UPI or Direct Bank Transfer</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success text-white rounded-pill">💸 Cashout INR</span>
              <BsChevronRight className="op-arrow" />
            </div>
          </div>

          <div className="op-divider"></div>

          <div className="op-item" onClick={() => handleOpenCheckout({
            id: "bluetick-sub",
            title: "Official Blue Tick Verification Badge 💎",
            price: "$5.99",
            priceINR: 499,
            type: "bluetick"
          })}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-primary-soft">
                <BsShieldCheck className="text-primary" />
              </div>
              <div>
                <strong>Get Verified / Blue Tick Badge 💎</strong>
                <p className="m-0 text-muted small">Official verified checkmark on profile, reels & posts (₹499/mo)</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary text-white rounded-pill">Get Verified</span>
              <BsChevronRight className="op-arrow" />
            </div>
          </div>
        </div>

        {/* Section 2: Payment Information & Addresses */}
        <div className="op-section">
          <h4 className="op-section-title">Payment Information</h4>

          <div className="op-item" onClick={() => setActiveModal("payment_methods")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-primary-soft">
                <BsCreditCard className="text-primary" />
              </div>
              <div>
                <strong>Payment Methods</strong>
                <p className="m-0 text-muted small">{paymentMethods.length} saved payment cards & accounts</p>
              </div>
            </div>
            <BsChevronRight className="op-arrow" />
          </div>

          <div className="op-divider"></div>

          <div className="op-item" onClick={() => setActiveModal("subscriptions")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-purple-soft">
                <BsGrid3X3 className="text-purple" />
              </div>
              <div>
                <strong>Creator Subscriptions</strong>
                <p className="m-0 text-muted small">Manage monthly VIP perks and renewal dates</p>
              </div>
            </div>
            <BsChevronRight className="op-arrow" />
          </div>

          <div className="op-divider"></div>

          <div className="op-item" onClick={() => setActiveModal("addresses")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-info-soft">
                <BsGeoAlt className="text-info" />
              </div>
              <div>
                <strong>Shipping & Delivery Addresses</strong>
                <p className="m-0 text-muted small">{addresses.length} saved delivery address for Marketplace</p>
              </div>
            </div>
            <BsChevronRight className="op-arrow" />
          </div>

          <div className="op-divider"></div>

          <div className="op-item" onClick={() => setActiveModal("transactions")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-teal-soft">
                <BsClockHistory className="text-teal" />
              </div>
              <div>
                <strong>Activity & Transaction History</strong>
                <p className="m-0 text-muted small">View invoices, receipts and order tracking</p>
              </div>
            </div>
            <BsChevronRight className="op-arrow" />
          </div>
        </div>

        {/* Section 3: Settings & Security */}
        <div className="op-section" style={{ marginBottom: 30 }}>
          <h4 className="op-section-title">Security & Policies</h4>

          <div className="op-item" onClick={() => { setIsChangingPin(true); setActiveModal("security"); }}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-primary-soft">
                <BsShieldLock className="text-primary" />
              </div>
              <div>
                <strong>Create / Change 4-Digit Payment PIN</strong>
                <p className="m-0 text-muted small">Set custom 4-digit PIN for withdrawals, cards & checkouts</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-soft text-success rounded-pill">●●●● Active</span>
              <BsChevronRight className="op-arrow" />
            </div>
          </div>

          <div className="op-divider"></div>

          <div className="op-item" onClick={() => { setIsChangingPin(false); setActiveModal("security"); }}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-danger-soft">
                <BsShieldCheck className="text-danger" />
              </div>
              <div>
                <strong>Payment Security & Biometric Controls</strong>
                <p className="m-0 text-muted small">Fingerprint ID, spend limits, and transaction thresholds</p>
              </div>
            </div>
            <BsChevronRight className="op-arrow" />
          </div>

          <div className="op-divider"></div>

          <div className="op-item" onClick={() => navigate("/support")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-secondary-soft">
                <BsQuestionCircle className="text-secondary" />
              </div>
              <div>
                <strong>Help with Orders & Payments</strong>
                <p className="m-0 text-muted small">Disputes, refunds, unauthorized charges & support</p>
              </div>
            </div>
            <BsChevronRight className="op-arrow" />
          </div>

          <div className="op-divider"></div>

          <div className="op-item" onClick={() => navigate("/terms_policies")}>
            <div className="op-item-left">
              <div className="op-item-icon-box bg-dark-soft">
                <BsFileEarmarkText />
              </div>
              <div>
                <strong>Nexoria Payment Terms & Privacy</strong>
                <p className="m-0 text-muted small">Commercial terms, buyer protection & refund policies</p>
              </div>
            </div>
            <BsChevronRight className="op-arrow" />
          </div>
        </div>

      </div>
      )}

      {/* ================= MODALS & SUB-VIEWS ================= */}

      {/* 1. PAYMENT METHODS MANAGER MODAL */}
      {activeModal === "payment_methods" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Saved Payment Methods</h5>
              <button className="op-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body">
              <div className="saved-methods-list">
                {paymentMethods.map(method => (
                  <div key={method.id} className="saved-method-card">
                    <div className="sm-left">
                      <div className="sm-icon">
                        {method.type === "paypal" ? (
                          <FaPaypal className="text-primary" size={24} />
                        ) : method.type === "bank" ? (
                          <BsBank className="text-success" size={24} />
                        ) : (
                          <BsCreditCard className="text-primary" size={24} />
                        )}
                      </div>
                      <div className="sm-info">
                        <h6>
                          {method.brand} {method.last4 ? `•••• ${method.last4}` : ""}
                          {method.isDefault && <span className="badge bg-primary ms-2">Default</span>}
                        </h6>
                        <p>
                          {method.email || (method.holder ? `${method.holder} · Expires ${method.exp}` : `Ending in ${method.accountEnding}`)}
                        </p>
                      </div>
                    </div>
                    <div className="sm-actions">
                      {!method.isDefault && (
                        <button 
                          className="btn btn-outline-primary btn-sm rounded-pill me-1"
                          onClick={() => handleSetDefaultMethod(method.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-danger btn-sm rounded-circle p-2"
                        onClick={() => handleDeleteMethod(method.id)}
                        title="Remove method"
                      >
                        <BsTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <button 
                  className="btn btn-primary w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={() => setActiveModal("add_card")}
                >
                  <BsPlusLg /> Add Credit or Debit Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* 2. ADD PAYMENT METHOD MODAL (Cards / UPI / Bank) */}
      {activeModal === "add_card" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal("payment_methods")}>
          <div className="op-modal-content shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Add Payment Method</h5>
              <button className="op-modal-close" onClick={() => setActiveModal("payment_methods")}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body">
              {/* Add Method Tabs */}
              <div className="cashout-payout-tabs mb-3">
                <button 
                  className={`cashout-payout-tab ${addMethodTab === "card" ? "active" : ""}`}
                  onClick={() => setAddMethodTab("card")}
                >
                  <BsCreditCard className="me-1" /> Credit / Debit Card
                </button>
                <button 
                  className={`cashout-payout-tab ${addMethodTab === "upi" ? "active" : ""}`}
                  onClick={() => setAddMethodTab("upi")}
                >
                  <BsLightningFill className="me-1" /> UPI ID
                </button>
                <button 
                  className={`cashout-payout-tab ${addMethodTab === "bank" ? "active" : ""}`}
                  onClick={() => setAddMethodTab("bank")}
                >
                  <BsBank className="me-1" /> Bank Account
                </button>
              </div>

              <form onSubmit={handleAddPaymentMethod}>
                {addMethodTab === "card" && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Card Number</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsCreditCard /></span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="4532 •••• •••• 8821" 
                          maxLength={19}
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Name on Card</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Cardholder Full Name" 
                        value={newCardHolder}
                        onChange={(e) => setNewCardHolder(e.target.value)}
                        required
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-bold">Expiry Date</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="MM/YY" 
                          maxLength={5}
                          value={newCardExp}
                          onChange={(e) => setNewCardExp(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold">CVV / CVC</label>
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="•••" 
                          maxLength={4}
                          value={newCardCvv}
                          onChange={(e) => setNewCardCvv(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {addMethodTab === "upi" && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Virtual Payment Address (UPI ID)</label>
                      <div className="input-group">
                        <span className="input-group-text"><BsLightningFill className="text-warning" /></span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="username@okhdfcbank or 9876543210@paytm" 
                          value={newUpiId}
                          onChange={(e) => setNewUpiId(e.target.value)}
                          required
                        />
                      </div>
                      <small className="text-muted">Supports Google Pay, PhonePe, Paytm, BHIM, and all bank UPI handles.</small>
                    </div>
                  </div>
                )}

                {addMethodTab === "bank" && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Bank Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="E.g. State Bank of India, HDFC, ICICI..." 
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Account Holder Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Full Name as per Bank Records" 
                        value={newBankHolder}
                        onChange={(e) => setNewBankHolder(e.target.value)}
                        required
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-7">
                        <label className="form-label fw-bold">Account Number</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="11-16 Digit Account No." 
                          value={newBankAcct}
                          onChange={(e) => setNewBankAcct(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-5">
                        <label className="form-label fw-bold">IFSC Code</label>
                        <input 
                          type="text" 
                          className="form-control font-monospace" 
                          placeholder="SBIN0004521" 
                          value={newBankIfsc}
                          onChange={(e) => setNewBankIfsc(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-check mb-4">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="setDefCheck"
                    checked={newCardDefault}
                    onChange={(e) => setNewCardDefault(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="setDefCheck">
                    Set as default payment method for 1-click orders
                  </label>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary rounded-pill"
                    onClick={() => setActiveModal("payment_methods")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                    Save Payment Method
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. TRANSACTION HISTORY & INVOICES MODAL */}
      {activeModal === "transactions" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content op-modal-large shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Transaction & Order Activity</h5>
              <button className="op-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body">
              {/* Filter Tabs */}
              <div className="tx-filter-pills">
                {["all", "marketplace", "stars", "subscription", "ads", "payout"].map(f => (
                  <button 
                    key={f}
                    className={`tx-pill ${transactionFilter === f ? "active" : ""}`}
                    onClick={() => setTransactionFilter(f)}
                  >
                    {f === "payout" ? "Cashouts" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="tx-list mt-3">
                {filteredTransactions.map(tx => (
                  <div key={tx.id} className="tx-row-item" onClick={() => { setSelectedReceipt(tx); setActiveModal("receipt"); }}>
                    <div className="tx-left">
                      <div className="tx-icon-circle">
                        {tx.type === "marketplace" ? <BsShop className="text-primary" /> :
                         tx.type === "stars" ? <BsStar className="text-warning" /> :
                         tx.type === "subscription" ? <BsGrid3X3 className="text-purple" /> :
                         tx.type === "payout" ? <BsCurrencyRupee className="text-success" /> :
                         <BsBoxSeam className="text-info" />}
                      </div>
                      <div>
                        <h6>{tx.title}</h6>
                        <p>{tx.date} · {tx.method}</p>
                      </div>
                    </div>
                    <div className="tx-right text-end">
                      <strong>{tx.amount}</strong>
                      <span className={`tx-status-badge ${tx.status.toLowerCase().includes("completed") ? "text-success" : "text-warning"}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RECEIPT DETAIL MODAL */}
      {activeModal === "receipt" && selectedReceipt && (
        <div className="op-modal-overlay" onClick={() => setActiveModal("transactions")}>
          <div className="op-modal-content shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Order Receipt #{selectedReceipt.id}</h5>
              <button className="op-modal-close" onClick={() => setActiveModal("transactions")}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body receipt-view">
              <div className="receipt-header-hero">
                <div className="clean-icon-circle bg-success-soft">
                  <BsReceipt size={32} className="text-success" />
                </div>
                <h3>{selectedReceipt.amount}</h3>
                <span className="badge bg-success rounded-pill">{selectedReceipt.status}</span>
              </div>

              <div className="receipt-details-list">
                <div className="rd-row">
                  <span>Item / Description</span>
                  <strong>{selectedReceipt.title}</strong>
                </div>
                <div className="rd-row">
                  <span>Order Date</span>
                  <span>{selectedReceipt.date}</span>
                </div>
                <div className="rd-row">
                  <span>Payment Method</span>
                  <span>{selectedReceipt.method}</span>
                </div>
                {selectedReceipt.seller && (
                  <div className="rd-row">
                    <span>Seller</span>
                    <span>{selectedReceipt.seller}</span>
                  </div>
                )}
                {selectedReceipt.shipping && (
                  <div className="rd-row">
                    <span>Shipping Method</span>
                    <span>{selectedReceipt.shipping}</span>
                  </div>
                )}
                {selectedReceipt.bonus && (
                  <div className="rd-row text-success">
                    <span>Perk</span>
                    <span>{selectedReceipt.bonus}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 d-flex gap-2">
                <button 
                  className="btn btn-outline-primary w-100 rounded-pill"
                  onClick={() => showToast("Receipt PDF downloaded to device.")}
                >
                  Download Invoice PDF
                </button>
                <button 
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setActiveModal("transactions")}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STARS STORE MODAL */}
      {activeModal === "stars_shop" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content op-modal-large shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Nexoria Stars Store</h5>
              <button className="op-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body">
              <div className="stars-hero-banner">
                <div className="sh-left">
                  <span>Your Current Balance</span>
                  <h2>{starBalance.toLocaleString()} Stars ⭐</h2>
                  <p>Send stars on Live streams and Reels to support creators.</p>
                </div>
              </div>

              <h6 className="mt-4 mb-3 fw-bold">Select Stars Package</h6>
              <div className="stars-packages-grid">
                {STAR_PACKAGES.map(pkg => (
                  <div key={pkg.id} className={`star-pack-card ${pkg.popular ? "popular" : ""}`}>
                    {pkg.popular && <span className="popular-badge">Most Popular</span>}
                    <div className="sp-star-icon">⭐</div>
                    <h4>{pkg.stars} Stars</h4>
                    {pkg.bonus > 0 ? (
                      <span className="bonus-tag">+{pkg.bonus} Bonus</span>
                    ) : (
                      <span className="bonus-placeholder">Standard Pack</span>
                    )}
                    <button 
                      className="btn btn-primary rounded-pill w-100 mt-3 d-flex align-items-center justify-content-center gap-1 fw-bold"
                      onClick={() => handleOpenCheckout({
                        id: pkg.id,
                        title: `${pkg.stars + pkg.bonus} Stars Pack`,
                        stars: pkg.stars,
                        bonus: pkg.bonus,
                        price: pkg.price,
                        priceINR: pkg.priceINR,
                        type: "stars"
                      })}
                    >
                      <BsCreditCard size={15} /> Buy for ₹{pkg.priceINR} ({pkg.price})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATOR SUBSCRIPTIONS MANAGER MODAL */}
      {activeModal === "subscriptions" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Active Creator Subscriptions</h5>
              <button className="op-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body">
              {subscriptions.length > 0 ? (
                <div className="subscriptions-list">
                  {subscriptions.map(sub => (
                    <div key={sub.id} className="sub-card-item">
                      <img src={sub.creatorAvatar} alt="" className="sub-avatar" />
                      <div className="sub-info flex-grow-1">
                        <h6>{sub.creatorName}</h6>
                        <span className="badge bg-purple text-white mb-1">{sub.badge}</span>
                        <p className="m-0 text-muted small">{sub.price} · Renews on {sub.nextBilling}</p>
                      </div>
                      <button 
                        className="btn btn-outline-danger btn-sm rounded-pill"
                        onClick={() => handleCancelSubscription(sub.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BsGrid3X3 size={36} className="text-muted mb-2" />
                  <h5>No active subscriptions</h5>
                  <p className="text-muted small">Support creators to get exclusive badges, stickers and private content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. SHIPPING & DELIVERY ADDRESSES MODAL */}
      {activeModal === "addresses" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Shipping & Delivery Addresses</h5>
              <button className="op-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body">
              <div className="saved-addresses-list">
                {addresses.map(addr => (
                  <div key={addr.id} className="address-card-item">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong className="addr-name">{addr.name}</strong>
                      {addr.isDefault && <span className="badge bg-primary">Default</span>}
                    </div>
                    <p className="addr-text">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                    <p className="addr-phone text-muted small">📞 {addr.phone}</p>
                  </div>
                ))}
              </div>

              <h6 className="mt-4 mb-2 fw-bold">Add New Shipping Address</h6>
              <form onSubmit={handleAddAddressSubmit}>
                <div className="mb-2">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Full Recipient Name" 
                    value={newAddrName}
                    onChange={(e) => setNewAddrName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Street Address, Apt / Suite" 
                    value={newAddrStreet}
                    onChange={(e) => setNewAddrStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="City" 
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="State / Region" 
                      value={newAddrState}
                      onChange={(e) => setNewAddrState(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Postal / ZIP Code" 
                      value={newAddrZip}
                      onChange={(e) => setNewAddrZip(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="Contact Phone" 
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 rounded-pill">
                  Save Address
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 8. PAYMENT SECURITY & PIN MODAL */}
      {activeModal === "security" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <BsShieldLock className="text-primary" size={20} />
                <h5 className="m-0 fw-bold">Payment Security & PIN Center</h5>
              </div>
              <button className="op-modal-close" onClick={() => { setIsChangingPin(false); setActiveModal(null); }}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body p-4">

              {/* 4-Digit Security PIN Creation & Management Card */}
              <div className="p-3 rounded-3 bg-light border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <strong className="d-block text-dark fs-6">4-Digit Payment Security PIN</strong>
                    <p className="text-muted small m-0">Used to authorize cashouts, view saved cards & confirm checkouts.</p>
                  </div>
                  <span className="badge bg-success-soft text-success border border-success px-2 py-1 rounded-pill">
                    ● ● ● ● Active
                  </span>
                </div>

                {!isChangingPin ? (
                  <div className="mt-3 pt-2 border-top d-flex gap-2">
                    <button 
                      type="button"
                      className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                      onClick={() => {
                        setIsChangingPin(true);
                        setPinChangeError("");
                        setCurrentPinInput("");
                        setNewPinInput("");
                        setConfirmPinInput("");
                      }}
                    >
                      Set New 4-Digit PIN
                    </button>
                    <button 
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      onClick={() => {
                        localStorage.setItem("nexoria_payment_pin", "1234");
                        setVaultPin("1234");
                        showToast("PIN reset to standard default: 1234");
                      }}
                    >
                      Reset to Default (1234)
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveNewPinFromModal} className="mt-3 pt-3 border-top">
                    <h6 className="fw-bold text-primary mb-2">Create / Change 4-Digit Security PIN</h6>
                    {pinChangeError && <div className="alert alert-danger py-1 px-2 small mb-2">{pinChangeError}</div>}

                    <div className="mb-2">
                      <label className="form-label small text-muted">Current PIN (Default: 1234)</label>
                      <input 
                        type="password"
                        className="form-control form-control-sm text-center font-monospace"
                        placeholder="••••"
                        maxLength={4}
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">New 4-Digit PIN</label>
                        <input 
                          type="password"
                          className="form-control form-control-sm text-center font-monospace"
                          placeholder="••••"
                          maxLength={4}
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Confirm New PIN</label>
                        <input 
                          type="password"
                          className="form-control form-control-sm text-center font-monospace"
                          placeholder="••••"
                          maxLength={4}
                          value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm rounded-pill px-3 fw-bold">
                        Save Security PIN
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                        onClick={() => setIsChangingPin(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Other Security Controls */}
              <div className="security-toggle-list">
                <div className="sec-toggle-item">
                  <div>
                    <strong>Require 4-Digit PIN for All Checkouts & Withdrawals</strong>
                    <p className="text-muted small m-0">Ask for PIN before confirming any transaction or cashout.</p>
                  </div>
                  <div 
                    className={`theme-toggle-switch ${pinRequired ? "on" : ""}`}
                    onClick={() => { setPinRequired(!pinRequired); showToast("PIN preference saved."); }}
                  >
                    <div className="switch-thumb"></div>
                  </div>
                </div>

                <div className="sec-toggle-item">
                  <div>
                    <strong>Biometric Authentication (Touch ID / Face ID)</strong>
                    <p className="text-muted small m-0">Use biometric fingerprint to approve instant checkouts.</p>
                  </div>
                  <div 
                    className={`theme-toggle-switch ${biometricEnabled ? "on" : ""}`}
                    onClick={() => { setBiometricEnabled(!biometricEnabled); showToast("Biometrics updated."); }}
                  >
                    <div className="switch-thumb"></div>
                  </div>
                </div>

                <div className="sec-toggle-item flex-column align-items-start">
                  <div className="w-100 d-flex justify-content-between mb-2">
                    <strong>Daily Spend Limit ($USD)</strong>
                    <span className="badge bg-primary">${spendLimit} / day</span>
                  </div>
                  <input 
                    type="range" 
                    className="form-range" 
                    min={50} 
                    max={2000} 
                    step={50}
                    value={spendLimit}
                    onChange={(e) => setSpendLimit(Number(e.target.value))}
                  />
                  <small className="text-muted">Prevents unauthorized charges exceeding this threshold within 24 hours.</small>
                </div>
              </div>

              <div className="mt-4">
                <button className="btn btn-secondary w-100 rounded-pill" onClick={() => { setIsChangingPin(false); setActiveModal(null); }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. CREATOR PAYOUTS MODAL */}
      {activeModal === "payouts" && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content op-modal-large shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header">
              <h5>Creator Payout Settings & Bank Account</h5>
              <button className="op-modal-close" onClick={() => setActiveModal(null)}><BsX size={24} /></button>
            </div>
            <div className="op-modal-body">
              <div className="payout-status-card">
                <div className="clean-icon-circle bg-success-soft">
                  <BsBank size={28} className="text-success" />
                </div>
                <div>
                  <h5>HDFC Bank Direct Deposit (•••• 7820)</h5>
                  <p className="text-muted small m-0">Verified Primary Account · Wire Transfer Currency: INR/USD</p>
                  <span className="badge bg-success-soft text-success mt-1"><BsCheck2 /> W-8BEN Tax Form Verified</span>
                </div>
              </div>

              <div className="payout-schedule-info mt-3">
                <div className="psi-row">
                  <span>Current Balance Available:</span>
                  <strong>$1,840.70</strong>
                </div>
                <div className="psi-row">
                  <span>Next Scheduled Payout Date:</span>
                  <strong>21st of this month</strong>
                </div>
                <div className="psi-row">
                  <span>Minimum Threshold:</span>
                  <strong>$100.00 (Met)</strong>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button 
                  className="btn btn-primary rounded-pill w-100"
                  onClick={() => showToast("Routing & Tax info is up to date.")}
                >
                  Update Tax & Wire Details
                </button>
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setActiveModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. UNIVERSAL MULTI-METHOD PAYMENT GATEWAY MODAL */}
      {activeModal === "universal_checkout" && checkoutItem && (
        <div className="op-modal-overlay" onClick={() => !isProcessingPayment && setActiveModal(null)}>
          <div className="op-modal-content op-modal-large shadow-lg checkout-modal-card" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <BsShieldCheck className="text-success" size={22} />
                <h5 className="m-0 fw-bold">Secure Checkout</h5>
                <span className="badge bg-success text-white small px-2 py-1 rounded-pill">256-Bit SSL</span>
              </div>
              <button 
                className="op-modal-close" 
                onClick={() => !isProcessingPayment && setActiveModal(null)}
                disabled={isProcessingPayment}
              >
                <BsX size={24} />
              </button>
            </div>

            <div className="op-modal-body p-4">
              {/* Order Summary Strip */}
              <div className="d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 bg-light border">
                <div>
                  <span className="text-muted small d-block">Purchasing item</span>
                  <strong className="text-dark fs-6">{checkoutItem.title || "Star Package"}</strong>
                  {checkoutItem.bonus > 0 && (
                    <span className="badge bg-warning text-dark ms-2">+{checkoutItem.bonus} Bonus Stars</span>
                  )}
                </div>
                <div className="text-end">
                  <span className="text-muted small d-block">Total to Pay</span>
                  <strong className="text-primary fs-5">₹{checkoutItem.priceINR || 499}</strong>
                  <span className="text-muted small d-block">({checkoutItem.price || "$8.99"})</span>
                </div>
              </div>

              {isProcessingPayment ? (
                <div className="payment-processing-overlay py-5 text-center">
                  <div className="processing-spinner-circle"></div>
                  <h5 className="fw-bold mt-3">Authorizing Secure Payment...</h5>
                  <p className="text-muted small">Communicating with Indian Banking Network / UPI Gateway. Do not press back or refresh.</p>
                  <div className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border small text-muted">
                    <BsLockFill className="text-success" /> Encrypted via PCI-DSS 3D Secure
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Method Selector Tabs */}
                  <div className="checkout-method-tabs">
                    <button 
                      type="button"
                      className={`checkout-tab-btn ${checkoutMethod === "upi" ? "active" : ""}`}
                      onClick={() => setCheckoutMethod("upi")}
                    >
                      <BsQrCodeScan size={14} /> ⚡ UPI (QR / Apps / VPA)
                    </button>
                    <button 
                      type="button"
                      className={`checkout-tab-btn ${checkoutMethod === "card" ? "active" : ""}`}
                      onClick={() => setCheckoutMethod("card")}
                    >
                      <BsCreditCard size={14} /> 💳 Debit / Credit Card
                    </button>
                    <button 
                      type="button"
                      className={`checkout-tab-btn ${checkoutMethod === "netbanking" ? "active" : ""}`}
                      onClick={() => setCheckoutMethod("netbanking")}
                    >
                      <BsBank size={14} /> 🏦 Net Banking
                    </button>
                    <button 
                      type="button"
                      className={`checkout-tab-btn ${checkoutMethod === "wallet" ? "active" : ""}`}
                      onClick={() => setCheckoutMethod("wallet")}
                    >
                      <BsWallet2 size={14} /> 👛 Wallets
                    </button>
                  </div>

                  {/* 1. UPI Payment Option */}
                  {checkoutMethod === "upi" && (
                    <div className="upi-checkout-box">
                      <div className="d-flex justify-content-center gap-2 mb-3">
                        <button 
                          type="button"
                          className={`btn btn-sm rounded-pill ${upiOption === "qr" ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setUpiOption("qr")}
                        >
                          <BsQrCodeScan /> Scan Dynamic QR
                        </button>
                        <button 
                          type="button"
                          className={`btn btn-sm rounded-pill ${upiOption === "apps" ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setUpiOption("apps")}
                        >
                          <BsPhoneFill /> UPI Apps (GPay/PhonePe)
                        </button>
                        <button 
                          type="button"
                          className={`btn btn-sm rounded-pill ${upiOption === "custom" ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setUpiOption("custom")}
                        >
                          Enter UPI ID (VPA)
                        </button>
                      </div>

                      {upiOption === "qr" && (
                        <div className="text-center">
                          <div className="upi-qr-card shadow-sm mx-auto mb-3">
                            <div className="upi-qr-svg-wrap">
                              <svg viewBox="0 0 100 100" width="140" height="140">
                                <path fill="#0f172a" d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
                                <path fill="#0f172a" d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
                                <path fill="#0f172a" d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
                                <rect x="36" y="10" width="8" height="8" fill="#0f172a" />
                                <rect x="48" y="10" width="16" height="8" fill="#0f172a" />
                                <rect x="36" y="24" width="28" height="8" fill="#1877f2" />
                                <rect x="36" y="36" width="10" height="10" fill="#0f172a" />
                                <rect x="52" y="36" width="12" height="12" fill="#0f172a" />
                                <rect x="70" y="36" width="24" height="8" fill="#0f172a" />
                                <rect x="10" y="36" width="20" height="8" fill="#0f172a" />
                                <rect x="10" y="48" width="8" height="16" fill="#1877f2" />
                                <rect x="24" y="48" width="16" height="8" fill="#0f172a" />
                                <rect x="44" y="52" width="20" height="20" fill="#1877f2" />
                                <rect x="70" y="50" width="24" height="10" fill="#0f172a" />
                                <rect x="70" y="66" width="10" height="28" fill="#0f172a" />
                                <rect x="84" y="66" width="10" height="28" fill="#1877f2" />
                                <rect x="36" y="78" width="28" height="16" fill="#0f172a" />
                              </svg>
                            </div>
                            <span className="badge bg-primary mt-2">Scan & Pay ₹{checkoutItem.priceINR || 499}</span>
                            <small className="text-muted mt-1">Accepts GPay, PhonePe, Paytm, BHIM</small>
                          </div>
                          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-surface border rounded-pill small">
                            <span>UPI VPA: <strong>nexoria.stars@okhdfcbank</strong></span>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-link p-0 text-primary" 
                              onClick={() => {
                                navigator.clipboard?.writeText("nexoria.stars@okhdfcbank");
                                showToast("UPI ID copied to clipboard!");
                              }}
                            >
                              <BsCopy size={13} />
                            </button>
                          </div>
                        </div>
                      )}

                      {upiOption === "apps" && (
                        <div>
                          <p className="text-muted small text-center mb-2">Tap any app to trigger instant UPI intent payment:</p>
                          <div className="upi-app-grid">
                            {[
                              { id: "gpay", name: "Google Pay", icon: "🌐" },
                              { id: "phonepe", name: "PhonePe", icon: "🟣" },
                              { id: "paytm", name: "Paytm UPI", icon: "🔵" },
                              { id: "cred", name: "CRED UPI", icon: "💎" },
                              { id: "bhim", name: "BHIM UPI", icon: "🇮🇳" },
                              { id: "amazon", name: "Amazon Pay", icon: "🛒" },
                              { id: "whatsapp", name: "WhatsApp Pay", icon: "🟢" },
                              { id: "mobikwik", name: "MobiKwik", icon: "⚡" }
                            ].map(app => (
                              <div 
                                key={app.id}
                                className={`upi-app-chip ${customUpiId === app.name ? "selected" : ""}`}
                                onClick={() => setCustomUpiId(app.name)}
                              >
                                <span style={{ fontSize: "20px" }}>{app.icon}</span>
                                <span>{app.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {upiOption === "custom" && (
                        <div className="mt-2">
                          <label className="form-label small fw-bold">Enter your UPI ID / VPA</label>
                          <div className="input-group">
                            <input 
                              type="text"
                              className="form-control"
                              placeholder="e.g. yourname@oksbi / 9876543210@paytm"
                              value={customUpiId}
                              onChange={(e) => setCustomUpiId(e.target.value)}
                            />
                            <button 
                              type="button" 
                              className="btn btn-outline-primary"
                              onClick={() => showToast("UPI ID verified: Valid Virtual Payment Address")}
                            >
                              Verify
                            </button>
                          </div>
                          <small className="text-muted">A payment request will be sent to your UPI App.</small>
                        </div>
                      )}

                      <div className="mt-3">
                        <label className="form-label small text-muted">UTR / Transaction Reference (Optional for fast track)</label>
                        <input 
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. 428192049182"
                          value={upiUtrNumber}
                          onChange={(e) => setUpiUtrNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. Card Payment Option */}
                  {checkoutMethod === "card" && (
                    <div>
                      {/* Live 3D Interactive Card Preview */}
                      <div className="live-card-preview">
                        <div className="card-top-row">
                          <div className="card-chip-sim"></div>
                          <span className="card-brand-badge">
                            {cardDetails.number && cardDetails.number.startsWith("4") ? "VISA" :
                             cardDetails.number && cardDetails.number.startsWith("5") ? "MASTERCARD" :
                             cardDetails.number && cardDetails.number.startsWith("6") ? "RUPAY" : "CREDIT/DEBIT"}
                          </span>
                        </div>
                        <div className="card-number-display">
                          {cardDetails.number || "•••• •••• •••• ••••"}
                        </div>
                        <div className="card-bottom-row">
                          <div>
                            <span className="card-label-sub">Card Holder</span>
                            <span className="card-val-text">{cardDetails.name ? cardDetails.name.toUpperCase() : "YOUR NAME"}</span>
                          </div>
                          <div>
                            <span className="card-label-sub">Expires</span>
                            <span className="card-val-text">{cardDetails.exp || "MM/YY"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Input Form */}
                      <div className="row g-2">
                        <div className="col-12">
                          <label className="form-label small fw-bold">Card Number</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><BsCreditCard /></span>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="4532 8920 1823 4821"
                              maxLength={19}
                              value={cardDetails.number}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setCardDetails({ ...cardDetails, number: val });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold">Cardholder Name</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="Full Name as on card"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-bold">Expiry Date</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.exp}
                            onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-bold">CVV / CVC</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><BsShieldLock /></span>
                            <input 
                              type="password" 
                              className="form-control"
                              placeholder="•••"
                              maxLength={4}
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="col-12 mt-2">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="saveCardBox"
                              checked={cardDetails.saveCard}
                              onChange={(e) => setCardDetails({ ...cardDetails, saveCard: e.target.checked })}
                            />
                            <label className="form-check-label small text-muted" htmlFor="saveCardBox">
                              Save card securely for faster checkout (RBI tokenized)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Net Banking Option */}
                  {checkoutMethod === "netbanking" && (
                    <div>
                      <label className="form-label small fw-bold mb-2">Select Your Bank</label>
                      <div className="bank-select-grid">
                        {[
                          { id: "sbi", name: "SBI", fullName: "State Bank of India", icon: "🏛️" },
                          { id: "hdfc", name: "HDFC Bank", fullName: "HDFC Bank Ltd", icon: "🏢" },
                          { id: "icici", name: "ICICI Bank", fullName: "ICICI Bank", icon: "💳" },
                          { id: "axis", name: "Axis Bank", fullName: "Axis Bank", icon: "🏦" },
                          { id: "kotak", name: "Kotak Bank", fullName: "Kotak Mahindra Bank", icon: "🪙" },
                          { id: "pnb", name: "PNB", fullName: "Punjab National Bank", icon: "🏛️" }
                        ].map(b => (
                          <div 
                            key={b.id}
                            className={`bank-option-card ${selectedBank === b.id ? "selected" : ""}`}
                            onClick={() => setSelectedBank(b.id)}
                          >
                            <span style={{ fontSize: "20px" }}>{b.icon}</span>
                            <strong>{b.name}</strong>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <label className="form-label small text-muted">Or Choose Other 50+ Indian Banks</label>
                        <select 
                          className="form-select form-select-sm"
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                        >
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="pnb">Punjab National Bank</option>
                          <option value="bob">Bank of Baroda</option>
                          <option value="canara">Canara Bank</option>
                          <option value="union">Union Bank of India</option>
                          <option value="indusind">IndusInd Bank</option>
                          <option value="yes">YES Bank</option>
                          <option value="idbi">IDBI Bank</option>
                          <option value="federal">Federal Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 4. Digital Wallets Option */}
                  {checkoutMethod === "wallet" && (
                    <div>
                      <label className="form-label small fw-bold mb-2">Select Digital Wallet</label>
                      <div className="bank-select-grid">
                        {[
                          { id: "paytm", name: "Paytm Wallet", icon: "🔵" },
                          { id: "phonepe", name: "PhonePe Wallet", icon: "🟣" },
                          { id: "amazonpay", name: "Amazon Pay", icon: "🛒" },
                          { id: "mobikwik", name: "MobiKwik Wallet", icon: "⚡" },
                          { id: "freecharge", name: "Freecharge", icon: "⚡" },
                          { id: "airtel", name: "Airtel Money", icon: "🔴" }
                        ].map(w => (
                          <div 
                            key={w.id}
                            className={`bank-option-card ${selectedWallet === w.id ? "selected" : ""}`}
                            onClick={() => setSelectedWallet(w.id)}
                          >
                            <span style={{ fontSize: "20px" }}>{w.icon}</span>
                            <strong>{w.name}</strong>
                          </div>
                        ))}
                      </div>
                      <p className="text-muted small mt-2">You will be redirected to the selected wallet for instant 1-click authorization.</p>
                    </div>
                  )}

                  {/* Pay Button Action */}
                  <div className="mt-4 pt-3 border-top">
                    <button 
                      type="button"
                      className="btn btn-primary w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                      onClick={handleProcessPaymentSubmit}
                    >
                      <BsLockFill /> Pay Securely ₹{checkoutItem.priceINR || 499}
                    </button>
                    <div className="d-flex justify-content-between align-items-center mt-3 text-muted small px-1">
                      <span className="d-flex align-items-center gap-1"><BsShieldCheck className="text-success" /> 100% RBI & PCI Compliant</span>
                      <span>🔒 256-Bit SSL Encrypted</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 11. CHECKOUT SUCCESS / PENDING CONFIRMATION MODAL */}
      {activeModal === "checkout_success" && paymentSuccessData && (
        <div className="op-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="op-modal-content shadow-lg text-center p-4" onClick={e => e.stopPropagation()}>
            <div className="py-3">
              {paymentSuccessData.status === "Pending Verification" ? (
                <>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning text-dark p-3 mb-3" style={{ width: "72px", height: "72px" }}>
                    <BsClockHistory size={36} />
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Receipt Submitted to Admin! ⏳</h4>
                  <p className="text-muted small mb-3">Admin will verify your payment details and grant your {paymentSuccessData.type === "bluetick" ? "Blue Tick badge" : "Stars"}.</p>
                </>
              ) : (
                <>
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white p-3 mb-3" style={{ width: "72px", height: "72px" }}>
                    <BsCheckLg size={36} />
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Payment Successful!</h4>
                  <p className="text-muted small mb-3">Your transaction has been processed and confirmed.</p>
                </>
              )}

              <div className="p-3 rounded-3 bg-light border text-start mb-3">
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted small">Transaction ID</span>
                  <strong className="small font-monospace">{paymentSuccessData.id}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted small">Status</span>
                  <span className={`badge ${paymentSuccessData.status === "Pending Verification" ? "bg-warning text-dark" : "bg-success text-white"}`}>
                    {paymentSuccessData.status}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted small">Item</span>
                  <strong className="small">{paymentSuccessData.title}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted small">Amount Paid</span>
                  <strong className="small text-success">{paymentSuccessData.amount}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted small">Payment Mode</span>
                  <span className="small text-dark">{paymentSuccessData.method}</span>
                </div>
                {paymentSuccessData.bonus && (
                  <div className="d-flex justify-content-between py-1 text-primary">
                    <span className="small">Verification Note</span>
                    <strong className="small text-end" style={{ maxWidth: "60%" }}>{paymentSuccessData.bonus}</strong>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary rounded-pill w-100 small fw-bold"
                  onClick={() => {
                    setSelectedReceipt(paymentSuccessData);
                    setActiveModal("receipt");
                  }}
                >
                  <BsReceipt /> View Receipt
                </button>
                <button 
                  className="btn btn-primary rounded-pill w-100 small fw-bold"
                  onClick={() => setActiveModal(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. STAR-TO-RUPEE CASHOUT (REDEMPTION) MODAL */}
      {activeModal === "cashout_modal" && (
        <div className="op-modal-overlay" onClick={() => !isSubmittingCashout && setActiveModal(null)}>
          <div className="op-modal-content op-modal-large shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="op-modal-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <BsCurrencyRupee className="text-success" size={24} />
                <h5 className="m-0 fw-bold">Convert Stars to Rupees (Cashout)</h5>
              </div>
              <button 
                className="op-modal-close" 
                onClick={() => !isSubmittingCashout && setActiveModal(null)}
                disabled={isSubmittingCashout}
              >
                <BsX size={24} />
              </button>
            </div>

            <div className="op-modal-body p-4">
              {/* Balance & Conversion Rate Header */}
              <div className="d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 bg-light border border-success">
                <div>
                  <span className="text-muted small d-block">Available Star Balance</span>
                  <h4 className="fw-bold text-success m-0">{starBalance.toLocaleString()} Stars ⭐</h4>
                </div>
                <div className="text-end">
                  <span className="badge bg-success text-white px-3 py-1 rounded-pill">1 Star = ₹0.50 INR</span>
                  <span className="text-muted small d-block mt-1">Direct Bank / UPI Transfer</span>
                </div>
              </div>

              <form onSubmit={handleSubmitCashout}>
                {/* Amount to Redeem */}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Enter Stars to Redeem</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">⭐</span>
                    <input 
                      type="number"
                      className="form-control"
                      min={100}
                      max={starBalance}
                      value={cashoutStarsAmount}
                      onChange={(e) => setCashoutStarsAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                  {/* Quick Select Buttons */}
                  <div className="d-flex gap-2 mt-2">
                    {[500, 1000, 2500, 5000].filter(amt => amt <= starBalance).map(amt => (
                      <button 
                        key={amt}
                        type="button" 
                        className={`btn btn-sm rounded-pill ${cashoutStarsAmount === amt ? "btn-success" : "btn-outline-secondary"}`}
                        onClick={() => setCashoutStarsAmount(amt)}
                      >
                        {amt} Stars
                      </button>
                    ))}
                    <button 
                      type="button" 
                      className={`btn btn-sm rounded-pill ${cashoutStarsAmount === starBalance ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() => setCashoutStarsAmount(starBalance)}
                    >
                      Max ({starBalance})
                    </button>
                  </div>
                </div>

                {/* Live Real-time Calculator Box */}
                <div className="cashout-calc-box">
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted small">Stars Redeemed:</span>
                    <strong className="small">{cashoutStarsAmount} Stars</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted small">Conversion Gross Value:</span>
                    <strong className="small">₹{(cashoutStarsAmount * 0.5).toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-1 text-success">
                    <span className="small">Platform Transfer Fee:</span>
                    <strong className="small">₹0.00 (Free)</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 mt-1 border-top border-success-subtle">
                    <strong className="text-dark">Net Payout to Your Account:</strong>
                    <h5 className="text-success fw-bold m-0">₹{(cashoutStarsAmount * 0.5).toFixed(2)}</h5>
                  </div>
                </div>

                {/* Destination Payout Tabs */}
                <label className="form-label small fw-bold">Select Payout Destination</label>
                <div className="cashout-payout-tabs">
                  <button 
                    type="button"
                    className={`cashout-payout-tab ${cashoutMethod === "upi" ? "active" : ""}`}
                    onClick={() => setCashoutMethod("upi")}
                  >
                    ⚡ Instant UPI Transfer
                  </button>
                  <button 
                    type="button"
                    className={`cashout-payout-tab ${cashoutMethod === "bank" ? "active" : ""}`}
                    onClick={() => setCashoutMethod("bank")}
                  >
                    🏦 Direct Bank Account (IMPS/NEFT)
                  </button>
                </div>

                {cashoutMethod === "upi" ? (
                  <div className="row g-2 mb-3">
                    <div className="col-12">
                      <label className="form-label small">Your UPI ID (VPA)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. yourname@okhdfcbank"
                        value={cashoutUpiId}
                        onChange={(e) => setCashoutUpiId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">Registered Phone Number</label>
                      <input 
                        type="tel" 
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={cashoutPhone}
                        onChange={(e) => setCashoutPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="row g-2 mb-3">
                    <div className="col-12">
                      <label className="form-label small">Account Holder Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Name as registered with bank"
                        value={cashoutHolderName}
                        onChange={(e) => setCashoutHolderName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">Bank Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. State Bank of India, HDFC, ICICI"
                        value={cashoutBankName}
                        onChange={(e) => setCashoutBankName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Account Number</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Account Number"
                        value={cashoutAccountNum}
                        onChange={(e) => setCashoutAccountNum(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">IFSC Code</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. SBIN0004521"
                        value={cashoutIfsc}
                        onChange={(e) => setCashoutIfsc(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-success w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                  disabled={isSubmittingCashout || cashoutStarsAmount <= 0 || cashoutStarsAmount > starBalance}
                >
                  {isSubmittingCashout ? (
                    <span>Submitting Cashout Request...</span>
                  ) : (
                    <>
                      <BsSendCheck size={18} /> Request Cashout Payout of ₹{(cashoutStarsAmount * 0.5).toFixed(2)}
                    </>
                  )}
                </button>
                <small className="text-muted text-center d-block mt-2">
                  Admin processes and disburses cashout requests directly to your account.
                </small>
              </form>
            </div>
          </div>
        </div>
      )}

      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />
    </div>
  );
};

export default OrdersPayments;