const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mode = "calm";

// Camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// FACE MESH
const faceMesh = new FaceMesh({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true
});

faceMesh.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.multiFaceLandmarks) return;
  const landmarks = results.multiFaceLandmarks[0];

  // Eyes (blink proxy)
  const eyeTop = landmarks[159].y;
  const eyeBottom = landmarks[145].y;
  const blink = Math.abs(eyeTop - eyeBottom);

  // Mouth (smile proxy)
  const mouthWidth =
    Math.abs(landmarks[61].x - landmarks[291].x);

  if (mode === "express") {
    ctx.fillStyle = "rgba(255, 200, 0, 0.6)";
    ctx.beginPath();
    ctx.arc(320, 240, mouthWidth * 500, 0, Math.PI * 2);
    ctx.fill();
  }

  if (mode === "calm") {
    ctx.strokeStyle = "rgba(100,200,255,0.5)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(320, 240, blink * 2000, 0, Math.PI * 2);
    ctx.stroke();
  }
});

// HANDS
const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1
});

hands.onResults(results => {
  if (!results.multiHandLandmarks) return;

  const hand = results.multiHandLandmarks[0];
  const palm = hand[9];

  if (mode === "explore") {
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(
      palm.x * canvas.width,
      palm.y * canvas.height,
      40,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
});

// CAMERA PIPELINE
const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
    await hands.send({ image: video });
  },
  width: 640,
  height: 480
});
camera.start();
