import { useRef, useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

export default function useCamera(active) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) return;

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      streamRef.current = mediaStream;
    } catch {
      Swal.fire(
        "Error",
        "Gagal akses kamera. Izinkan akses kamera di browser.",
        "error"
      );
    }
  }, []);


  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreviewImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setPreviewImage(null);
    startCamera();
  }, [startCamera]);

  const dataURLtoFile = useCallback((dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) u8arr[n] = bstr.charCodeAt(n);

    return new File([u8arr], filename, { type: mime });
  }, []);

  // otomatis start / stop
  useEffect(() => {
    if (!active) {
      stopCamera();
      return;
    }

    startCamera();

    // cleanup hanya saat unmount
    return () => {
      stopCamera();
    };
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
