import { useState, useEffect, useMemo } from "react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { WarehouseStockResponse, VehicleSerialResponse, WarehouseResponse } from "@/services/api-warehouse";
import { electricVehicleService, type ElectricVehicleResponse } from "@/services/api-electric-vehicle";
import { ShowroomTopbar } from "@/components/ShowroomTopbar";
import { ShowroomStats } from "@/components/ShowroomStats";
import { ShowroomSearchFilter } from "@/components/ShowroomSearchFilter";
import { ShowroomVehicleList } from "@/components/ShowroomVehicleList";
import { ShowroomDetailButtons } from "@/components/ShowroomDetailButtons";
import { ShowroomDetailsColor } from "@/components/ShowroomDetailsColor";
import { ShowroomDetailVehicleInformation } from "@/components/ShowroomDetailVehicleInformation";
import { ShowroomDetailVehicleImage } from "@/components/ShowroomDetailVehicleImage";
import { ShowroomVehicleSpecifications } from "@/components/ShowroomVehicleSpecifications";
import { ShowroomVehicleFeatures } from "@/components/ShowroomVehicleFeatures";

// Type for individual vehicle with serial info
type IndividualVehicle = WarehouseStockResponse & {
  serial: VehicleSerialResponse;
  status: string;
  holdUntil?: string;
  vin: string;
  imageUrl?: string;
};
import {
  Car,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


// Firebase fallback image URL
const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b";

export default function VehicleShowroom() {
  const navigate = useNavigate();
  const { fetchWarehouses, fetchWarehouse, loading, allWarehouses } = useWarehouses();
  const [selectedVehicle, setSelectedVehicle] = useState<IndividualVehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [electricVehicles, setElectricVehicles] = useState<ElectricVehicleResponse[]>([]);
  const [detailedWarehouses, setDetailedWarehouses] = useState<WarehouseResponse[]>([]);

  // Fetch all warehouses data on component mount
  useEffect(() => {
    const fetchAllWarehousesWithDetails = async () => {
      try {
        // First, get the list of all warehouses
        await fetchWarehouses();
      } catch (error) {
        console.error('Error fetching warehouse list:', error);
      }
    };

    fetchAllWarehousesWithDetails();
  }, [fetchWarehouses]);

  // Once we have the warehouse list, fetch detailed data for each warehouse
  useEffect(() => {
    const fetchWarehouseDetails = async () => {
      if (allWarehouses && allWarehouses.length > 0) {
        console.log('Fetching details for warehouses:', allWarehouses);
        
        const detailedWarehousePromises = allWarehouses.map(async (warehouse) => {
          try {
            console.log(`Fetching details for warehouse ${warehouse.warehouseId}...`);
            const detailedWarehouse = await fetchWarehouse(warehouse.warehouseId);
            return detailedWarehouse;
          } catch (error) {
            console.error(`Error fetching warehouse ${warehouse.warehouseId}:`, error);
            return null;
          }
        });

        const detailedResults = await Promise.all(detailedWarehousePromises);
        const validWarehouses = detailedResults.filter(w => w !== null);
        console.log('All detailed warehouses:', validWarehouses);
        setDetailedWarehouses(validWarehouses);
      }
    };

    if (allWarehouses?.length > 0) {
      fetchWarehouseDetails();
    }
  }, [allWarehouses, fetchWarehouse]);

  // Fetch electric vehicles data for images
  useEffect(() => {
    const fetchElectricVehicles = async () => {
      try {
        const vehicles = await electricVehicleService.getAllElectricVehicles();
        setElectricVehicles(vehicles);
      } catch (error) {
        console.error('Error fetching electric vehicles:', error);
      }
    };

    fetchElectricVehicles();
  }, []);

  // Function to get the correct image for a vehicle based on model code and color
  const getVehicleImage = (vehicle: IndividualVehicle): string => {
    // Find matching electric vehicle by model code and color
    const matchingEV = electricVehicles.find(ev => 
      ev.modelCode === vehicle.modelCode && 
      ev.color === vehicle.color
    );
    
    // Return the image URL from electric vehicle data, or fallback to firebase image
    return matchingEV?.imageUrl || firebaseImageUrl;
  };

  // Flatten all warehouse items from all detailed warehouses
  const warehouseItems = useMemo(() => {
    console.log('Creating warehouseItems from detailedWarehouses:', detailedWarehouses);
    return detailedWarehouses?.flatMap(warehouse => {
      console.log(`Processing warehouse ${warehouse.warehouseName}:`, warehouse.items);
      return warehouse.items || [];
    }) || [];
  }, [detailedWarehouses]);

  // Set selected vehicle when warehouse data is loaded
  useEffect(() => {
    if (warehouseItems.length > 0 && !selectedVehicle) {
      // Get first individual vehicle from flattened list
      const firstItem = warehouseItems[0];
      if (firstItem.serials && firstItem.serials.length > 0) {
        setSelectedVehicle({
          ...firstItem,
          serial: firstItem.serials[0],
          status: firstItem.serials[0].status,
          holdUntil: firstItem.serials[0].holdUntil,
          vin: firstItem.serials[0].vin
        });
      }
    }
  }, [warehouseItems, selectedVehicle]);
  
  // Flatten warehouse items into individual vehicle serials
  const individualVehicles = warehouseItems.flatMap(item => 
    (item.serials || []).map(serial => ({
      ...item,
      serial: serial,
      status: serial.status,
      holdUntil: serial.holdUntil,
      vin: serial.vin
    }))
  );
  
  const filteredVehicles = individualVehicles.filter(vehicle => {
    const matchesSearch = (vehicle.modelCode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "available" && vehicle.status === 'AVAILABLE') ||
      (filterStatus === "out-of-stock" && vehicle.status === 'SOLD_OUT') ||
      (filterStatus === "limited" && vehicle.status === 'HOLD');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (vehicle: IndividualVehicle) => {
    if (vehicle.status === 'AVAILABLE') {
      return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
    } else if (vehicle.status === 'HOLD') {
      return <Badge className="bg-warning/20 text-warning border-warning">Đang giữ</Badge>;
    } else if (vehicle.status === 'SOLD_OUT') {
      return <Badge className="bg-destructive/20 text-destructive border-destructive">Đã bán</Badge>;
    }
    return <Badge className="bg-gray-200 text-gray-600">Không rõ</Badge>;
  };

  const totalVehicles = individualVehicles.length;
  const availableVehicles = individualVehicles.filter(vehicle => vehicle.status === 'AVAILABLE').length;
  const totalModels = new Set(warehouseItems.map(item => `${item.modelCode}-${item.color}`)).size;

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <ShowroomTopbar />

      {/* Main Content */}
      <div className="p-6 space-y-6">

        {/* Stats */}
        <ShowroomStats 
          loading={loading}
          totalModels={totalModels}
          totalVehicles={totalVehicles}
          availableVehicles={availableVehicles}
          warehouseName="Tất cả kho hàng"
        />

        {/* Search & Filter */}
        <ShowroomSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

          {/* Vehicle List */}
          <ShowroomVehicleList
            loading={loading}
            filteredVehicles={filteredVehicles}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={setSelectedVehicle}
            getVehicleImage={getVehicleImage}
            getStatusBadge={getStatusBadge}
            firebaseImageUrl={firebaseImageUrl}
          />

          {/* Vehicle Details */}
          <div className="lg:col-span-2 overflow-y-auto">
            {selectedVehicle ? (
              <div className="space-y-6">
                {/* Main Image and Basic Info */}
                <Card className="overflow-hidden">
                  {/* Vehicle Image */}
                  <ShowroomDetailVehicleImage
                    selectedVehicle={selectedVehicle}
                    getVehicleImage={getVehicleImage}
                    getStatusBadge={getStatusBadge}
                    firebaseImageUrl={firebaseImageUrl}
                  />
                  <CardContent className="p-6">
                    {/* Vehicle Information Header */}
                    <ShowroomDetailVehicleInformation selectedVehicle={selectedVehicle} />

                    {/* Color Display */}
                    <ShowroomDetailsColor selectedVehicle={selectedVehicle} />

                    {/* Action Buttons */}
                    <ShowroomDetailButtons selectedVehicle={selectedVehicle} />
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Tabs defaultValue="specs" className="space-y-4">

                  <TabsContent value="specs">
                    <Card>
                      <ShowroomVehicleSpecifications selectedVehicle={selectedVehicle} />
                    </Card>
                  </TabsContent>

                  <TabsContent value="features">
                    <Card>
                      <ShowroomVehicleFeatures selectedVehicle={selectedVehicle} />
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chọn một xe để xem chi tiết</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}