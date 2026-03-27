"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import { CreateRescueRequestUseCase } from "@/modules/requests/application/createRescueRequest.usecase";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import type { Supply } from "@/modules/supplies/domain/supply.entity";
import { useToast } from "@/hooks/use-toast";

// Initialize use case with repository
const createRescueRequestUseCase = new CreateRescueRequestUseCase(
  requestRepository,
);

// Dynamic import cho OpenMap để tránh SSR issues
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">Đang tải bản đồ...</p>
      </div>
    ),
  },
);

const MAX_PEOPLE = 100;
const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 500;

const CONTEXT_OPTIONS = ["Trẻ em", "Người già", "Người bị thương"];
const MEDICINE_NEED = "Thuốc";
const MEDICINE_NOTE_PREFIX = "Thuốc yêu cầu:";
const CONTEXT_EXTRA_SUPPLIES: Record<string, string[]> = {
  "Trẻ em": ["Sữa trẻ em", "Tã em bé"],
  "Người già": ["Thực phẩm mềm", "Đồ giữ ấm"],
  "Người bị thương": ["Băng gạc", "Thuốc sát trùng"],
};

const quickReliefActions = [
  {
    id: "heavy-rain",
    label: "Mưa lớn kéo dài",
    description: "Mưa to liên tục, nguy cơ cô lập và thiếu nhu yếu phẩm",
    needs: ["Nước uống", "Thực phẩm", "Áo phao"],
    contexts: [],
    note: "Khu vực đang mưa lớn kéo dài, cần hỗ trợ nhu yếu phẩm sớm.",
  },
  {
    id: "flooded-area",
    label: "Ngập lụt",
    description: "Nước dâng cao, đi lại khó khăn, thiếu nguồn cung cơ bản",
    needs: ["Nước uống", "Thực phẩm", "Chăn / quần áo", "Áo phao"],
    contexts: [],
    note: "Khu vực đang ngập lụt, gia đình cần hỗ trợ nhu yếu phẩm khẩn cấp.",
  },
  {
    id: "landslide-risk",
    label: "Sạt lở",
    description: "Khu vực có nguy cơ hoặc đã xảy ra sạt lở đất đá",
    needs: ["Nước uống", "Thực phẩm", "Thuốc"],
    contexts: ["Người bị thương"],
    note: "Khu vực có sạt lở đất đá, cần hỗ trợ vật phẩm cứu trợ an toàn.",
  },
  {
    id: "storm-wind",
    label: "Gió mạnh / bão",
    description: "Thời tiết xấu gây mất điện, thiếu nước và vật dụng thiết yếu",
    needs: ["Nước uống", "Thực phẩm", "Chăn / quần áo"],
    contexts: [],
    note: "Khu vực có gió mạnh/bão, sinh hoạt bị gián đoạn cần hỗ trợ khẩn.",
  },
] as const;

const RELIEF_INCIDENT_TYPE_BY_CONDITION: Record<string, "Flood" | "Landslide" | "Other"> = {
  "heavy-rain": "Other",
  "flooded-area": "Flood",
  "landslide-risk": "Landslide",
  "storm-wind": "Other",
};

const RELIEF_MIN_FAMILY_MEMBERS = 1;
const RELIEF_MAX_FAMILY_MEMBERS = 15;

type ReliefGroupKey = "adult" | "child" | "elderly" | "injured";

type ReliefComboItemTemplate = {
  label: string;
  qtyPerPerson3Days: number;
  categoryHint?: Supply["category"];
  keywords: string[];
};

type ReliefGroupComboTemplate = {
  key: ReliefGroupKey;
  label: string;
  description: string;
  items: ReliefComboItemTemplate[];
};

type ReliefHouseholdComposition = {
  adult: number;
  child: number;
  elderly: number;
  injured: number;
};

const RELIEF_GROUP_COMBO_TEMPLATES: Record<ReliefGroupKey, ReliefGroupComboTemplate> = {
  adult: {
    key: "adult",
    label: "Combo người trưởng thành",
    description: "Nhu yếu phẩm cơ bản cho 1 người trưởng thành trong 3 ngày",
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 9, categoryHint: "WATER", keywords: ["nuoc", "water"] },
      { label: "Thực phẩm", qtyPerPerson3Days: 6, categoryHint: "FOOD", keywords: ["thuc pham", "food", "mi", "gao"] },
      { label: "Chăn / áo ấm", qtyPerPerson3Days: 1, categoryHint: "CLOTHING", keywords: ["chan", "ao", "quan", "clothing"] },
    ],
  },
  child: {
    key: "child",
    label: "Combo trẻ em",
    description: "Nhu yếu phẩm cho 1 trẻ em trong 3 ngày",
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 6, categoryHint: "WATER", keywords: ["nuoc", "water"] },
      { label: "Sữa trẻ em", qtyPerPerson3Days: 6, categoryHint: "FOOD", keywords: ["sua", "milk"] },
      { label: "Thực phẩm mềm", qtyPerPerson3Days: 6, categoryHint: "FOOD", keywords: ["thuc pham", "chao", "bot"] },
      { label: "Tã em bé", qtyPerPerson3Days: 9, categoryHint: "OTHER", keywords: ["ta", "diaper"] },
    ],
  },
  elderly: {
    key: "elderly",
    label: "Combo người già",
    description: "Nhu yếu phẩm cho 1 người già trong 3 ngày",
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 7, categoryHint: "WATER", keywords: ["nuoc", "water"] },
      { label: "Thực phẩm mềm", qtyPerPerson3Days: 6, categoryHint: "FOOD", keywords: ["thuc pham", "chao", "sup"] },
      { label: "Đồ giữ ấm", qtyPerPerson3Days: 1, categoryHint: "CLOTHING", keywords: ["giu am", "chan", "ao"] },
      { label: "Bộ y tế cơ bản", qtyPerPerson3Days: 1, categoryHint: "MEDICAL", keywords: ["y te", "medical", "thuoc"] },
    ],
  },
  injured: {
    key: "injured",
    label: "Combo người bị thương",
    description: "Nhu yếu phẩm cho 1 người bị thương trong 3 ngày",
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 8, categoryHint: "WATER", keywords: ["nuoc", "water"] },
      { label: "Thực phẩm", qtyPerPerson3Days: 6, categoryHint: "FOOD", keywords: ["thuc pham", "food", "mi"] },
      { label: "Băng gạc", qtyPerPerson3Days: 6, categoryHint: "MEDICAL", keywords: ["bang gac", "gauze"] },
      { label: "Thuốc sát trùng", qtyPerPerson3Days: 3, categoryHint: "MEDICAL", keywords: ["sat trung", "antiseptic"] },
    ],
  },
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const buildReliefSupplyPlan = (
  composition: ReliefHouseholdComposition,
  includeMedicine: boolean,
  medicineDetails: string,
) => {
  const totals = new Map<
    string,
    {
      label: string;
      qty: number;
      categoryHint?: Supply["category"];
      keywords: string[];
    }
  >();

  const groupLines: string[] = [];

  const addItem = (item: ReliefComboItemTemplate, qty: number) => {
    if (qty <= 0) return;
    const key = normalizeText(item.label);
    const existing = totals.get(key);
    if (existing) {
      existing.qty += qty;
      return;
    }
    totals.set(key, {
      label: item.label,
      qty,
      categoryHint: item.categoryHint,
      keywords: item.keywords,
    });
  };

  (Object.keys(composition) as ReliefGroupKey[]).forEach((groupKey) => {
    const count = composition[groupKey];
    if (count <= 0) return;
    const combo = RELIEF_GROUP_COMBO_TEMPLATES[groupKey];
    groupLines.push(`${combo.label}: ${count} người`);
    combo.items.forEach((item) => addItem(item, item.qtyPerPerson3Days * count));
  });

  if (includeMedicine && medicineDetails.trim()) {
    addItem(
      {
        label: `Thuốc theo chỉ định (${medicineDetails.trim()})`,
        qtyPerPerson3Days: 1,
        categoryHint: "MEDICAL",
        keywords: ["thuoc", "medical", "y te"],
      },
      Math.max(1, composition.injured),
    );
  }

  const totalItems = Array.from(totals.values());
  const totalLines = totalItems.map((item) => `${item.label}: ${item.qty}`);

  return {
    groupLines,
    totalItems,
    totalLines,
  };
};

const getCreatedRequestId = (request: unknown): string | null => {
  if (!request || typeof request !== "object") {
    return null;
  }

  const candidate = request as {
    requestId?: string;
    _id?: string;
    id?: string;
  };

  return candidate.requestId || candidate._id || candidate.id || null;
};

const ACTIVE_REQUEST_STATUSES = new Set([
  "SUBMITTED",
  "VERIFIED",
  "IN_PROGRESS",
  "FULFILLED",
  "PARTIALLY_FULFILLED",
  "ACCEPTED",
]);

const normalizeStatus = (status: unknown): string =>
  String(status ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

export default function CitizenRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const reverseGeoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [requestType, setRequestType] = useState<"Rescue" | "Relief">("Rescue");
  const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationSource, setLocationSource] = useState<"gps" | "manual" | "unknown">("unknown");
  const [isManualSelectionMode, setIsManualSelectionMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(
    null,
  );
  const [rescueRequest, setRescueRequest] = useState({
    dangerType: "",
    description: "",
    numberOfPeople: 1,
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [reliefNeedMedicine, setReliefNeedMedicine] = useState(false);
  const [reliefContexts, setReliefContexts] = useState<string[]>([]);
  const [familyMemberCount, setFamilyMemberCount] = useState(1);
  const [reliefChildCount, setReliefChildCount] = useState(0);
  const [reliefElderlyCount, setReliefElderlyCount] = useState(0);
  const [reliefInjuredCount, setReliefInjuredCount] = useState(0);
  const [isReliefComboModalOpen, setIsReliefComboModalOpen] = useState(false);
  const [reliefMedicineDetails, setReliefMedicineDetails] = useState("");
  const [reliefNote, setReliefNote] = useState("");
  const [selectedReliefQuickAction, setSelectedReliefQuickAction] = useState<
    string | null
  >(null);
  const [desktopMapHeight, setDesktopMapHeight] = useState(520);
  const [isCheckingActiveRequest, setIsCheckingActiveRequest] = useState(true);
  const [activeRequestIdOnEntry, setActiveRequestIdOnEntry] = useState<string | null>(null);

  const reliefFamilySize = Math.max(
    RELIEF_MIN_FAMILY_MEMBERS,
    Math.min(RELIEF_MAX_FAMILY_MEMBERS, familyMemberCount || RELIEF_MIN_FAMILY_MEMBERS),
  );

  const isChildSelected = reliefContexts.includes("Trẻ em");
  const isElderlySelected = reliefContexts.includes("Người già");
  const isInjuredSelected = reliefContexts.includes("Người bị thương");

  const selectedChildCount = isChildSelected ? reliefChildCount : 0;
  const selectedElderlyCount = isElderlySelected ? reliefElderlyCount : 0;
  const selectedInjuredCount = isInjuredSelected ? reliefInjuredCount : 0;

  const nonAdultCount = selectedChildCount + selectedElderlyCount + selectedInjuredCount;
  const reliefAdultCount = Math.max(0, reliefFamilySize - nonAdultCount);
  const reliefDistributionInvalid = nonAdultCount > reliefFamilySize;

  const reliefComposition: ReliefHouseholdComposition = {
    adult: reliefAdultCount,
    child: selectedChildCount,
    elderly: selectedElderlyCount,
    injured: selectedInjuredCount,
  };

  const reliefSupplyPlan = buildReliefSupplyPlan(
    reliefComposition,
    reliefNeedMedicine,
    reliefMedicineDetails,
  );

  const findActiveRequestId = useCallback(async (): Promise<string | null> => {
    try {
      const requests = await requestRepository.getMyRequests({ page: 1, limit: 20 });
      const sorted = [...(requests || [])].sort((a: any, b: any) => {
        const aTime = new Date(a?.createdAt || 0).getTime();
        const bTime = new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
      });

      const active = sorted.find((req: any) =>
        ACTIVE_REQUEST_STATUSES.has(normalizeStatus(req?.status)),
      ) as { requestId?: string; _id?: string; id?: string } | undefined;

      return active?.requestId || active?._id || active?.id || null;
    } catch (lookupError) {
      console.error("Cannot resolve active request:", lookupError);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const guardActiveRequest = async () => {
      const activeRequestId = await findActiveRequestId();
      if (cancelled) return;

      if (activeRequestId) {
        setActiveRequestIdOnEntry(activeRequestId);
        toast({
          title: "Bạn đã có yêu cầu đang xử lý",
          description: "Hệ thống chuyển bạn tới yêu cầu hiện tại để tránh tạo trùng.",
        });
        router.replace(`/history/${activeRequestId}`);
        return;
      }

      setIsCheckingActiveRequest(false);
    };

    void guardActiveRequest();

    return () => {
      cancelled = true;
    };
  }, [findActiveRequestId, router, toast]);

  // Quick action templates
  const quickRescueActions = [
    {
      id: "flood",
      label: "Ngập lụt",
      description: "Nước dâng cao, cần di chuyển khẩn cấp",
    },
    {
      id: "trapped",
      label: "Bị kẹt",
      description: "Bị mắc kẹt, không thể thoát ra",
    },
    {
      id: "injury",
      label: "Bị thương",
      description: "Có người bị thương cần cấp cứu",
    },
    {
      id: "landslide",
      label: "Sạt lở",
      description: "Đất đá sạt lở, nguy hiểm cao",
    },
    {
      id: "other",
      label: "Khác",
      description: "Tình huống khẩn cấp khác",
    },
  ];

  // Mô tả mặc định tự động điền khi chọn loại nguy hiểm (≥10 chars cho backend)
  const defaultDescriptionMap: Record<string, string> = {
    flood: "Khu vực bị ngập lụt, nước dâng cao, cần hỗ trợ di chuyển khẩn cấp.",
    trapped: "Bị mắc kẹt tại vị trí hiện tại, không thể tự thoát ra ngoài.",
    injury: "Có người bị thương tại hiện trường, cần hỗ trợ y tế khẩn cấp.",
    landslide: "Khu vực xảy ra sạt lở đất đá, nguy hiểm cao, cần cứu hộ.",
    other: "Tình huống khẩn cấp cần hỗ trợ, vui lòng liên hệ sớm nhất.",
  };

  // Đọc type từ URL query param và pre-select
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "rescue") {
      setRequestType("Rescue");
      setSelectedQuickAction("flood");
      setRescueRequest((prev) => ({
        ...prev,
        dangerType: "flood",
        description: prev.description || defaultDescriptionMap["flood"],
      }));
    } else if (typeParam === "relief") {
      setRequestType("Relief");
    } else if (typeParam === "report") {
      setRequestType("Rescue");
      setSelectedQuickAction("landslide");
      setRescueRequest((prev) => ({
        ...prev,
        dangerType: "landslide",
        description: prev.description || defaultDescriptionMap["landslide"],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Lấy vị trí hiện tại khi component mount
  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (reverseGeoTimerRef.current) {
        clearTimeout(reverseGeoTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateDesktopMapHeight = () => {
      const viewportHeight = window.innerHeight;
      const nextHeight = Math.max(420, Math.min(760, viewportHeight - 290));
      setDesktopMapHeight(nextHeight);
    };

    updateDesktopMapHeight();
    window.addEventListener("resize", updateDesktopMapHeight);
    return () => window.removeEventListener("resize", updateDesktopMapHeight);
  }, []);

  const stripMedicineNoteLine = (note: string) =>
    note
      .split("\n")
      .filter((line) => !line.trim().startsWith(MEDICINE_NOTE_PREFIX))
      .join("\n")
      .trim();

  // Đồng bộ ô nhập thuốc vào ghi chú để coordinator nắm đúng loại thuốc cần hỗ trợ.
  useEffect(() => {
    const hasMedicineNeed = reliefNeedMedicine;
    if (!hasMedicineNeed && reliefMedicineDetails) {
      setReliefMedicineDetails("");
    }

    setReliefNote((prev) => {
      const base = stripMedicineNoteLine(prev);
      if (!hasMedicineNeed || !reliefMedicineDetails.trim()) return base;
      return [base, `${MEDICINE_NOTE_PREFIX} ${reliefMedicineDetails.trim()}`]
        .filter(Boolean)
        .join("\n");
    });
  }, [reliefNeedMedicine, reliefMedicineDetails]);

  // Hàm lấy vị trí hiện tại
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (!("geolocation" in navigator)) {
      setCurrentLocation("Trình duyệt không hỗ trợ GPS");
      setIsLoadingLocation(false);
      toast({
        variant: "destructive",
        title: "Không hỗ trợ GPS",
        description:
          "Trình duyệt của bạn không hỗ trợ định vị. Vui lòng dùng trình duyệt hiện đại hơn.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationSource("gps");
        setCoordinates({ lat: latitude, lon: longitude });
        await getAddressFromOpenMap(latitude, longitude);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setCoordinates(null);
        setIsLoadingLocation(false);

        let description =
          "Không thể lấy vị trí GPS. Vui lòng bật GPS và cấp quyền cho trình duyệt, sau đó nhấn Cập nhật.";
        if (error.code === error.PERMISSION_DENIED) {
          description =
            "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền GPS trong cài đặt trình duyệt và nhấn Cập nhật.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          description =
            "Không nhận được tín hiệu GPS. Vui lòng kiểm tra thiết bị và thử lại.";
        } else if (error.code === error.TIMEOUT) {
          description = "Lấy vị trí GPS quá thời gian. Vui lòng thử lại.";
        }

        setCurrentLocation("Không thể lấy vị trí");
        toast({
          variant: "destructive",
          title: "Lỗi định vị GPS",
          description,
        });
      },
    );
  };

  // Hàm gọi API Nominatim để lấy địa chỉ cụ thể từ tọa độ (proxy qua Next.js để tránh CORS)
  const getAddressFromOpenMap = async (lat: number, lon: number) => {
    try {
      const query = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
      });
      const url = `/api/reverse-geocode?${query.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const isPostalCodeSegment = (segment: string) => /^\d{5,6}$/.test(segment.trim());

      // Xây dựng địa chỉ đầy đủ từ các thành phần
      const addressParts: string[] = [];

      // Ưu tiên: display_name hoặc kết hợp các thành phần
      if (data.display_name) {
        // display_name từ Nominatim thường đã đầy đủ
        // Cắt bỏ phần quốc gia ở cuối (nếu cần)
        const parts = (data.display_name as string)
          .split(',')
          .map((p: string) => p.trim())
          .slice(0, -1) // Bỏ country
          .filter((p: string) => !isPostalCodeSegment(p));
        const address = parts.join(', ') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setCurrentLocation(address);
      } else {
        // Fallback: kết hợp các phần địa chỉ
        const addr = data.address || {};

        if (addr.road) addressParts.push(addr.road);
        if (addr.suburb) addressParts.push(addr.suburb);
        if (addr.city_district) addressParts.push(addr.city_district);
        if (addr.district) addressParts.push(addr.district);
        if (addr.city) addressParts.push(addr.city);
        if (addr.county) addressParts.push(addr.county);
        if (addr.state) addressParts.push(addr.state);
        if (addr.postcode) addressParts.push(addr.postcode);

        const cleanedAddressParts = addressParts.filter((part) => !isPostalCodeSegment(part));

        const location = cleanedAddressParts.length > 0
          ? cleanedAddressParts.join(', ')
          : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setCurrentLocation(location);
      }
    } catch (error) {
      console.warn("Address lookup failed, fallback to coordinates", error);
      setCurrentLocation(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }
  };

  const handleManualLocationSelect = (lat: number, lon: number) => {
    setLocationSource("manual");
    setCoordinates({ lat, lon });
    setCurrentLocation(`Đang cập nhật địa chỉ... (${lat.toFixed(4)}, ${lon.toFixed(4)})`);

    if (reverseGeoTimerRef.current) {
      clearTimeout(reverseGeoTimerRef.current);
    }

    reverseGeoTimerRef.current = setTimeout(() => {
      void getAddressFromOpenMap(lat, lon);
    }, 450);
  };

  const getMaxAssignableForContext = (context: string) => {
    const child = context === "Trẻ em" ? 0 : selectedChildCount;
    const elderly = context === "Người già" ? 0 : selectedElderlyCount;
    const injured = context === "Người bị thương" ? 0 : selectedInjuredCount;
    const used = child + elderly + injured;
    return Math.max(0, reliefFamilySize - used);
  };

  const handleReliefContextToggle = (context: string, checked: boolean) => {
    setReliefContexts((prev) => {
      if (checked) {
        if (prev.includes(context)) return prev;
        return [...prev, context];
      }
      return prev.filter((item) => item !== context);
    });

    if (!checked) {
      if (context === "Trẻ em") setReliefChildCount(0);
      if (context === "Người già") setReliefElderlyCount(0);
      if (context === "Người bị thương") setReliefInjuredCount(0);
      return;
    }

    const suggested = Math.min(1, getMaxAssignableForContext(context));
    if (context === "Trẻ em") setReliefChildCount(suggested);
    if (context === "Người già") setReliefElderlyCount(suggested);
    if (context === "Người bị thương") setReliefInjuredCount(suggested);
  };

  const handleReliefContextCountChange = (context: string, rawValue: string) => {
    if (rawValue.trim() === "") {
      if (context === "Trẻ em") setReliefChildCount(0);
      if (context === "Người già") setReliefElderlyCount(0);
      if (context === "Người bị thương") setReliefInjuredCount(0);
      return;
    }

    const parsed = Number.parseInt(rawValue || "0", 10);
    const next = Number.isFinite(parsed) ? parsed : 0;
    const clamped = Math.max(0, Math.min(getMaxAssignableForContext(context), next));

    if (context === "Trẻ em") setReliefChildCount(clamped);
    if (context === "Người già") setReliefElderlyCount(clamped);
    if (context === "Người bị thương") setReliefInjuredCount(clamped);
  };

  useEffect(() => {
    let remaining = reliefFamilySize;

    const nextChild = isChildSelected ? Math.min(reliefChildCount, remaining) : 0;
    remaining -= nextChild;

    const nextElderly = isElderlySelected ? Math.min(reliefElderlyCount, remaining) : 0;
    remaining -= nextElderly;

    const nextInjured = isInjuredSelected ? Math.min(reliefInjuredCount, remaining) : 0;

    if (nextChild !== reliefChildCount) setReliefChildCount(nextChild);
    if (nextElderly !== reliefElderlyCount) setReliefElderlyCount(nextElderly);
    if (nextInjured !== reliefInjuredCount) setReliefInjuredCount(nextInjured);
  }, [
    reliefFamilySize,
    isChildSelected,
    isElderlySelected,
    isInjuredSelected,
    reliefChildCount,
    reliefElderlyCount,
    reliefInjuredCount,
  ]);

  const handleRequestTypeChange = (type: "Rescue" | "Relief") => {
    setRequestType(type);
    if (type === "Rescue") {
      setReliefNeedMedicine(false);
      setReliefContexts([]);
      setFamilyMemberCount(1);
      setReliefChildCount(0);
      setReliefElderlyCount(0);
      setReliefInjuredCount(0);
      setIsReliefComboModalOpen(false);
      setReliefMedicineDetails("");
      setReliefNote("");
      setSelectedReliefQuickAction(null);
    }
  };

  const applyReliefQuickAction = (actionId: string) => {
    const action = quickReliefActions.find((item) => item.id === actionId);
    if (!action) return;
    const actionContexts = action.contexts as readonly string[];

    setSelectedReliefQuickAction(action.id);
    setReliefNeedMedicine(action.needs.some((need) => need === MEDICINE_NEED));
    setReliefContexts([...actionContexts]);
    setReliefChildCount(actionContexts.includes("Trẻ em") ? 1 : 0);
    setReliefElderlyCount(actionContexts.includes("Người già") ? 1 : 0);
    setReliefInjuredCount(actionContexts.includes("Người bị thương") ? 1 : 0);

    setReliefNote(action.note);
  };

  // Xử lý submit form cứu hộ
  const handleRescueSubmit = async () => {
    // Validate: loại nguy hiểm (bắt buộc)
    if (!rescueRequest.dangerType) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn loại nguy hiểm trước khi gửi yêu cầu.",
      });
      return;
    }

    // Validate: GPS (bắt buộc)
    if (!coordinates) {
      toast({
        variant: "destructive",
        title: "Chưa có vị trí GPS",
        description:
          "Không thể gửi yêu cầu khi chưa xác định được vị trí. Vui lòng bật GPS và nhấn Cập nhật.",
      });
      return;
    }

    // Validate: mô tả — bắt buộc, tối thiểu 10 ký tự, tối đa 500 ký tự (backend yêu cầu)
    if (!rescueRequest.description.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu mô tả",
        description: "Vui lòng mô tả tình huống trước khi gửi yêu cầu.",
      });
      return;
    }

    if (rescueRequest.description.trim().length < MIN_DESCRIPTION) {
      toast({
        variant: "destructive",
        title: "Mô tả quá ngắn",
        description: `Mô tả tình huống phải có ít nhất ${MIN_DESCRIPTION} ký tự.`,
      });
      return;
    }

    if (rescueRequest.description.length > MAX_DESCRIPTION) {
      toast({
        variant: "destructive",
        title: "Mô tả quá dài",
        description: `Mô tả tình huống không được vượt quá ${MAX_DESCRIPTION} ký tự (hiện tại: ${rescueRequest.description.length}).`,
      });
      return;
    }

    // Validate: số người — tối đa 100
    if (rescueRequest.numberOfPeople > MAX_PEOPLE) {
      toast({
        variant: "destructive",
        title: "Số người không hợp lệ",
        description: `Số người cần hỗ trợ không được vượt quá ${MAX_PEOPLE} người.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend enum: Flood | Trapped | Injured | Landslide | Other
      const incidentTypeMap: Record<string, string> = {
        flood: "Flood",
        trapped: "Trapped",
        injury: "Injured",
        landslide: "Landslide",
        other: "Other",
      };
      const payload: Record<string, unknown> = {
        type: "Rescue",
        incidentType:
          incidentTypeMap[rescueRequest.dangerType] ?? rescueRequest.dangerType,
        description: rescueRequest.description.trim(),
        peopleCount: rescueRequest.numberOfPeople,
        location: {
          type: "Point",
          coordinates: [coordinates.lon, coordinates.lat] as [number, number],
        },
      };

      // imageUrls: chỉ gửi khi có ảnh, không gửi mảng rỗng (backend validate min 1)
      if (uploadedImages.length > 0) {
        payload.imageUrls = uploadedImages;
      }

      const createdRequest = await createRescueRequestUseCase.execute(payload as any);
      const createdRequestId = getCreatedRequestId(createdRequest);

      toast({
        title: "Yêu cầu đã được gửi! 🎉",
        description: "Đội cứu hộ sẽ liên hệ với bạn sớm nhất có thể.",
      });

      if (createdRequestId) {
        router.push(`/history/${createdRequestId}`);
        return;
      }

      setRescueRequest({
        dangerType: "",
        description: "",
        numberOfPeople: 1,
      });
      setUploadedImages([]);
      setSelectedQuickAction(null);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string | string[]; error?: string };
          status?: number;
        };
        message?: string;
      };
      const msgField = err?.response?.data?.message;
      const rawMsg: string =
        (Array.isArray(msgField) ? msgField.join(", ") : msgField) ||
        err?.response?.data?.error ||
        err?.message ||
        "Lỗi khi gửi yêu cầu cứu hộ";

      console.error(
        "Error submitting rescue request:",
        `HTTP ${err?.response?.status}`,
        JSON.stringify(err?.response?.data ?? {}),
        err?.message,
      );

      let displayMsg = rawMsg;
      if (
        /already has an? active request/i.test(rawMsg) ||
        /active.*request/i.test(rawMsg)
      ) {
        const activeRequestId = await findActiveRequestId();
        displayMsg = activeRequestId
          ? "Bạn đang có một yêu cầu đang xử lý. Hệ thống sẽ chuyển đến yêu cầu hiện tại của bạn."
          : "Bạn đang có một yêu cầu đang xử lý. Vui lòng chờ yêu cầu hiện tại hoàn thành.";

        if (activeRequestId) {
          router.push(`/history/${activeRequestId}`);
        }
      } else if (/validation failed/i.test(rawMsg) || /valid/i.test(rawMsg)) {
        displayMsg = `Dữ liệu không hợp lệ: ${rawMsg}. Vui lòng kiểm tra thông tin và thử lại.`;
      } else if (/unauthorized/i.test(rawMsg) || /401/.test(rawMsg)) {
        displayMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      }

      toast({
        variant: "destructive",
        title: "Gửi yêu cầu thất bại",
        description: displayMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReliefSubmit = async () => {
    if (!selectedReliefQuickAction) {
      toast({
        variant: "destructive",
        title: "Thiếu tình huống khu vực",
        description: "Vui lòng chọn tình huống khu vực trước khi nhập và gửi yêu cầu cứu trợ.",
      });
      return;
    }

    if (!coordinates) {
      toast({
        variant: "destructive",
        title: "Chưa có vị trí GPS",
        description:
          "Không thể gửi yêu cầu khi chưa xác định được vị trí. Vui lòng bật GPS và nhấn Cập nhật.",
      });
      return;
    }

    if (reliefFamilySize < RELIEF_MIN_FAMILY_MEMBERS || reliefFamilySize > RELIEF_MAX_FAMILY_MEMBERS) {
      toast({
        variant: "destructive",
        title: "Số thành viên không hợp lệ",
        description: `Vui lòng nhập từ ${RELIEF_MIN_FAMILY_MEMBERS} đến ${RELIEF_MAX_FAMILY_MEMBERS} người.`,
      });
      return;
    }

    if (reliefDistributionInvalid) {
      toast({
        variant: "destructive",
        title: "Phân bổ thành viên chưa hợp lệ",
        description: "Tổng trẻ em, người già và người bị thương không được vượt quá tổng số thành viên gia đình.",
      });
      return;
    }

    const reliefGroupChecks = [
      { selected: isChildSelected, label: "Trẻ em", count: selectedChildCount },
      { selected: isElderlySelected, label: "Người già", count: selectedElderlyCount },
      { selected: isInjuredSelected, label: "Người bị thương", count: selectedInjuredCount },
    ];

    const invalidReliefGroup = reliefGroupChecks.find(
      (group) => group.selected && (group.count <= 0 || group.count > reliefFamilySize),
    );

    if (invalidReliefGroup) {
      toast({
        variant: "destructive",
        title: "Số lượng nhóm ưu tiên chưa hợp lệ",
        description: `${invalidReliefGroup.label} phải lớn hơn 0 và nhỏ hơn hoặc bằng số thành viên gia đình (${reliefFamilySize}).`,
      });
      return;
    }

    const selectedSupplies = Array.from(
      new Set([
        ...reliefContexts.flatMap((ctx) => CONTEXT_EXTRA_SUPPLIES[ctx] || []),
        ...(reliefNeedMedicine ? [MEDICINE_NEED] : []),
      ]),
    );

    if (!reliefNote.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu ghi chú",
        description: "Vui lòng nhập ghi chú cho yêu cầu cứu trợ.",
      });
      return;
    }

    if (reliefNote.trim().length < MIN_DESCRIPTION) {
      toast({
        variant: "destructive",
        title: "Ghi chú quá ngắn",
        description: `Ghi chú cần ít nhất ${MIN_DESCRIPTION} ký tự.`,
      });
      return;
    }

    const selectedCondition = quickReliefActions.find(
      (action) => action.id === selectedReliefQuickAction,
    );
    const reliefIncidentType = selectedCondition
      ? RELIEF_INCIDENT_TYPE_BY_CONDITION[selectedCondition.id]
      : "Other";

    const reliefDescription = [
      selectedCondition ? `Tình trạng khu vực: ${selectedCondition.label}` : "",
      `Số thành viên gia đình: ${reliefFamilySize}`,
      `Cơ cấu: Trưởng thành ${reliefComposition.adult}, Trẻ em ${reliefComposition.child}, Người già ${reliefComposition.elderly}, Bị thương ${reliefComposition.injured}`,
      `Combo 3 ngày: ${reliefSupplyPlan.totalLines.join(", ")}`,
      `Ghi chú: ${reliefNote.trim()}`,
      selectedSupplies.length > 0 ? `Nhu cầu bổ sung: ${selectedSupplies.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (reliefDescription.length > MAX_DESCRIPTION) {
      toast({
        variant: "destructive",
        title: "Mô tả quá dài",
        description: `Nội dung yêu cầu không được vượt quá ${MAX_DESCRIPTION} ký tự.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        type: "Relief",
        incidentType: reliefIncidentType,
        description: reliefDescription,
        peopleCount: reliefFamilySize,
        location: {
          type: "Point",
          coordinates: [coordinates.lon, coordinates.lat] as [number, number],
        },
      };

      const createdRequest = await createRescueRequestUseCase.execute(payload as any);
      const createdRequestId = getCreatedRequestId(createdRequest);

      toast({
        title: "Yêu cầu cứu trợ đã được gửi",
        description: "Hệ thống đã tiếp nhận yêu cầu Relief của bạn.",
      });

      if (createdRequestId) {
        router.push(`/history/${createdRequestId}`);
        return;
      }

      setReliefNeedMedicine(false);
      setReliefContexts([]);
      setFamilyMemberCount(1);
      setReliefChildCount(0);
      setReliefElderlyCount(0);
      setReliefInjuredCount(0);
      setReliefMedicineDetails("");
      setReliefNote("");
      setSelectedReliefQuickAction(null);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { message?: string | string[]; error?: string };
          status?: number;
        };
        message?: string;
      };
      const msgField = err?.response?.data?.message;
      const rawMsg: string =
        (Array.isArray(msgField) ? msgField.join(", ") : msgField) ||
        err?.response?.data?.error ||
        err?.message ||
        "Lỗi khi gửi yêu cầu cứu trợ";

      let displayMsg = rawMsg;
      if (
        /already has an? active request/i.test(rawMsg) ||
        /active.*request/i.test(rawMsg)
      ) {
        const activeRequestId = await findActiveRequestId();
        displayMsg = activeRequestId
          ? "Bạn đang có một yêu cầu đang xử lý. Hệ thống sẽ chuyển đến yêu cầu hiện tại của bạn."
          : "Bạn đang có một yêu cầu đang xử lý. Vui lòng chờ yêu cầu hiện tại hoàn thành.";

        if (activeRequestId) {
          router.push(`/history/${activeRequestId}`);
        }
      } else if (/validation failed/i.test(rawMsg) || /valid/i.test(rawMsg)) {
        displayMsg = `Dữ liệu không hợp lệ: ${rawMsg}. Vui lòng kiểm tra thông tin và thử lại.`;
      } else if (/unauthorized/i.test(rawMsg) || /401/.test(rawMsg)) {
        displayMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      }

      toast({
        variant: "destructive",
        title: "Gửi yêu cầu thất bại",
        description: displayMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm upload ảnh lên server (server-side upload to Cloudinary)
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setUploadImageError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let data: { success: boolean; url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Lỗi server (${response.status}) — vui lòng thử lại`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Lỗi HTTP ${response.status}`);
      }

      if (data.url) {
        setUploadedImages((prev) => [...prev, data.url!]);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Error uploading image:", msg);
      setUploadImageError(msg);
      setTimeout(() => setUploadImageError(null), 5000);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const descLen = rescueRequest.description.length;
  const descOverLimit = descLen > MAX_DESCRIPTION;
  const reliefNoteLen = reliefNote.length;
  const reliefNoteOverLimit = reliefNoteLen > MAX_DESCRIPTION;
  const submitDisabled = requestType === "Rescue" ? descOverLimit : reliefNoteOverLimit;
  const sectionCardClass =
    "rounded-2xl border border-white/20 bg-[#0f2f44]/70 backdrop-blur-sm shadow-[0_10px_24px_rgba(0,0,0,0.18)]";

  if (isCheckingActiveRequest || activeRequestIdOnEntry) {
    return (
      <div className="h-[100dvh] bg-transparent flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/90 text-sm">Đang kiểm tra yêu cầu hiện tại...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col overflow-x-hidden">
      <header className="sticky top-0 z-50 px-4 py-3 lg:px-5 lg:py-4 border-b border-white/15 bg-[#0b2233]/82 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
          >
            Về trang chủ
          </button>
          <div className="text-right">
            <h1 className="text-white text-xl lg:text-2xl font-extrabold">Gửi yêu cầu</h1>
            <p className="text-white/90 text-xs lg:text-sm">Chọn vị trí chính xác để coordinator điều phối nhanh hơn</p>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full lg:grid lg:grid-cols-12">
          <section className="lg:col-span-3 overflow-y-auto overscroll-contain pb-20 lg:pb-6 border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] request-form-section" style={{ 'scrollbarWidth': 'thin', 'scrollbarColor': 'rgba(255,119,0,0.4) rgba(15,47,68,0.5)' }}>
            <div className="p-4 lg:p-3.5 space-y-4 max-w-[600px] mx-auto">
              <div className="space-y-4 pb-2">
                <p className="text-[#FFD6A6] text-xs leading-relaxed">
                  Nhập thông tin nhanh rồi chấm vị trí trên bản đồ
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      id: "Rescue" as const,
                      title: "Rescue",
                      subtitle: "Cứu hộ",
                    },
                    {
                      id: "Relief" as const,
                      title: "Relief",
                      subtitle: "Cứu trợ",
                    },
                  ].map((type) => (
                    <div
                      key={type.id}
                      onClick={() => handleRequestTypeChange(type.id)}
                      className={`cursor-pointer rounded-lg p-3 border-2 transition-all duration-200 ${requestType === type.id ?
                        "bg-[#FF7700]/20 border-[#FF7700] shadow-[0_0_12px_rgba(255,119,0,0.25)]"
                        : "bg-[#0f2f44]/70 border-white/20 hover:bg-[#1a3f57]/80 hover:border-white/30"
                        }`}
                    >
                      <div className="font-bold text-white text-sm lg:text-base">{type.title}</div>
                      <div className="text-[#FFB066] text-xs lg:text-sm">{type.subtitle}</div>
                    </div>
                  ))}
                </div>
              </div>

              {requestType === "Rescue" && (
                <div className={`${sectionCardClass} p-4 space-y-3.5 bg-[#0f2f44]/70 border border-white/20 rounded-xl`}>
                  <div className="space-y-2.5">
                    <label className="text-sm text-white font-semibold block">Tình huống</label>
                    <select
                      value={rescueRequest.dangerType}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setSelectedQuickAction(selected);
                        setRescueRequest({
                          ...rescueRequest,
                          dangerType: selected,
                          description: defaultDescriptionMap[selected] || "",
                        });
                      }}
                      className="w-full h-10 rounded-lg border border-[#89b8d4]/45 bg-[#0f2f44]/95 px-3 text-[#f3f9ff] text-sm focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]/50 hover:border-[#9ec8e0]/70"
                    >
                      <option value="">Chọn tình huống</option>
                      {quickRescueActions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-white font-semibold">Mô tả *</label>
                      <span className={`text-[11px] font-mono ${descOverLimit ? "text-red-400" : "text-gray-500"}`}>
                        {descLen}/{MAX_DESCRIPTION}
                      </span>
                    </div>
                    <textarea
                      value={rescueRequest.description}
                      onChange={(e) =>
                        setRescueRequest({
                          ...rescueRequest,
                          description: e.target.value,
                        })
                      }
                      className={`w-full min-h-[96px] rounded-lg border bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${descOverLimit ? "border-red-500 focus:ring-red-500/50" : "border-white/20 focus:border-[#FF7700] focus:ring-[#FF7700]/50"}`}
                      placeholder="Mô tả ngắn gọn tình huống..."
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                    <div className="space-y-2.5">
                      <label className="text-sm text-white font-semibold">Số người cần hỗ trợ</label>
                      <input
                        type="number"
                        min={1}
                        max={MAX_PEOPLE}
                        value={rescueRequest.numberOfPeople}
                        onChange={(e) =>
                          setRescueRequest({
                            ...rescueRequest,
                            numberOfPeople: Math.min(MAX_PEOPLE, Math.max(1, parseInt(e.target.value) || 1)),
                          })
                        }
                        className="w-full h-10 rounded-lg border border-white/20 bg-white/[0.03] px-3 text-white text-sm focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]/50 hover:border-white/30"
                      />
                    </div>

                    <label className="h-10 inline-flex items-center justify-center rounded-lg border border-dashed border-white/30 px-3 text-sm text-[#FFD1A0] cursor-pointer hover:border-[#FF7700]/80 hover:bg-[#FF7700]/10 transition-all duration-200">
                      Thêm ảnh
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={(e) => {
                          Array.from(e.target.files || []).forEach(handleImageUpload);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {uploadedImages.length > 0 && (
                    <p className="text-xs text-gray-400">Đã tải {uploadedImages.length} ảnh hiện trường</p>
                  )}

                  {uploadImageError && (
                    <p className="text-xs text-red-300">{uploadImageError}</p>
                  )}
                </div>
              )}

              {requestType === "Relief" && (
                <div className={`${sectionCardClass} p-4 space-y-3.5 bg-[#0f2f44]/70 border border-white/20 rounded-xl`}>
                  <div className="space-y-2.5">
                    <label className="text-sm text-white font-semibold block">Tình huống khu vực *</label>
                    <select
                      value={selectedReliefQuickAction || ""}
                      onChange={(e) => applyReliefQuickAction(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#89b8d4]/45 bg-[#0f2f44]/95 px-3 text-[#f3f9ff] text-sm focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]/50 hover:border-[#9ec8e0]/70"
                    >
                      <option value="">Chọn tình huống (bắt buộc)</option>
                      {quickReliefActions.map((action) => (
                        <option key={action.id} value={action.id}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm text-white font-semibold block">Số thành viên gia đình *</label>
                      <button
                        type="button"
                        onClick={() => setIsReliefComboModalOpen(true)}
                        className="rounded-lg border border-[#FF7700]/45 bg-[#FF7700]/15 px-2.5 py-1.5 text-xs font-semibold text-[#FFD1A0] hover:bg-[#FF7700]/25 transition-colors"
                      >
                        Xem combo
                      </button>
                    </div>
                    <input
                      type="number"
                      min={RELIEF_MIN_FAMILY_MEMBERS}
                      max={RELIEF_MAX_FAMILY_MEMBERS}
                      value={familyMemberCount === 0 ? "" : familyMemberCount}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue.trim() === "") {
                          setFamilyMemberCount(0);
                          return;
                        }

                        const parsed = Number.parseInt(rawValue, 10);
                        const safeValue = Number.isFinite(parsed) ? parsed : RELIEF_MIN_FAMILY_MEMBERS;
                        setFamilyMemberCount(
                          Math.max(
                            RELIEF_MIN_FAMILY_MEMBERS,
                            Math.min(RELIEF_MAX_FAMILY_MEMBERS, safeValue),
                          ),
                        );
                      }}
                      onBlur={() => {
                        if (familyMemberCount === 0) {
                          setFamilyMemberCount(RELIEF_MIN_FAMILY_MEMBERS);
                          return;
                        }

                        setFamilyMemberCount(
                          Math.max(
                            RELIEF_MIN_FAMILY_MEMBERS,
                            Math.min(RELIEF_MAX_FAMILY_MEMBERS, familyMemberCount),
                          ),
                        );
                      }}
                      className="w-full h-10 rounded-lg border border-white/20 bg-white/[0.03] px-3 text-white text-sm focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]/50 hover:border-white/30"
                    />
                    <p className="text-[11px] text-white/65">
                      Mặc định hệ thống tính toàn bộ là người trưởng thành. Hãy chọn thêm nhóm trẻ em, người già hoặc bị thương nếu có.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-sm text-white font-semibold block">Tình trạng gia đình</label>
                    <div className="space-y-2">
                      {CONTEXT_OPTIONS.map((context) => {
                        const checked = reliefContexts.includes(context);
                        const currentCount =
                          context === "Trẻ em"
                            ? reliefChildCount
                            : context === "Người già"
                              ? reliefElderlyCount
                              : reliefInjuredCount;
                        return (
                          <div
                            key={context}
                            className={`rounded-lg border px-3 py-2 transition-all duration-200 ${checked
                              ? "border-[#FF7700] bg-[#FF7700]/15"
                              : "border-white/20 bg-[#0f2f44]/70"
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => handleReliefContextToggle(context, e.target.checked)}
                                  className="h-3.5 w-3.5 accent-[#FF7700]"
                                />
                                <span className={`text-xs font-semibold ${checked ? "text-[#FFD1A0]" : "text-white"}`}>
                                  {context}
                                </span>
                              </label>

                              {checked && (
                                <input
                                  type="number"
                                  min={0}
                                  max={getMaxAssignableForContext(context)}
                                  value={currentCount === 0 ? "" : currentCount}
                                  onChange={(e) => handleReliefContextCountChange(context, e.target.value)}
                                  className="h-8 w-20 rounded-md border border-white/20 bg-[#0f2f44]/80 px-2 text-xs text-white focus:outline-none focus:border-[#FF7700]"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/20 bg-[#0f2f44]/70 p-3 space-y-1.5 text-xs">
                    <p className="text-white/80">Tổng thành viên: <span className="text-white font-semibold">{reliefFamilySize}</span></p>
                    <p className="text-white/80">Người trưởng thành tự động: <span className="text-[#FFD1A0] font-semibold">{reliefAdultCount}</span></p>
                    <p className="text-white/70">Trẻ em: {selectedChildCount} | Người già: {selectedElderlyCount} | Bị thương: {selectedInjuredCount}</p>
                    {reliefDistributionInvalid && (
                      <p className="text-red-300">Tổng các nhóm ưu tiên đang vượt quá số thành viên gia đình.</p>
                    )}
                  </div>

                  <label className="flex items-center gap-3 text-sm text-white cursor-pointer hover:text-[#FFD1A0] transition-colors">
                    <input
                      type="checkbox"
                      checked={reliefNeedMedicine}
                      onChange={(e) => setReliefNeedMedicine(e.target.checked)}
                      className="w-4 h-4 accent-[#FF7700] rounded cursor-pointer"
                    />
                    Có nhu cầu thuốc
                  </label>

                  {reliefNeedMedicine && (
                    <input
                      type="text"
                      value={reliefMedicineDetails}
                      onChange={(e) => setReliefMedicineDetails(e.target.value)}
                      placeholder="Tên thuốc cần hỗ trợ"
                      className="w-full h-10 rounded-lg border border-white/20 bg-white/[0.03] px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]/50 hover:border-white/30"
                    />
                  )}

                  <div className="rounded-lg border border-white/20 bg-[#0f2f44]/70 p-3 space-y-2">
                    <p className="text-xs text-white font-semibold">Tổng nhu cầu thiết yếu.</p>
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      {reliefSupplyPlan.totalLines.length > 0
                        ? reliefSupplyPlan.totalLines.join(", ")
                        : "Chưa có nhu cầu được tính"}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-white font-semibold">Ghi chú *</label>
                      <span className={`text-[11px] font-mono ${reliefNoteOverLimit ? "text-red-400" : "text-gray-500"}`}>
                        {reliefNoteLen}/{MAX_DESCRIPTION}
                      </span>
                    </div>
                    <textarea
                      value={reliefNote}
                      onChange={(e) => setReliefNote(e.target.value)}
                      className={`w-full min-h-[96px] rounded-lg border bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${reliefNoteOverLimit ? "border-red-500 focus:ring-red-500/50" : "border-white/20 focus:border-[#FF7700] focus:ring-[#FF7700]/50"}`}
                      placeholder="Mô tả nhu cầu cứu trợ hiện tại..."
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 pb-2">
                <button
                  onClick={requestType === "Rescue" ? handleRescueSubmit : handleReliefSubmit}
                  disabled={isSubmitting || submitDisabled}
                  className="w-full min-h-[3rem] bg-[#FF7700] hover:bg-[#FF8800] active:bg-[#FF6600] text-white font-extrabold text-base py-3 rounded-xl shadow-[0_8px_24px_rgba(255,119,0,0.32)] active:shadow-[0_4px_12px_rgba(255,119,0,0.24)] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ĐANG GỬI...
                    </>
                  ) : (
                    requestType === "Rescue" ? "GỬI YÊU CẦU CỨU HỘ" : "GỬI YÊU CẦU CỨU TRỢ"
                  )}
                </button>
              </div>
            </div>
          </section>

          <aside className="hidden lg:block lg:col-span-9 p-4 overflow-hidden">
            <div className="h-full rounded-2xl border border-white/20 bg-[#0f2f44]/70 p-3.5 flex flex-col gap-3 shadow-[0_10px_36px_rgba(0,0,0,0.2)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-xl font-bold tracking-tight">Bản đồ vị trí</h3>
                  <p className="text-white/70 text-sm">Nhấn hoặc kéo marker để chọn đúng vị trí của bạn</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="rounded-lg border border-[#FF7700]/45 bg-[#FF7700]/15 px-3 py-2 text-sm font-semibold text-[#FFD1A0] hover:bg-[#FF7700]/25 disabled:opacity-60 transition-colors"
                  >
                    {isLoadingLocation ? "Đang định vị..." : "Lấy vị trí GPS"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManualSelectionMode(!isManualSelectionMode)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 ${isManualSelectionMode
                      ? "border-[#FF7700] bg-[#FF7700]/20 text-[#FFD1A0] shadow-[0_0_8px_rgba(255,119,0,0.2)]"
                      : "border-white/20 bg-[#0f2f44]/70 text-white hover:bg-[#1a3f57]/80 hover:border-white/30"
                      }`}
                  >
                    {isManualSelectionMode ? "✓ Chọn thủ công" : "Chọn thủ công"}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/20">
                <OpenMap
                  latitude={coordinates?.lat}
                  longitude={coordinates?.lon}
                  address={currentLocation}
                  isSelectionMode={isManualSelectionMode}
                  onLocationSelect={handleManualLocationSelect}
                />
              </div>

              <div className="rounded-xl border border-white/20 bg-[#0f2f44]/70 p-3">
                <p className="text-white text-sm font-semibold truncate">{currentLocation}</p>
                {coordinates && (
                  <p className="text-white/70 text-xs mt-1 font-mono">
                    {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {isReliefComboModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-white/20 bg-[#0f2f44]/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <h3 className="text-white text-lg font-bold">Combo nhu yếu phẩm.</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReliefComboModalOpen(false)}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors"
              >
                Đóng
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(88vh-64px)] p-4 space-y-3">
              {Object.values(RELIEF_GROUP_COMBO_TEMPLATES).map((combo) => (
                <div key={combo.key} className="rounded-xl border border-white/20 bg-[#0f2f44]/70 p-3 space-y-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{combo.label}</p>
                    <p className="text-white/65 text-xs">{combo.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {combo.items.map((item) => (
                      <div key={`${combo.key}-${item.label}`} className="rounded-md border border-white/20 bg-[#0f2f44]/70 px-2.5 py-2 text-white/90">
                        {item.label}: <span className="font-semibold text-[#FFD1A0]">{item.qtyPerPerson3Days}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-[#FF7700]/35 bg-[#FF7700]/10 p-3 space-y-1.5">
                <p className="text-[#FFD1A0] text-sm font-semibold">Tổng nhu cầu theo gia đình hiện tại của bạn</p>
                <p className="text-white/80 text-xs">
                  Trưởng thành {reliefComposition.adult}, Trẻ em {reliefComposition.child}, Người già {reliefComposition.elderly}, Bị thương {reliefComposition.injured}
                </p>
                <p className="text-white text-xs leading-relaxed">
                  {reliefSupplyPlan.totalLines.length > 0
                    ? reliefSupplyPlan.totalLines.join(", ")
                    : "Chưa có dữ liệu để tính"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
