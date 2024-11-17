import React, { useState, useMemo } from "react";
import { Heart, Download, MessageCircle, Share2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import ImageViewer from "./ImageViewer";
import { downloadImages } from "../utils/download";

interface User {
  name: string;
  avatar_url: string;
}

interface Image {
  id: string;
  url: string;
  location: string;
  created_at: string;
  likes: number;
  comments: number;
  profiles: User | null;
}

interface ImageGridProps {
  images: Image[];
  onSelect: (id: string) => void;
  selectedImages: Set<string>;
}

interface GroupedImages {
  date: string;
  images: Image[];
}

export default function ImageGrid({
  images,
  onSelect,
  selectedImages,
}: ImageGridProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const groupedImages = useMemo(() => {
    const groups: GroupedImages[] = [];
    const sortedImages = [...images].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sortedImages.forEach((image) => {
      const date = format(new Date(image.created_at), "MMMM d, yyyy");
      const existingGroup = groups.find((g) => g.date === date);

      if (existingGroup) {
        existingGroup.images.push(image);
      } else {
        groups.push({ date, images: [image] });
      }
    });

    return groups;
  }, [images]);

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    const target = e.target as HTMLElement;
    if (!target.closest('input[type="checkbox"]')) {
      setCurrentImageIndex(index);
      setViewerOpen(true);
    }
  };

  const handleDownloadAll = async () => {
    const imagesToDownload =
      selectedImages.size > 0
        ? images.filter((img) => selectedImages.has(img.id))
        : images;

    const urls = imagesToDownload.map((img) => img.url);
    await downloadImages(urls, selectedImages.size > 0);
  };

  return (
    <>
      <div className="max-w-[2000px] mx-auto px-4 py-6">
        {groupedImages.map((group) => (
          <div key={group.date} className="mb-8">
            <h2 className="text-lg font-medium text-gray-200 mb-4 sticky top-0 bg-[#0a0a0a] py-2 z-10">
              {group.date}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-2">
              {group.images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group aspect-square bg-zinc-900"
                  onClick={(e) => handleImageClick(e, index)}
                >
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity z-10" />
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover cursor-pointer"
                    loading="lazy"
                  />
                  <input
                    type="checkbox"
                    className="absolute top-2 left-2 h-5 w-5 rounded bg-gray-800 border-gray-600 z-20"
                    checked={selectedImages.has(image.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelect(image.id);
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-2">
                        {image.profiles?.avatar_url && (
                          <img
                            src={image.profiles.avatar_url}
                            alt={image.profiles.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm truncate">
                          {image.profiles?.name || "Anonymous"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 md:hidden">
        <div className="flex justify-between items-center max-w-[2000px] mx-auto">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {selectedImages.size} selected
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownloadAll}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
            >
              <Download size={18} />
              <span>
                {selectedImages.size > 0 ? "Download Selected" : "Download All"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop actions */}
      <div className="hidden md:block fixed bottom-8 right-8">
        <button
          onClick={handleDownloadAll}
          className="flex items-center space-x-2 px-6 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          <span>
            {selectedImages.size > 0 ? "Download Selected" : "Download All"}
          </span>
        </button>
      </div>

      {viewerOpen && (
        <ImageViewer
          images={images}
          currentIndex={currentImageIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
