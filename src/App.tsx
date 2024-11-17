import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import ImageGrid from "./components/ImageGrid";
import UploadModal from "./components/UploadModal";
import Auth from "./components/Auth";
import { supabase } from "./lib/supabase";
import { downloadImages } from "./utils/download";
import toast from "react-hot-toast";

function App() {
  const [session, setSession] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchImages();
    }
  }, [session, searchQuery, sortBy]);

  const fetchImages = async () => {
    try {
      let query = supabase
        .from("images")
        .select(
          `
            *,
            profiles(name, avatar_url)
        `
        )
        .eq("user_id", session?.user?.id);

      if (searchQuery) {
        query = query.or(
          `location.ilike.%${searchQuery}%,profiles.name.ilike.%${searchQuery}%`
        );
      }

      if (sortBy === "date") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "location") {
        query = query.order("location");
      }

      const { data, error } = await query;
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      toast.error("Failed to fetch images");
      console.error("Error:", error);
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

  const handleDownloadSelected = async () => {
    try {
      const selectedUrls = images
        .filter((img) => selectedImages.has(img.id))
        .map((img) => img.url);

      if (selectedUrls.length === 0) {
        toast.error("No images selected");
        return;
      }

      await downloadImages(selectedUrls, true);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download images");
      console.error("Error:", error);
    }
  };

  const handleUpload = async (files: File[], location: string) => {
    try {
      const user = session?.user;
      if (!user) throw new Error("No user");

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);
        console.log(uploadError);
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        const { error: dbError } = await supabase.from("images").insert({
          url: publicUrl,
          location,
          user_id: user.id,
        });
        console.log(dbError);
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

  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Toaster position="top-right" />
        <Header
          onSearch={setSearchQuery}
          onUpload={() => setIsUploadModalOpen(true)}
          onLogout={() => supabase.auth.signOut()}
        />

        <main className="max-w-7xl mx-auto py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="location">Sort by Location</option>
                </select>
              </div>
            </div> */}

            <ImageGrid
              images={images}
              onSelect={handleImageSelect}
              selectedImages={selectedImages}
            />
          </div>
        </main>

        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
        />
      </div>
    </Router>
  );
}

export default App;
