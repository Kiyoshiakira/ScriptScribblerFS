'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { updateUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { User } from 'firebase/auth';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  profile: { bio?: string } | null;
}

export function EditProfileDialog({ open, onOpenChange, user, profile }: EditProfileDialogProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
    if (profile) {
      setBio(profile.bio || '');
    }
  }, [user, profile, open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
        // Update Firebase Auth profile
        await updateProfile(auth.currentUser, {
            displayName,
            photoURL,
        });

        // Update custom data in Firestore
        await updateUserProfile(auth.currentUser.uid, { bio });

        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
        onOpenChange(false);
        
        // This is a bit of a hack, but it forces a re-render of the user object
        // A better solution would involve a more robust state management
        window.location.reload();

    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your public profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={photoURL} alt={displayName} />
                        <AvatarFallback>{displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div 
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself."
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
