import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { api, signPresignedSingle } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, setUser } = useAuth(); // assuming setUser exists to update context
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpdateProfile = async () => {
    if (!name) return alert("Name cannot be empty");

    try {
      setUploading(true);
      let imageUrl = user.picture;

      // If a new file is selected, upload it to S3
      if (file) {
        const { uploadUrl, fileUrl } = await signPresignedSingle({
          file,
          type: "profile",
          token: user.token,
        });

        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        imageUrl = fileUrl;
      }

      // Update user profile in backend
      const updatedUser = await api("/api/users/me", {
        method: "PUT",
        token: user.token,
        body: {
          name,
          picture: imageUrl,
        },
      });

      // Update context
      setUser(updatedUser);
      alert("✅ Profile updated successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-6">My Profile</h2>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <img
              src={file ? URL.createObjectURL(file) : user?.picture}
              alt="Profile"
              className="w-20 h-20 rounded-full border object-cover"
            />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Name input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            placeholder="Name"
          />

          {/* Update Button */}
          <button
            onClick={handleUpdateProfile}
            disabled={uploading}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {uploading ? "Updating…" : "Update Profile"}
          </button>
        </div>
      </div>
    </>
  );
}
