import React, { useState, useEffect, useMemo } from 'react';

const WHEEL_SLICES = [
  { label: '10% OFF', value: 10, weight: 5,  color: '#3b82f6' }, 
  { label: '20% OFF', value: 20, weight: 10, color: '#10b981' }, 
  { label: '30% OFF', value: 30, weight: 25, color: '#f59e0b' }, 
  { label: '40% OFF', value: 40, weight: 25, color: '#ef4444' }, 
  { label: '50% OFF', value: 50, weight: 20, color: '#8b5cf6' }, 
  { label: '60% OFF', value: 60, weight: 5,  color: '#ec4899' }, 
  { label: '80% OFF', value: 80, weight: 2,  color: '#14b8a6' }, 
  { label: 'Try Again', value: 0, weight: 8, color: '#64748b' }  
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const getUniqueUserKey = (emailProp) => {
  if (emailProp && emailProp.includes('@')) return `premium_offer_${emailProp}`;
  
  const token = localStorage.getItem('jwt_token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const uniqueId = payload.email || payload.sub || payload.id || payload.userId;
      if (uniqueId) return `premium_offer_${uniqueId}`;
    } catch (e) {
      console.warn("Could not decode JWT. Falling back to guest.");
    }
  }
  return 'premium_offer_guest';
};

export default function UpgradeModal({ isOpen, onClose, userEmail }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentLandedSlice, setCurrentLandedSlice] = useState(null);
  
  const [offerState, setOfferState] = useState({
    spinsLeft: 3,
    highestWin: null,
    expiresAt: null,
    lockoutUntil: null
  });

  const [timeLeft, setTimeLeft] = useState('');
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState('');

  const storageKey = useMemo(() => getUniqueUserKey(userEmail), [userEmail, isOpen]);

  // --- 1. INITIALIZATION & STATE RECOVERY ---
  useEffect(() => {
    if (isOpen) {
      setIsSpinning(false);
      setShowConfetti(false);
      setCurrentLandedSlice(null);

      const savedStateStr = localStorage.getItem(storageKey);
      if (savedStateStr) {
        const savedState = JSON.parse(savedStateStr);
        const now = Date.now();

        if (savedState.lockoutUntil && savedState.lockoutUntil > now) {
          setOfferState(savedState);
          return;
        }

        if (savedState.expiresAt && savedState.expiresAt < now && (!savedState.lockoutUntil || savedState.lockoutUntil < now)) {
          const newState = {
            spinsLeft: 0,
            highestWin: null,
            expiresAt: null,
            lockoutUntil: now + (24 * 60 * 60 * 1000) 
          };
          setOfferState(newState);
          localStorage.setItem(storageKey, JSON.stringify(newState));
          return;
        }

        setOfferState(savedState);
      } else {
        setOfferState({ spinsLeft: 3, highestWin: null, expiresAt: null, lockoutUntil: null });
      }
    }
  }, [isOpen, storageKey]);

  // --- 2. TIMER ENGINES ---
  useEffect(() => {
    let interval;
    if (isOpen) {
      interval = setInterval(() => {
        const now = Date.now();

        if (offerState.expiresAt && !offerState.lockoutUntil) {
          const remaining = offerState.expiresAt - now;
          if (remaining <= 0) {
            const newState = {
              spinsLeft: 0,
              highestWin: null,
              expiresAt: null,
              lockoutUntil: now + (24 * 60 * 60 * 1000)
            };
            setOfferState(newState);
            localStorage.setItem(storageKey, JSON.stringify(newState));
          } else {
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
          }
        }

        if (offerState.lockoutUntil) {
          const remaining = offerState.lockoutUntil - now;
          if (remaining <= 0) {
            const newState = { spinsLeft: 3, highestWin: null, expiresAt: null, lockoutUntil: null };
            setOfferState(newState);
            localStorage.removeItem(storageKey);
          } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const mins = Math.floor((remaining % (1000 * 60 * 60)) / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            setLockoutTimeLeft(`${hours}h ${mins}m ${secs}s`);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, offerState, storageKey]);

  if (!isOpen) return null;

  // --- 3. THE TRUE WEIGHTED RANDOM LOGIC ---
  const getRandomSliceIndex = () => {
    const totalWeight = WHEEL_SLICES.reduce((sum, slice) => sum + slice.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < WHEEL_SLICES.length; i++) {
      if (randomNum < WHEEL_SLICES[i].weight) return i;
      randomNum -= WHEEL_SLICES[i].weight;
    }
    return 0; 
  };

  const handleSpin = () => {
    if (isSpinning || offerState.spinsLeft <= 0 || offerState.lockoutUntil) return;
    
    setIsSpinning(true);
    setShowConfetti(false);
    setCurrentLandedSlice(null);
    
    const winningIndex = getRandomSliceIndex();
    const winningSlice = WHEEL_SLICES[winningIndex];
    const sliceCenterAngle = (winningIndex * 45) + 22.5;
    const targetDegree = 360 - sliceCenterAngle;
    const currentBaseSpins = Math.floor(wheelRotation / 360);
    const newRotation = ((currentBaseSpins + 3) * 360) + targetDegree;
    
    setWheelRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setCurrentLandedSlice(winningSlice);
      
      // FIX 1: Ignore "Try Again" (0%) when calculating the highest win
      let newHighest = offerState.highestWin;
      if (winningSlice.value > 0) {
        if (!newHighest || winningSlice.value > newHighest.value) {
          newHighest = winningSlice;
        }
      }

      // FIX 2: Do not deduct a spin if they land on "Try Again"
      const spinsToDeduct = winningSlice.value === 0 ? 0 : 1;

      const newExpiresAt = offerState.expiresAt || (Date.now() + 15 * 60 * 1000);

      const newState = {
        spinsLeft: offerState.spinsLeft - spinsToDeduct,
        highestWin: newHighest,
        expiresAt: newExpiresAt,
        lockoutUntil: null
      };

      setOfferState(newState);
      localStorage.setItem(storageKey, JSON.stringify(newState));

      // Only show confetti if they landed on a real discount
      if (winningSlice.value > 0) setShowConfetti(true);

    }, 5000);
  };

  const handleUpgradeClick = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      /* Uncomment this when your backend is ready!
        const orderResponse = await axios.post(
          `${API_URL}/api/payments/create-order`,
          { discountPercentage: offerState.highestWin.value, plan: "PRO_LIFETIME" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const orderData = orderResponse.data;
      */
      
      // Mock Data for Testing UI
      const orderData = { id: "order_mock123", amount: 49900 }; 

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", 
        amount: orderData.amount, 
        currency: "INR",
        name: "Enterprise Resume Builder",
        description: `PRO Upgrade - ${offerState.highestWin.value}% OFF Applied!`,
        order_id: orderData.id, 
        handler: async function (response) {
          alert(`Payment Successful! Signature: ${response.razorpay_signature}`);
          localStorage.removeItem(storageKey);
          window.location.reload();
        },
        prefill: {
          email: userEmail || "", 
        },
        theme: {
          color: "#10b981", 
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Error creating order:", error);
      alert("Something went wrong initializing the checkout. Please try again.");
    }
  };

  const getHypeMessage = (val) => {
    switch(val) {
      case 80: return "🏆 MEGA JACKPOT! You are the ONLY user to unlock 80% today! Claim it before it's gone!";
      case 60: return "🔥 OUTSTANDING! 60% off is incredibly rare. Today is absolutely your lucky day!";
      case 50: return "✨ INCREDIBLE! You hit the sweet spot with a massive 50% discount. Welcome to PRO!";
      case 40: return "🚀 AMAZING WIN! A massive 40% off is yours. Time to supercharge your job search!";
      case 30: return "🌟 LUCKY SPIN! You've scored a fantastic 30% off. Upgrade now and conquer!";
      case 20: return "🎉 AWESOME! A solid 20% discount is yours to claim right now. Great job!";
      case 10: return "💡 GREAT START! Every bit of savings counts on your journey to unlocking PRO.";
      default: return "Every bit helps! Enjoy your exclusive discount.";
    }
  };

  const conicGradientString = WHEEL_SLICES.map(
    (slice, i) => `${slice.color} ${i * 45}deg ${(i + 1) * 45}deg`
  ).join(', ');

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
    }}>
      
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-100vh); opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes epicPopup {
            0% { transform: translate(-50%, 50px) scale(0.5); opacity: 0; }
            10% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            15% { transform: translate(-50%, -50%) scale(1); opacity: 1; filter: drop-shadow(0 0 40px rgba(251,191,36,0.9)); }
            85% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -150px) scale(0.9); opacity: 0; }
          }
          @keyframes slideUpPop {
            0% { opacity: 0; transform: translateY(50px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pulseRed {
            0% { color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0); }
            50% { color: #fca5a5; text-shadow: 0 0 15px rgba(239, 68, 68, 0.8); }
            100% { color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0); }
          }
        `}
      </style>

      {/* EPIC POPUP - Updated to elegantly handle the "Try Again" text */}
      {currentLandedSlice !== null && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', zIndex: 10005, pointerEvents: 'none', 
          textAlign: 'center', width: '100%', maxWidth: '800px', padding: '40px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 40%, rgba(15,23,42,0) 70%)',
          animation: 'epicPopup 7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
        }}>
          <h1 style={{ 
            fontSize: currentLandedSlice.value > 0 ? '85px' : '65px', 
            margin: 0, fontFamily: 'system-ui, sans-serif', 
            color: currentLandedSlice.value > 0 ? '#fbbf24' : '#94a3b8', 
            textShadow: currentLandedSlice.value > 0 ? '0 8px 30px rgba(0,0,0,1), 0 0 20px #fbbf24' : '0 4px 15px rgba(0,0,0,1)', 
            WebkitTextStroke: currentLandedSlice.value > 0 ? '2px #78350f' : '1px #334155', lineHeight: '1.1'
          }}>
            {currentLandedSlice.value > 0 ? `${currentLandedSlice.value}% OFF!` : 'Oof, Blank Spot!'}
          </h1>
          <p style={{ fontSize: '26px', color: '#fff', fontWeight: '900', margin: '15px 0 0 0', textShadow: '0 4px 15px rgba(0,0,0,1)' }}>
            {currentLandedSlice.value === 0 
              ? "Don't worry, you get a FREE extra spin! Try again!" 
              : (offerState.spinsLeft > 0 ? "Great! But can you get higher?" : getHypeMessage(offerState.highestWin?.value))}
          </p>
        </div>
      )}

      {showConfetti && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 10001, fontSize: '40px', display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-around', overflow: 'hidden'
        }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} style={{ animation: 'fall 3s linear forwards', animationDelay: `${Math.random() * 2}s` }}>
              {['🎉', '💰', '✨', '🔥', '💸'][Math.floor(Math.random() * 5)]}
            </span>
          ))}
        </div>
      )}

      <div style={{
        backgroundColor: '#1e293b', width: '90%', maxWidth: '850px', borderRadius: '16px', 
        border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', 
        display: 'flex', overflow: 'hidden', color: '#f8fafc', position: 'relative', zIndex: 10002
      }}>

        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer', zIndex: 10 }}
        >
          ✕
        </button>

        {/* LEFT COLUMN */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {offerState.lockoutUntil ? (
            <div style={{ textAlign: 'center', animation: 'slideUpPop 0.5s ease-out forwards' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>⏳</div>
              <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Offer Expired</h2>
              <p style={{ color: '#cbd5e1', marginBottom: '30px', lineHeight: '1.6' }}>
                Your previous discount has expired. You can continue using the Free Plan, or come back tomorrow to spin the wheel again!
              </p>
              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', color: '#94a3b8', fontWeight: 'bold' }}>
                Next Spin Available In: <br/>
                <span style={{ color: '#fff', fontSize: '24px' }}>{lockoutTimeLeft}</span>
              </div>
              <button 
                onClick={onClose}
                style={{ marginTop: '20px', padding: '12px 30px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Continue Free
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'inline-block', backgroundColor: '#fbbf24', color: '#78350f', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', alignSelf: 'flex-start', textTransform: 'uppercase' }}>
                Premium Feature Locked
              </div>
              
              <h2 style={{ margin: '0 0 15px 0', fontSize: '32px', color: '#fff' }}>
                Upgrade to <span style={{ color: '#3b82f6' }}>PRO</span>
              </h2>
              
              <p style={{ margin: '0 0 25px 0', color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6' }}>
                Unlock enterprise-grade tools, premium ATS templates, and remove all watermarks.
              </p>

              {offerState.highestWin ? (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', padding: '25px', borderRadius: '12px', textAlign: 'center', animation: 'slideUpPop 0.5s ease-out forwards' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#10b981' }}>
                    Current Best Offer: {offerState.highestWin.label}
                  </h3>
                  
                  <div style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold', animation: 'pulseRed 2s infinite' }}>
                    Expires In: {timeLeft}
                  </div>

                  <button 
                    onClick={handleUpgradeClick}
                    style={{ width: '100%', padding: '15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Claim {offerState.highestWin.value}% OFF Now
                  </button>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {['Unlock 50+ Premium AI Layouts', 'Unlimited ATS Scans', 'Remove Watermark'].map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#e2e8f0' }}>
                      <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: 1, backgroundColor: '#0f172a', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #334155' }}>
          
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 5px 0', color: offerState.lockoutUntil ? '#4b5563' : '#cbd5e1' }}>Test Your Luck</h3>
            {!offerState.lockoutUntil && (
              <span style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                {offerState.spinsLeft} Spins Remaining
              </span>
            )}
          </div>

          <div style={{ position: 'relative', width: '280px', height: '280px', opacity: offerState.lockoutUntil ? 0.3 : 1 }}>
            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '25px solid #ef4444', zIndex: 10 }} />

            {/* FIX: Removed the bouncy curve, changed to a perfectly smooth gliding stop */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #334155',
              background: `conic-gradient(${conicGradientString})`,
              transform: `rotate(${wheelRotation}deg)`,
              transition: 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)', 
              position: 'relative', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}>
              {WHEEL_SLICES.map((slice, i) => (
                <div key={i} style={{ 
                  position: 'absolute', top: '50%', left: '50%', 
                  transform: `translate(-50%, -50%) rotate(${i * 45 + 22.5}deg) translateY(-100px)`, 
                  color: 'white', fontWeight: 'bold', fontSize: '13px', textShadow: '1px 1px 3px rgba(0,0,0,0.9)' 
                }}>
                  {slice.label}
                </div>
              ))}
            </div>

            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50px', height: '50px', backgroundColor: '#1e293b', borderRadius: '50%', border: '4px solid #fff', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>🍀</span>
            </div>
          </div>

          <button 
            onClick={handleSpin}
            disabled={isSpinning || offerState.spinsLeft <= 0 || offerState.lockoutUntil}
            style={{ 
              marginTop: '40px', padding: '15px 40px', 
              backgroundColor: (isSpinning || offerState.spinsLeft <= 0 || offerState.lockoutUntil) ? '#4b5563' : '#3b82f6', 
              color: 'white', border: 'none', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', 
              cursor: (isSpinning || offerState.spinsLeft <= 0 || offerState.lockoutUntil) ? 'not-allowed' : 'pointer', 
              textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s',
              boxShadow: (isSpinning || offerState.spinsLeft <= 0 || offerState.lockoutUntil) ? 'none' : '0 10px 25px rgba(59, 130, 246, 0.5)'
            }}
          >
            {isSpinning ? 'Spinning...' : (offerState.spinsLeft > 0 ? 'SPIN TO WIN!' : 'NO SPINS LEFT')}
          </button>
        </div>
      </div>
    </div>
  );
}