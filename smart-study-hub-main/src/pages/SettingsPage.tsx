import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Palette, Shield, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Uses refreshProfile from AuthContext to sync navbar/sidebar avatar immediately

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password dialog state
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Load profile data
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url);
      }
      setEmail(user.email || "");
      setProfileLoading(false);
    };
    loadProfile();
  }, [user]);

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refreshProfile();
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save profile
  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSaving(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update email in auth if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        toast.success("Profile updated! Check your new email for a verification link.");
      } else {
        toast.success("Profile updated successfully");
      }
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }

    setPwLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.email) throw new Error("No user found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPw,
      });
      if (signInError) {
        toast.error("Current password is incorrect");
        setPwLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </motion.div>

      {/* Profile */}
      <motion.div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {profileLoading ? "…" : initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              {uploadingAvatar ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
          <div>
            <Button variant="outline" className="rounded-2xl" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
              {uploadingAvatar ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : "Change Avatar"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Max 2MB, image files only</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-2xl mt-1 bg-secondary/30 border-border/50"
              disabled={profileLoading}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl mt-1 bg-secondary/30 border-border/50"
              disabled={profileLoading}
            />
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4 text-accent" />
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Enable dark theme</p>
          </div>
          <Switch defaultChecked />
        </div>
      </motion.div>




      {/* Privacy */}
      <motion.div className="p-6 rounded-3xl bg-card border border-border/50 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-success" />
          <h2 className="font-semibold">Privacy & Security</h2>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={() => setPwOpen(true)}>Change Password</Button>
        <Button variant="outline" className="rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/10 ml-2">Delete Account</Button>
      </motion.div>

      <Button className="w-full rounded-2xl" onClick={handleSave} disabled={saving || profileLoading}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
      </Button>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={(open) => { setPwOpen(open); if (!open) { setCurrentPw(""); setNewPw(""); setConfirmPw(""); } }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Current Password</Label>
              <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="rounded-2xl mt-1 bg-secondary/30 border-border/50" placeholder="••••••••" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">New Password</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="rounded-2xl mt-1 bg-secondary/30 border-border/50" placeholder="Min 8 characters" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
              <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="rounded-2xl mt-1 bg-secondary/30 border-border/50" placeholder="Re-enter new password" />
            </div>
            <Button className="w-full rounded-2xl" onClick={handleChangePassword} disabled={pwLoading || !currentPw || !newPw || !confirmPw}>
              {pwLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : "Update Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
