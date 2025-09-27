import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Car,
  Package,
  MapPin,
  Battery,
  Calendar,
  FileText
} from "lucide-react";

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
}

export default function AddInventoryModal({ isOpen, onClose, onAdd }: AddInventoryModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    vehicleModel: "",
    vehicleName: "",
    vin: "",
    color: "",
    price: "",
    location: "",
    zone: "",
    batteryLevel: "",
    notes: ""
  });

  const vehicleOptions = [
    { id: "vf6", name: "VinFast VF6", model: "VF6 S", price: 800000000 },
    { id: "vf7", name: "VinFast VF7", model: "VF7 Plus", price: 999000000 },
    { id: "vf8", name: "VinFast VF8", model: "VF8 Plus", price: 1200000000 },
    { id: "vf9", name: "VinFast VF9", model: "VF9 Plus", price: 1500000000 }
  ];

  const colorOptions = ["Trắng", "Đen", "Xanh", "Đỏ", "Bạc", "Xám"];
  const zoneOptions = ["A", "B", "C", "D"];

  const handleVehicleChange = (value: string) => {
    const selectedVehicle = vehicleOptions.find(v => v.id === value);
    if (selectedVehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleModel: value,
        vehicleName: selectedVehicle.name,
        price: selectedVehicle.price.toString()
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleModel || !formData.vin || !formData.color || !formData.location || !formData.zone) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      });
      return;
    }

    const newItem = {
      id: `WH${Date.now()}`,
      vehicleId: formData.vehicleModel,
      vehicleName: formData.vehicleName,
      model: vehicleOptions.find(v => v.id === formData.vehicleModel)?.model || "",
      image: `/src/assets/vinfast-${formData.vehicleModel}.jpg`,
      vin: formData.vin,
      color: formData.color,
      price: parseInt(formData.price),
      location: formData.location,
      zone: formData.zone,
      status: "available" as const,
      batteryLevel: parseInt(formData.batteryLevel) || 85,
      lastChecked: new Date().toISOString().split('T')[0],
      notes: formData.notes
    };

    onAdd(newItem);
    toast({
      title: "Thành công",
      description: "Đã thêm xe vào kho thành công"
    });
    
    // Reset form
    setFormData({
      vehicleModel: "",
      vehicleName: "",
      vin: "",
      color: "",
      price: "",
      location: "",
      zone: "",
      batteryLevel: "",
      notes: ""
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center space-x-2">
            <Package className="w-6 h-6 text-primary" />
            <span>Nhập kho xe mới</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-primary" />
              <Label htmlFor="vehicleModel" className="text-base font-semibold">
                Thông tin xe
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleModel">Dòng xe *</Label>
                <Select value={formData.vehicleModel} onValueChange={handleVehicleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn dòng xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOptions.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vin">Số VIN *</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                  placeholder="VF8A123456789"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="color">Màu sắc *</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn màu sắc" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(color => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Giá bán (₫)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1200000000"
                  readOnly={!!formData.vehicleModel}
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Vị trí trong kho</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zone">Khu vực *</Label>
                <Select value={formData.zone} onValueChange={(value) => setFormData(prev => ({ ...prev, zone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneOptions.map(zone => (
                      <SelectItem key={zone} value={zone}>
                        Khu {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Vị trí cụ thể *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value.toUpperCase() }))}
                  placeholder="A1-01"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Battery className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Thông tin bổ sung</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batteryLevel">Mức pin hiện tại (%)</Label>
                <Input
                  id="batteryLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.batteryLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, batteryLevel: e.target.value }))}
                  placeholder="85"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ghi chú về tình trạng xe, kiểm tra..."
                rows={3}
              />
            </div>
          </div>

          {/* Preview */}
          {formData.vehicleName && (
            <div className="p-4 rounded-lg border bg-muted/20">
              <h4 className="font-semibold mb-2">Xem trước</h4>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-12 bg-primary/10 rounded flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{formData.vehicleName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.vin && `VIN: ${formData.vin}`}
                    {formData.color && ` • ${formData.color}`}
                    {formData.location && ` • ${formData.location}`}
                  </p>
                </div>
                {formData.price && (
                  <Badge variant="outline" className="text-primary">
                    {(parseInt(formData.price) / 1000000).toFixed(0)}M₫
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-primary">
              <Package className="w-4 h-4 mr-2" />
              Thêm vào kho
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}