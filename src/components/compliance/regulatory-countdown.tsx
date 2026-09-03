"use client";

import { useEffect, useState } from "react";

type RegulatoryCountdownProps = {
  deadline: string | Date | null;
};

function getRemainingTime(deadline: string | Date | null) {
  if (!deadline) {
    return null;
  }

  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(deadlineTime)) {
    return null;
  }

  const remainingMs = deadlineTime - Date.now();

  if (remainingMs <= 0) {
    return {
      overdue: true,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    overdue: false,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatNumber(value: number) {
  return value.toString().padStart(2, "0");
}

export default function RegulatoryCountdown({
  deadline,
}: RegulatoryCountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingTime(deadline),
  );

  useEffect(() => {
    const updateCountdown = () => {
      setRemaining(getRemainingTime(deadline));
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) {
    return (
      <div>
        <strong>Regulatory deadline</strong>
        <p>No regulatory deadline.</p>
      </div>
    );
  }

  if (!remaining) {
    return (
      <div>
        <strong>Regulatory deadline</strong>
        <p>Invalid regulatory deadline.</p>
      </div>
    );
  }

  if (remaining.overdue) {
    return (
      <div>
        <strong>Regulatory deadline</strong>
        <p>OVERDUE</p>
        <p>The regulatory reporting deadline has passed.</p>
      </div>
    );
  }

  return (
    <div>
      <strong>Regulatory deadline</strong>

      <p
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginTop: "8px",
        }}
      >
        {formatNumber(remaining.hours)}:
        {formatNumber(remaining.minutes)}:
        {formatNumber(remaining.seconds)}
      </p>

      <p>Time remaining until regulatory reporting deadline.</p>
    </div>
  );
}