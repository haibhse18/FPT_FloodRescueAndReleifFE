"use client";

import { useState, useEffect } from "react";
import { FaArrowLeft, FaCheckCircle, FaTruck, FaBoxOpen } from "react-icons/fa";
import { toast } from "sonner";
import { missionApi } from "@/modules/missions/infrastructure/mission.api";
import { warehouseRepository } from "@/modules/warehouse/infrastructure/warehouse.repository.impl";
import type { AcceptInfo } from "@/modules/missions/domain/acceptInfo.entity";
import type { AcceptTimelineInput } from "@/modules/timelines/domain/timeline.entity";
import type { Warehouse } from "@/modules/warehouse/domain/warehouse.entity";

interface AcceptMissionFormProps {
  missionId: string;
  onSubmit: (payload: AcceptTimelineInput) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function AcceptMissionForm({
  missionId,
  onSubmit,
  onBack,
  loading = false,
}: AcceptMissionFormProps) {
  const [acceptInfo, setAcceptInfo] = useState<AcceptInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [warehouseOptions, setWarehouseOptions] = useState<Warehouse[]>([]);
  
  // Form state
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [teamCombos, setTeamCombos] = useState<{ comboId: string; quantity: number }[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAcceptInfo = async () => {
      setLoadingInfo(true);
      try {
        const [response, warehouseResponse] = await Promise.all([
          missionApi.getAcceptInfo(missionId),
          warehouseRepository.getWarehouses(),
        ]);

        const data = (response as any).data as AcceptInfo;
        setAcceptInfo(data);
        setWarehouseOptions(warehouseResponse.warehouses || []);

        const defaultWarehouseId = warehouseResponse.warehouses?.[0]?._id || data.warehouses?.[0]?._id;
        
        // Auto-select first warehouse if available
        if (defaultWarehouseId) {
          setSelectedWarehouseId(defaultWarehouseId);
        }
      } catch (error: any) {
        toast.error(error?.message || "Không thể tải thông tin");
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchAcceptInfo();
  }, [missionId]);

  const buildCitizenCombosFromRequests = () => {
    if (!acceptInfo) return [] as AcceptTimelineInput["citizenCombos"];

    return acceptInfo.missionRequests.flatMap((request) => {
      const requestCombos =
        request.request?.requestCombos ||
        request.requestCombosSnapshot ||
        [];

      return requestCombos
        .map((combo) => {
          const comboSupplyId =
            typeof combo.comboSupplyId === "object"
              ? combo.comboSupplyId._id
              : combo.comboSupplyId;

          const quantity = Number(combo.quantity) || 0;
          if (!comboSupplyId || quantity <= 0) return null;

          return {
            missionRequestId: request._id,
            comboSupplyId,
            quantity,
          };
        })
        .filter((item): item is { missionRequestId: string; comboSupplyId: string; quantity: number } => item !== null);
    });
  };

  const handleSubmit = () => {
    if (!selectedWarehouseId) {
      toast.error("Vui lòng chọn kho");
      return;
    }

    const citizenCombos = buildCitizenCombosFromRequests();

    const payload: AcceptTimelineInput = {
      warehouseId: selectedWarehouseId,
      citizenCombos,
      teamCombos: teamCombos
        .filter(tc => tc.comboId && tc.quantity > 0)
        .map(tc => ({
          comboSupplyId: tc.comboId,
          quantity: tc.quantity,
        })),
      vehicles: Array.from(selectedVehicles).map(vehicleId => ({ vehicleId })),
    };

    if (payload.citizenCombos.length === 0 && payload.teamCombos.length === 0 && payload.vehicles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một combo hoặc phương tiện");
      return;
    }

    onSubmit(payload);
  };

  const handleAddTeamCombo = () => {
    setTeamCombos(prev => [...prev, { comboId: "", quantity: 1 }]);
  };

  const handleTeamComboChange = (index: number, comboId: string) => {
    setTeamCombos(prev => prev.map((tc, i) => i === index ? { ...tc, comboId } : tc));
  };

  const handleTeamQuantityChange = (index: number, quantity: number) => {
    setTeamCombos(prev => prev.map((tc, i) => i === index ? { ...tc, quantity: Math.max(1, quantity) } : tc));
  };

  const handleRemoveTeamCombo = (index: number) => {
    setTeamCombos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vehicleId)) {
        newSet.delete(vehicleId);
      } else {
        newSet.add(vehicleId);
      }
      return newSet;
    });
  };

  if (loadingInfo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-white animate-spin mx-auto mb-3" />
          <p className="text-white/60 text-sm">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!acceptInfo) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/60">Không thể tải thông tin</p>
      </div>
    );
  }

  const teamCombosAvailable = acceptInfo.teamCombos || [];
  const vehicles = acceptInfo.vehicles || [];
  const selectableWarehouses = warehouseOptions.length > 0
    ? warehouseOptions.map((wh) => ({ _id: wh._id, name: wh.name }))
    : acceptInfo.warehouses.map((wh) => ({ _id: wh._id, name: wh.name }));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50"
        >
          <FaArrowLeft />
        </button>
        <h3 className="text-lg font-bold text-white">Chọn vật tư & phương tiện</h3>
      </div>

      {/* Form - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 space-y-6">
        {/* Warehouse Selection */}
        <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-4">
          <label className="block text-sm font-semibold text-mission-text-primary mb-2">
            Kho vật tư *
          </label>
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-mission-text-primary focus:outline-none focus:border-blue-500 disabled:opacity-50 [&>option]:bg-white [&>option]:text-slate-900"
          >
            <option value="">Chọn kho...</option>
            {selectableWarehouses.map((wh) => (
              <option key={wh._id} value={wh._id}>{wh.name}</option>
            ))}
          </select>
        </div>

        {/* Citizen Combos */}
        {acceptInfo.missionRequests.length > 0 && (
          <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaBoxOpen className="text-mission-icon-supplies" />
              <h4 className="text-sm font-bold text-mission-text-primary uppercase">Vật tư cho dân (từ request)</h4>
            </div>
            <div className="space-y-3">
              {acceptInfo.missionRequests.map(request => {
                const requestCombos = request.request?.requestCombos || request.requestCombosSnapshot || [];
                
                return (
                  <div key={request._id} className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/70">Yêu cầu #{request._id.slice(-6)}</p>
                      {requestCombos.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {requestCombos.map((combo, idx) => {
                            const comboName = typeof combo.comboSupplyId === "object" 
                              ? combo.comboSupplyId.name 
                              : "Combo đã chọn";
                            return (
                              <span 
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              >
                                {comboName} x{combo.quantity}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {requestCombos.length === 0 && (
                      <p className="text-xs text-white/60">Request này không có combo vật tư cho dân.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Combos */}
        <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaBoxOpen className="text-mission-icon-supplies" />
              <h4 className="text-sm font-bold text-mission-text-primary uppercase">Vật tư cho đội</h4>
            </div>
            <button
              onClick={handleAddTeamCombo}
              disabled={loading}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              + Thêm
            </button>
          </div>
          <div className="space-y-3">
            {teamCombos.map((tc, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={tc.comboId}
                    onChange={(e) => handleTeamComboChange(index, e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-mission-text-primary text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 [&>option]:bg-white [&>option]:text-slate-900"
                  >
                    <option value="">Chọn combo...</option>
                    {teamCombosAvailable.map(combo => (
                      <option key={combo._id} value={combo._id}>{combo.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveTeamCombo(index)}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm transition-colors disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
                {tc.comboId && (
                  <input
                    type="number"
                    min="1"
                    value={tc.quantity}
                    onChange={(e) => handleTeamQuantityChange(index, parseInt(e.target.value) || 1)}
                    disabled={loading}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder="Số lượng"
                  />
                )}
              </div>
            ))}
            {teamCombos.length === 0 && (
              <p className="text-center text-white/50 text-sm py-4">Chưa có vật tư cho đội</p>
            )}
          </div>
        </div>

        {/* Vehicles */}
        <div className="bg-mission-bg-secondary border border-mission-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FaTruck className="text-mission-icon-supplies" />
            <h4 className="text-sm font-bold text-mission-text-primary uppercase">Phương tiện</h4>
          </div>
          <div className="space-y-2">
            {vehicles.map(vehicle => (
              <label
                key={vehicle._id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedVehicles.has(vehicle._id)}
                  onChange={() => toggleVehicle(vehicle._id)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{vehicle.name}</p>
                  <p className="text-white/60 text-xs">{vehicle.type} {vehicle.licensePlate ? `• ${vehicle.licensePlate}` : ''}</p>
                </div>
              </label>
            ))}
            {vehicles.length === 0 && (
              <p className="text-center text-white/50 text-sm py-4">Không có phương tiện khả dụng</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-white/10 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full px-6 py-4 rounded-xl bg-mission-action-accept hover:bg-mission-action-accept-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <FaCheckCircle className="text-lg" />
              Xác nhận chấp nhận
            </>
          )}
        </button>
      </div>
    </div>
  );
}
