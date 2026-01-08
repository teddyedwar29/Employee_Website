import { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function useCamera(active) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      Swal.fire(
        "Error",
        "Gagal akses kamera. Izinkan akses kamera di browser.",
        "error"
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreviewImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setPreviewImage(null);
    startCamera();
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) u8arr[n] = bstr.charCodeAt(n);

    return new File([u8arr], filename, { type: mime });
  };

  // otomatis start / stop
  useEffect(() => {
    if (active) startCamera();
    return () => stopCamera();
  }, [active]);

  return {
    videoRef,
    canvasRef,
    previewImage,
    takePhoto,
    retakePhoto,
    dataURLtoFile,
    stopCamera,
    setPreviewImage,
  };
}
