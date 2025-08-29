import * as React from "react";
import { uploadImage } from "~/utils/storage";
import { TagsInput } from "./TagsInput";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Upload,
  X,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

export interface PostFormData {
  title: string;
  body: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  featured_image?: string;
}

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => void;
  onCancel?: () => void;
  submitButtonText: string;
  isSubmitting?: boolean;
  error?: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  isDeletingButtonText?: string;
  isDeleting?: boolean;
  deleteError?: string;
  title: string;
}

export function PostForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText,
  isSubmitting = false,
  error,
  showDeleteButton = false,
  onDelete,
  isDeletingButtonText = "Delete Post",
  isDeleting = false,
  deleteError,
  title,
}: PostFormProps) {
  const [formData, setFormData] = React.useState<PostFormData>({
    title: initialData.title || "",
    body: initialData.body || "",
    status: initialData.status || "draft",
    tags: initialData.tags || [],
    featured_image: initialData.featured_image || "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [imageUploading, setImageUploading] = React.useState(false);
  const [imageError, setImageError] = React.useState<string>("");

  // Update form data when initialData changes (when switching between posts)
  React.useEffect(() => {
    setFormData({
      title: initialData.title || "",
      body: initialData.body || "",
      status: initialData.status || "draft",
      tags: initialData.tags || [],
      featured_image: initialData.featured_image || "",
    });

    // Set preview URL for existing image
    if (initialData.featured_image) {
      setPreviewUrl(initialData.featured_image);
    } else {
      setPreviewUrl("");
    }

    // Clear file selection when switching posts
    setSelectedFile(null);
    setImageError("");
  }, [
    initialData.title,
    initialData.body,
    initialData.status,
    initialData.tags,
    initialData.featured_image,
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageError(
        "Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed."
      );
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      setImageError("File size too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);
    setImageError("");

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData({ ...formData, featured_image: "" });
    setImageError("");

    // Clear file input
    const fileInput = document.getElementById(
      "featured_image"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    let imageUrl = formData.featured_image || "";

    // Upload new image if selected
    if (selectedFile) {
      setImageUploading(true);
      setImageError("");

      try {
        // Convert file to base64
        const base64 = await fileToBase64(selectedFile);

        // Upload using server function
        const result = await uploadImage({
          data: {
            base64,
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
          },
        });

        imageUrl = result.publicUrl;
      } catch (error) {
        setImageError(
          error instanceof Error ? error.message : "Failed to upload image"
        );
        setImageUploading(false);
        return;
      }

      setImageUploading(false);
    }

    onSubmit({
      title: formData.title.trim(),
      body: formData.body.trim(),
      status: formData.status,
      tags: formData.tags,
      featured_image: imageUrl,
    });
  };

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter post title..."
                  required
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="body">Content</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={8}
                  placeholder="Write your post content..."
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <TagsInput
                  value={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  placeholder="Add tags..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="featured_image">Featured Image</Label>
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-w-sm h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      onClick={handleRemoveImage}
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-8 w-8"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor="featured_image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {imageUploading ? (
                        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPEG, PNG, WebP, GIF (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <Input
                      id="featured_image"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      disabled={imageUploading}
                    />
                  </Label>
                </div>

                {imageError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}

                {imageUploading && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>Uploading image...</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: typeof formData.status) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="submit"
                disabled={
                  isSubmitting || !formData.title.trim() || imageUploading
                }
                className="flex-1 sm:flex-none"
              >
                {imageUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>

              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}

              {showDeleteButton && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="ml-auto"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    isDeletingButtonText
                  )}
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {deleteError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

async function fileToBase64(selectedFile: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:mime/type;base64, prefix
      const base64Data = result.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(selectedFile);
  });
}
