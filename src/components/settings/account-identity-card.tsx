"use client";

import { useActionState, useRef, useState, useTransition, type ChangeEvent } from "react";
import { Camera, CheckCircle2, IdCard, Loader2, Lock, Save, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { removeAvatar, updateAvatar, updateUsername } from "@/lib/actions/account";
import type { ActionState } from "@/lib/actions/auth";
import { isValidUsername } from "@/lib/users/username";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TARGET_SIZE = 320;

function resizeToSquareJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read that image."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Image processing isn't supported here."));

        const scale = Math.max(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (TARGET_SIZE - w) / 2, (TARGET_SIZE - h) / 2, w, h);

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const initialState: ActionState = { error: null };

export function AccountIdentityCard({
  username: currentUsername,
  email,
  avatarUrl,
}: {
  username: string;
  email: string;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [avatarPending, startAvatarTransition] = useTransition();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const initial = currentUsername.charAt(0).toUpperCase() || "?";

  const [username, setUsername] = useState(currentUsername);
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateUsername(prev, formData);
    if (!result.error) toast.success("Profile saved");
    return result;
  }, initialState);

  const usernameValid = isValidUsername(username);
  const usernameChanged = username !== currentUsername;

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError("That image is too large (max 8MB).");
      return;
    }

    setAvatarError(null);
    try {
      const dataUrl = await resizeToSquareJpeg(file);
      startAvatarTransition(async () => {
        const result = await updateAvatar(dataUrl);
        if (result.error) {
          setAvatarError(result.error);
          toast.error(result.error);
        } else {
          setPreview(dataUrl);
          toast.success("Profile picture updated");
        }
      });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Could not process that image.");
    }
  }

  function handleRemoveAvatar() {
    startAvatarTransition(async () => {
      const result = await removeAvatar();
      if (result.error) toast.error(result.error);
      else {
        setPreview(null);
        toast.success("Profile picture removed");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <IdCard className="size-5 text-primary" />
          <CardTitle className="text-base">Account Identity</CardTitle>
        </div>
        <Badge className="rounded-full bg-primary/15 text-[10px] text-primary hover:bg-primary/15">
          Public Profile
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4 rounded-xl bg-muted/60 p-4">
          <div className="relative shrink-0">
            <Avatar className="size-16">
              <AvatarImage src={preview ?? "/default-avatar.jpg"} alt={currentUsername} />
              <AvatarFallback className="bg-primary/10 text-lg text-primary">{initial}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={avatarPending}
              className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
              aria-label="Change profile picture"
            >
              {avatarPending ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={avatarPending}
              >
                <Camera /> Upload new
              </Button>
              {preview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleRemoveAvatar}
                  disabled={avatarPending}
                >
                  <Trash2 /> Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 8MB.</p>
            {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Primary Email</Label>
            <Badge variant="secondary" className="gap-1 rounded-full text-[10px]">
              <Lock className="size-2.5" /> Read-only
            </Badge>
          </div>
          <div className="flex h-10 items-center justify-between rounded-lg border border-input bg-muted/40 px-3 text-sm">
            <span className="truncate">{email}</span>
            <Lock className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>

        <form action={formAction} className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              required
              minLength={3}
              maxLength={20}
              className="pl-7"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Roommates use this to find you.</p>
            {usernameChanged && (
              <span
                className={`flex items-center gap-1 text-xs font-medium ${usernameValid ? "text-success" : "text-destructive"}`}
              >
                {usernameValid ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                {usernameValid ? "Looks good" : "Invalid username"}
              </span>
            )}
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={pending || !usernameValid}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
