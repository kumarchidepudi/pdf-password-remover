import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('📁 File selected:', {
      name: selectedFile?.name,
      size: selectedFile?.size,
      type: selectedFile?.type,
      lastModified: new Date(selectedFile?.lastModified).toISOString()
    });
    setFile(selectedFile);
    setTimeout(() => {
      console.log('🔓 Password input revealed');
      setShowPassword(true);
    }, 500); // smooth reveal
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    console.log('🔑 Password changed:', { length: newPassword.length });
    setPassword(newPassword);
    if (newPassword.length > 0) {
      setTimeout(() => {
        console.log('⬇️ Download button revealed');
        setShowDownload(true);
      }, 500);
    } else {
      console.log('❌ Download button hidden (password cleared)');
      setShowDownload(false);
    }
  };

  const handleDownload = async () => {
  if (!file || !password) {
    console.warn('⚠️ Download attempted without file or password:', { 
      hasFile: !!file, 
      hasPassword: !!password 
    });
    return;
  }

  console.log('🚀 Starting file unlock process...');
  console.log('📤 Preparing request:', {
    fileName: file.name,
    fileSize: file.size,
    passwordLength: password.length,
    endpoint: 'http://localhost:8080/api/unlock'
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  try {
    console.log('📡 Sending POST request to server...');
    const startTime = performance.now();
    
    const res = await fetch("http://localhost:8080/api/unlock", {
      method: "POST",
      body: formData,
    });

    const endTime = performance.now();
    console.log(`⏱️ Request completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log('📨 Response received:', {
      status: res.status,
      statusText: res.statusText,
      contentType: res.headers.get('content-type'),
      contentLength: res.headers.get('content-length')
    });

    if (!res.ok) {
      console.error('❌ Server returned error:', {
        status: res.status,
        statusText: res.statusText
      });
      throw new Error("Failed to fetch file");
    }

    console.log('📦 Converting response to blob...');
    const blob = await res.blob();
    console.log('✅ Blob created:', {
      size: blob.size,
      type: blob.type
    });

    console.log('💾 Initiating download...');
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.name.replace(".pdf", "_unlocked.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(link.href);
    console.log('✨ Download initiated successfully!');
  } catch (err) {
    console.error('💥 Error during file unlock:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    alert("Error processing file");
    alert(err.message);
  }
};

  return (
    <div className="upload-container">
      {/* File Upload */}
      <label className="file-drop">
        <input type="file" onChange={handleFileChange} hidden />
        <span>{file ? file.name : "Drop your file here"}</span>
      </label>

      {/* Password Input */}
      <AnimatePresence>
        {showPassword && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="password-container"
          >
            <input
              type="password"
              value={password}
              placeholder="Enter Password"
              className="luxury-input"
              onChange={handlePasswordChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Button */}
      <AnimatePresence>
        {showDownload && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="download-container"
          >
            <button className="luxury-button" onClick={handleDownload}>
              Download File
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
