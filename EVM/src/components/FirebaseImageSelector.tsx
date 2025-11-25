import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { listImages, storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Upload, Image, Check, X, Loader2 } from "lucide-react";

interface FirebaseImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  storagePath?: string; // Firebase storage folder path, default: 'images/vehicles'
}

export default function FirebaseImageSelector({ 
  value, 
  onChange, 
  disabled = false, 
  storagePath = "images/vehicles" 
}: FirebaseImageSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [images, setImages] = useState<Array<{ name: string; fullPath: string; url: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<string>(value);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();


  // Define loadImages before useEffect to avoid ReferenceError
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const imageList = await listImages(storagePath);
      setImages(imageList);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách hình ảnh",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [storagePath, toast]);

  // Load images when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      loadImages();
    }
  }, [isDialogOpen, loadImages]);

  // Update selected image when value changes
  useEffect(() => {
    setSelectedImage(value);
  }, [value]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Chỉ được phép tải lên file hình ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `${storagePath}/${fileName}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update images list
      const newImage = {
        name: fileName,
        fullPath: filePath,
        url: downloadURL
      };
      setImages(prev => [newImage, ...prev]);
      setSelectedImage(downloadURL);

      toast({
        title: "Thành công",
        description: "Đã tải lên hình ảnh thành công",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải lên hình ảnh",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleConfirm = () => {
    onChange(selectedImage);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setSelectedImage(value);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={disabled} size="sm">
              <Image className="w-4 h-4 mr-1" />
              Chọn ảnh
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" style={{ zIndex: 9999 }}>
            <DialogHeader>
              <DialogTitle>Chọn hình ảnh</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <div>
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        Tải lên hình ảnh mới
                      </span>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Đang tải lên...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Selection */}
              

              {/* Images Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Hình ảnh có sẵn ({images.length})</Label>
                  <Button variant="outline" size="sm" onClick={loadImages} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Làm mới"}
                  </Button>
                </div>
                
                <div className="h-60 overflow-y-auto border rounded-md">
                  {loading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  ) : images.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có hình ảnh nào
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 p-3">
                      {images.map((image) => (
                        <div
                          key={image.fullPath}
                          className={`relative cursor-pointer transition-all hover:shadow-md border-2 rounded-lg p-2 ${
                            selectedImage === image.url ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectImage(image.url)}
                        >
                          <div className="relative">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-20 object-cover rounded"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                            {selectedImage === image.url && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate text-center" title={image.name}>
                            {image.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button variant="outline" onClick={handleCancel} type="button">
                <X className="w-4 h-4 mr-1" />
                Hủy
              </Button>
              <Button onClick={handleConfirm} disabled={!selectedImage} type="button">
                <Check className="w-4 h-4 mr-1" />
                Chọn
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Preview */}
      {value && (
        <div className="mt-2">
          <img 
            src={value} 
            alt="Preview" 
            className="max-h-20 object-contain border rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}