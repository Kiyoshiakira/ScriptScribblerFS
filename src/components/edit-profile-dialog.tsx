'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { updateUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { User } from 'firebase/auth';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  profile: { bio?: string, coverImageUrl?: string } | null;
}

export function EditProfileDialog({ open, onOpenChange, user, profile }: EditProfileDialogProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
    if (profile) {
      setBio(profile.bio || '');
      setCoverImageUrl(profile.coverImageUrl || '');
    }
  }, [user, profile, open]);

  
  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
        // Update Firebase Auth display name
        if (displayName !== auth.currentUser.displayName) {
            await updateProfile(auth.currentUser, {
                displayName,
            });
        }

        // Update custom data in Firestore
        await updateUserProfile(auth.currentUser.uid, { bio, coverImageUrl });

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
                        <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                        <AvatarFallback>{displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
                 <p className="text-xs text-muted-foreground">Profile photo managed by your Google account.</p>
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
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <Input
                    id="coverImageUrl"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
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
