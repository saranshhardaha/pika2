import React, { useState, useCallback } from "react";
import { X, Upload, MapPin } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], location: string) => Promise<void>;
}

export default function UploadModal({
  isOpen,
  onClose,
  onUpload,
}: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) => {
      setLocation(file.name);
      file.type.startsWith("image/");
    });
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpload(files, location);
    setFiles([]);
    setLocation("");
    onClose();
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed top-0 left-0 inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />

        <div className="relative inline-block w-full max-w-3xl p-6 my-8 text-left bg-gray-900 rounded-lg shadow-xl transform transition-all sm:w-full">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <h3 className="text-lg font-medium text-white mb-4">Upload Photos</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging ? "border-blue-500 bg-gray-800" : "border-gray-700"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-300">
                Drag and drop your photos here, or
                <label className="mx-1 text-blue-400 hover:text-blue-300 cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </p>
            </div>

            {files?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {files?.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add location"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={files.length === 0}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload {files.length} {files.length === 1 ? "photo" : "photos"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
