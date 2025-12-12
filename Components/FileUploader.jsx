import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, File, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUploader({ onFileSelect, isProcessing, processingStatus }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  const getFileIcon = (file) => {
    if (!file) return <Upload className="w-12 h-12" />;
    const type = file.type;
    if (type.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />;
    if (type.includes('image')) return <Image className="w-12 h-12 text-blue-500" />;
    return <File className="w-12 h-12 text-gray-500" />;
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={{
          scale: dragActive ? 1.02 : 1,
          borderColor: dragActive ? '#6366f1' : '#e5e7eb'
        }}
        className={`
          relative border-2 border-dashed rounded-2xl p-12
          transition-all duration-300 cursor-pointer
          ${dragActive ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50/50 border-gray-200'}
          ${isProcessing ? 'pointer-events-none opacity-70' : 'hover:bg-gray-50 hover:border-gray-300'}
        `}
        onClick={() => !isProcessing && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          onChange={handleChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">{processingStatus || 'Processing...'}</p>
                <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
              </div>
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              {getFileIcon(selectedFile)}
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  Drop your file here, or <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports PDF, Images, and Documents
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}