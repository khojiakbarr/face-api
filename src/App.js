import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef();
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [isMatched, setIsMatched] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setIsModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };

    loadModels();
  }, []);

  // function openVideo() {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: { facingMode: "user" } })
  //     .then((stream) => {
  //       videoRef.current.srcObject = stream;
  //       setIsModelsLoaded(false);
  //     })
  //     .catch((err) => console.error("Error accessing camera: ", err));
  // }

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
  // useEffect(() => {
  //   setIsLoading(false);
  // }, [isMatched]);

  const handleImageUpload = async (event) => {
    setImageFile(event.target.files[0]);
  };

  setTimeout(() => {
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
        setIsMatched(distance < 0.5);
      } else {
        setIsMatched(null);
      }
    };
    compareFaces();
  }, 3000);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 className="text-[25px] my-[20px]">Face Recognition App</h1>
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
        className="my-[20px]"
      />
      <div className="w-[400px] h-[400px] rounded-full overflow-hidden ">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full object-cover object-center "
        />
      </div>
      {/* <div className="flex justify-center gap-[10px]">
        <button
          onClick={compareFaces}
          disabled={!imageFile}
          className="rounded py-2 px-4 bg-gray-500 text-white mt-[20px] disabled:bg-slate-200 active:scale-90 transition-all"
        >
          Compare Faces
        </button>{" "}
        <button
          disabled={!isModelsLoaded}
          onClick={() => openVideo()}
          className="rounded py-2 px-4 bg-gray-500 text-white mt-[20px] disabled:bg-slate-200 active:scale-90 transition-all"
        >
          Open Video
        </button>
      </div> */}
      {isMatched !== null && (
        <h2>{isMatched ? "Faces Match!" : "Faces Do Not Match!"}</h2>
      )}
      {/* {isLoading && <h1>Loading...</h1>} */}
    </div>
  );
}

export default App;
