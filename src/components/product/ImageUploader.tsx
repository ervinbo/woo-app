
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ImageIcon, ImagePlus, Crop, RefreshCw, Save, Trash2, SwitchCamera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';

interface ImageUploaderProps {
  images: Array<{ id?: number, src: string, alt?: string }>;
  onImagesUpdate: (images: Array<{ id?: number, src: string, alt?: string }>) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesUpdate }) => {
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [scale, setScale] = useState<number>(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          // Add new image to the array
          onImagesUpdate([...images, { src: imageDataUrl, alt: 'Product image' }]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select valid image files');
      }
    });
  };

  const resetEditingControls = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setScale(100);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: facingMode } 
        });
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  const toggleCamera = async () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    if (showCamera) {
      startCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onImagesUpdate([...images, { src: imageDataUrl, alt: 'Product image' }]);
        
        // Stop camera and show editing dialog
        stopCamera();
      }
    }
  };

  const startImageEdit = (index: number) => {
    setEditingImageIndex(index);
    setEditingImage(images[index].src);
    setIsDialogOpen(true);
    resetEditingControls();
  };

  const applyImageEdits = () => {
    if (!editingImage || editingImageIndex === null) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const img = new Image();
      
      img.onload = () => {
        // Calculate dimensions based on scale
        const width = img.width * (scale / 100);
        const height = img.height * (scale / 100);
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image with applied scale
        ctx.drawImage(img, 0, 0, width, height);
        
        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        
        // Convert to data URL
        const editedImageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Update the specific image in the array
        const updatedImages = [...images];
        updatedImages[editingImageIndex] = {
          ...updatedImages[editingImageIndex],
          src: editedImageDataUrl
        };
        onImagesUpdate(updatedImages);
        setIsDialogOpen(false);
      };
      
      img.src = editingImage;
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesUpdate(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <div className="w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
              <img 
                src={image.src} 
                alt={image.alt || 'Product image'} 
                className="w-full h-full object-cover"
                onClick={() => startImageEdit(index)}
              />
            </div>
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
              onClick={() => removeImage(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div 
          className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={handleChooseFile}
        >
          <ImagePlus className="h-8 w-8 text-gray-500" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <Button variant="outline" size="sm" onClick={handleChooseFile}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Gallery
        </Button>
        <Button variant="outline" size="sm" onClick={startCamera}>
          <Camera className="h-4 w-4 mr-2" />
          Camera
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-sm overflow-hidden rounded-md border border-gray-200">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-auto"
              />
              <canvas ref={canvasRef} className="hidden" />
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-2"
                onClick={toggleCamera}
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={stopCamera}>Cancel</Button>
              <Button onClick={capturePhoto}>Capture</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Editing Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              {editingImage && (
                <div className="relative max-w-full overflow-hidden rounded-md border border-gray-200">
                  <img 
                    src={editingImage} 
                    alt="Edit preview" 
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                      transform: `scale(${scale/100})`,
                      maxWidth: '100%',
                      maxHeight: '250px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="brightness">Brightness</Label>
                  <span className="text-sm">{brightness}%</span>
                </div>
                <Slider 
                  id="brightness"
                  min={50} 
                  max={150} 
                  step={1} 
                  value={[brightness]} 
                  onValueChange={(value) => setBrightness(value[0])} 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="contrast">Contrast</Label>
                  <span className="text-sm">{contrast}%</span>
                </div>
                <Slider 
                  id="contrast"
                  min={50} 
                  max={150} 
                  step={1} 
                  value={[contrast]} 
                  onValueChange={(value) => setContrast(value[0])} 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="saturation">Saturation</Label>
                  <span className="text-sm">{saturation}%</span>
                </div>
                <Slider 
                  id="saturation"
                  min={50} 
                  max={150} 
                  step={1} 
                  value={[saturation]} 
                  onValueChange={(value) => setSaturation(value[0])} 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label htmlFor="scale">Size</Label>
                  <span className="text-sm">{scale}%</span>
                </div>
                <Slider 
                  id="scale"
                  min={50} 
                  max={150} 
                  step={1} 
                  value={[scale]} 
                  onValueChange={(value) => setScale(value[0])} 
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={resetEditingControls}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={applyImageEdits}>
                <Save className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUploader;
