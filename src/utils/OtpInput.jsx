import { useRef, useEffect, useState } from "react";

function OtpInput({
  otp,
  setOtp,
  onComplete,
  resetTrigger, // 🔥 used to reset on invalid OTP
}) {
  const inputsRef = useRef([]);
  const [shake, setShake] = useState(false);

  /* ================= AUTO FOCUS FIRST INPUT ================= */
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  /* ================= AUTO CLEAR + REFOCUS ================= */
  useEffect(() => {
    if (!resetTrigger) return;

    // clear values
    const emptyOtp = ["", "", "", "", "", ""];
    setOtp(emptyOtp);

    // clear DOM inputs manually
    inputsRef.current.forEach((input) => {
      if (input) input.value = "";
    });

    // shake animation
    setShake(true);

    setTimeout(() => {
      setShake(false);
      inputsRef.current[0]?.focus();
    }, 400);
  }, [resetTrigger, setOtp]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // allow only single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move forward
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // 🎯 Auto submit on last digit
    if (index === 5 && value) {
      const finalOtp = newOtp.join("");
      if (finalOtp.length === 6) {
        onComplete(finalOtp);
      }
    }
  };

  /* ================= HANDLE BACKSPACE ================= */
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // clear current
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // move back
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  /* ================= HANDLE PASTE ================= */
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasted)) return;

    const otpArray = pasted.split("");
    setOtp(otpArray);

    otpArray.forEach((digit, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = digit;
      }
    });

    onComplete(pasted);
  };

  return (
    <div
      className={`flex justify-center gap-3 ${
        shake ? "animate-shake" : ""
      }`}
      onPaste={handlePaste}
    >
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          ref={(el) => (inputsRef.current[index] = el)}
          value={otp[index] || ""}
          onChange={(e) =>
            handleChange(e.target.value, index)
          }
          onKeyDown={(e) =>
            handleKeyDown(e, index)
          }
          className="w-12 h-12 text-center text-xl border rounded-lg 
                     focus:ring-2 focus:ring-primary outline-none
                     transition-all duration-200"
        />
      ))}
    </div>
  );
}

export default OtpInput;