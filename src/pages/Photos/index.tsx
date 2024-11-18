import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import ImageGrid from "../../components/ImageGrid";
import UploadModal from "../../components/UploadModal";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function Photos() {
  const [images, setImages] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("images")
        .select("*, profiles(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleImageSelect = (id: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleUpload = async (files: File[], location: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const user = session?.user;
      if (!user) throw new Error("No user");

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        const { error: dbError } = await supabase.from("images").insert({
          url: publicUrl,
          location,
          user_id: user.id,
        });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
      toast.success("Images uploaded successfully");
      fetchImages();
    } catch (error) {
      toast.error("Failed to upload images");
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Photos</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload Photos
        </button>
      </div>

      <ImageGrid
        images={images}
        onSelect={handleImageSelect}
        selectedImages={selectedImages}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
