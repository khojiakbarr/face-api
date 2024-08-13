import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef();
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isMatched, setIsMatched] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  
        setIsModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
  
    loadModels();
  }, []);

  useEffect(() => {
    if (isModelsLoaded) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing camera: ", err));
    }
  }, [isModelsLoaded]);

  const handleImageUpload = async (event) => {
    setImageFile(event.target.files[0]);
  };

  const compareFaces = async () => {
    if (!imageFile || !videoRef.current) return;

    const uploadedImage = await faceapi.bufferToImage(imageFile);
    const detectionFromImage = await faceapi
      .detectSingleFace(uploadedImage)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const detectionFromVideo = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detectionFromImage && detectionFromVideo) {
      const distance = faceapi.euclideanDistance(
        detectionFromImage.descriptor,
        detectionFromVideo.descriptor
      );
      setIsMatched(distance < 0.6);
    } else {
      setIsMatched(null);
    }
  };

  return (
    <div className="App">
      <h1>Face Recognition App</h1>
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      <video ref={videoRef} autoPlay muted width="720" height="560" />
      <button onClick={compareFaces}>Compare Faces</button>
      {isMatched !== null && (
        <h2>{isMatched ? "Faces Match!" : "Faces Do Not Match!"}</h2>
      )}
    </div>
  );
}

export default App;
