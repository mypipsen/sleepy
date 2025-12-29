"use client";

import { Box, keyframes, Typography } from "@mui/material";
import { useEffect, useState } from "react";

// 1. FIRE TRUCK RESCUE
const driveRight = keyframes`
  0% { transform: translateX(-100px) scaleX(-1); }
  50% { transform: translateX(100px) scaleX(-1); }
  51% { transform: translateX(100px) scaleX(1); }
  100% { transform: translateX(-100px) scaleX(1); }
`;

const FireTruck = () => (
  <Box
    sx={{ position: "relative", width: 200, height: 60, overflow: "hidden" }}
  >
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        animation: `${driveRight} 4s infinite linear`,
      }}
    >
      <Typography sx={{ fontSize: 40, lineHeight: 1 }}>🚒</Typography>
    </Box>
  </Box>
);

// 2. ROCKET BLAST OFF
const flyUp = keyframes`
  0% { transform: translateY(50px) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
`;
const twinkle = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`;
const Rocket = () => (
  <Box sx={{ position: "relative", width: 100, height: 120 }}>
    {[0, 1, 2].map((i) => (
      <Typography
        key={i}
        sx={{
          position: "absolute",
          top: i * 30,
          left: i * 20,
          fontSize: 20,
          animation: `${twinkle} ${1 + i * 0.5}s infinite ease-in-out`,
        }}
      >
        ⭐
      </Typography>
    ))}
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: "40%",
        animation: `${flyUp} 2s infinite ease-in`,
      }}
    >
      <Typography sx={{ fontSize: 40, lineHeight: 1 }}>🚀</Typography>
    </Box>
  </Box>
);

// 3. UNDERWATER ADVENTURE
const swim = keyframes`
  0% { transform: translateX(-50px) translateY(0); }
  25% { transform: translateX(0) translateY(-10px); }
  50% { transform: translateX(50px) translateY(0); }
  75% { transform: translateX(0) translateY(10px); }
  100% { transform: translateX(-50px) translateY(0); }
`;
const bubble = keyframes`
  0% { transform: translateY(0) scale(0.5); opacity: 0.5; }
  100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
`;
const Underwater = () => (
  <Box sx={{ position: "relative", width: 150, height: 80 }}>
    {[0, 1, 2].map((i) => (
      <Typography
        key={i}
        sx={{
          position: "absolute",
          top: 30,
          left: 40 + i * 20,
          fontSize: 10 + i * 2,
          color: "#4FC3F7",
          animation: `${bubble} ${2 + i}s infinite ease-in`,
          animationDelay: `${i * 0.5}s`,
        }}
      >
        ○
      </Typography>
    ))}
    <Box
      sx={{
        position: "absolute",
        top: 20,
        left: "30%",
        animation: `${swim} 4s infinite ease-in-out`,
      }}
    >
      <Typography sx={{ fontSize: 40, lineHeight: 1 }}>🐠</Typography>
    </Box>
  </Box>
);

// 4. HOT AIR BALLOON
const float = keyframes`
  0% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
  100% { transform: translateY(0) rotate(-2deg); }
`;
const cloudPass = keyframes`
  0% { transform: translateX(100px); opacity: 0; }
  50% { opacity: 0.8; }
  100% { transform: translateX(-100px); opacity: 0; }
`;
const Balloon = () => (
  <Box sx={{ position: "relative", width: 150, height: 100 }}>
    <Typography
      sx={{
        position: "absolute",
        top: 20,
        left: 20,
        fontSize: 30,
        opacity: 0.8,
        animation: `${cloudPass} 6s infinite linear`,
      }}
    >
      ☁️
    </Typography>
    <Box
      sx={{
        position: "absolute",
        top: 10,
        left: "40%",
        animation: `${float} 4s infinite ease-in-out`,
      }}
    >
      <Typography sx={{ fontSize: 50, lineHeight: 1 }}>🎈</Typography>
    </Box>
  </Box>
);

// 5. RACE CAR
const driveFast = keyframes`
  0% { transform: translateX(-150px) scaleX(-1); }
  45% { transform: translateX(0) skewX(-10deg) scaleX(-1); }
  55% { transform: translateX(0) skewX(10deg) scaleX(-1); }
  100% { transform: translateX(150px) scaleX(-1); }
`;
const RaceCar = () => (
  <Box
    sx={{ position: "relative", width: 200, height: 60, overflow: "hidden" }}
  >
    <Box
      sx={{
        position: "absolute",
        bottom: 10,
        left: "50%",
        animation: `${driveFast} 2s infinite ease-in-out`,
      }}
    >
      <Typography sx={{ fontSize: 40, lineHeight: 1 }}>🏎️</Typography>
    </Box>
  </Box>
);

const LOADERS = [
  { Component: FireTruck, text: "Driving to the rescue..." },
  { Component: Rocket, text: "Blasting off..." },
  { Component: Underwater, text: "Swimming under the sea..." },
  { Component: Balloon, text: "Floating up high..." },
  { Component: RaceCar, text: "Zooming to the finish..." },
];

export function FunLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * LOADERS.length));

    const interval = setInterval(() => {
      setIndex((prev) => {
        let next = Math.floor(Math.random() * LOADERS.length);
        while (next === prev) {
          next = Math.floor(Math.random() * LOADERS.length);
        }
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const { Component, text } = LOADERS[index]!;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        p: 2,
        minHeight: 120,
        justifyContent: "center",
      }}
    >
      <Component />
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          fontWeight: "medium",
          mt: 1,
          animation: "fadeIn 0.5s ease-in",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
