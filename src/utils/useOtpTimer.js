import { useEffect, useState } from "react";

export const useOtpTimer = (initialSeconds = 30) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const startTimer = () => {
    setSecondsLeft(initialSeconds);
  };

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    startTimer,
  };
};