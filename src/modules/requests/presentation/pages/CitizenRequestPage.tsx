"use client";

import { useState, useEffect, useRef } from "react";
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

type ReliefComboTemplate = {
  id: string;
  label: string;
  peopleCount: 2 | 4 | 6;
  description: string;
  items: Array<{
    label: string;
    qty: number;
    categoryHint?: Supply["category"];
    keywords: string[];
  }>;
};

const RELIEF_COMBO_TEMPLATES: ReliefComboTemplate[] = [
  {
    id: "combo-2",
    label: "Combo 2 người",
    peopleCount: 2,
    description: "Hộ nhỏ, đủ dùng trong 2-3 ngày",
    items: [
      { label: "Nước uống", qty: 12, categoryHint: "WATER", keywords: ["nuoc", "water"] },
      { label: "Thực phẩm", qty: 6, categoryHint: "FOOD", keywords: ["thuc pham", "food", "mi", "gao"] },
      { label: "Bộ y tế cơ bản", qty: 1, categoryHint: "MEDICAL", keywords: ["y te", "medical", "thuoc", "so cuu"] },
      { label: "Chăn / áo ấm", qty: 2, categoryHint: "CLOTHING", keywords: ["chan", "ao", "quan", "clothing"] },
    ],
  },
  {
    id: "combo-4",
    label: "Combo 4 người",
    peopleCount: 4,
    description: "Gia đình trung bình, ưu tiên nước và thực phẩm",
    items: [
      { label: "Nước uống", qty: 24, categoryHint: "WATER", keywords: ["nuoc", "water"] },
      { label: "Thực phẩm", qty: 12, categoryHint: "FOOD", keywords: ["thuc pham", "food", "mi", "gao"] },
      { label: "Bộ y tế cơ bản", qty: 2, categoryHint: "MEDICAL", keywords: ["y te", "medical", "thuoc", "so cuu"] },
      { label: "Chăn / áo ấm", qty: 4, categoryHint: "CLOTHING", keywords: ["chan", "ao", "quan", "clothing"] },
    ],
  },
  {
    id: "combo-6",
    label: "Combo 6 người",
    peopleCount: 6,
    description: "Hộ đông người hoặc cụm dân cư nhỏ",
    items: [
      { label: "Nước uống", qty: 36, categoryHint: "WATER", keywords: ["nuoc", "water"] },
      { label: "Thực phẩm", qty: 18, categoryHint: "FOOD", keywords: ["thuc pham", "food", "mi", "gao"] },
      { label: "Bộ y tế cơ bản", qty: 3, categoryHint: "MEDICAL", keywords: ["y te", "medical", "thuoc", "so cuu"] },
      { label: "Chăn / áo ấm", qty: 6, categoryHint: "CLOTHING", keywords: ["chan", "ao", "quan", "clothing"] },
    ],
  },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const mapComboToRequestSupplies = (
  combo: ReliefComboTemplate,
  supplies: Supply[],
): {
  matched: Array<{ supplyId: string; requestedQty: number }>;
  missing: string[];
} => {
  const matched: Array<{ supplyId: string; requestedQty: number }> = [];
  const missing: string[] = [];

  combo.items.forEach((comboItem) => {
    const found = supplies.find((supply) => {
      const normalizedName = normalizeText(supply.name);
      const categoryOk = comboItem.categoryHint
        ? supply.category === comboItem.categoryHint
        : true;
      const keywordOk = comboItem.keywords.some((keyword) =>
        normalizedName.includes(normalizeText(keyword)),
      );
      return categoryOk && keywordOk;
    });

    if (!found) {
      missing.push(comboItem.label);
      return;
    }

    matched.push({
      supplyId: found.id,
      requestedQty: comboItem.qty,
    });
  });

  return { matched, missing };
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
  const [reliefExtraNeeds, setReliefExtraNeeds] = useState<string[]>([]);
  const [reliefMedicineDetails, setReliefMedicineDetails] = useState("");
  const [reliefNote, setReliefNote] = useState("");
  const [selectedReliefComboId, setSelectedReliefComboId] = useState<string | null>(
    null,
  );
  const [selectedReliefQuickAction, setSelectedReliefQuickAction] = useState<
    string | null
  >(null);
  const [desktopMapHeight, setDesktopMapHeight] = useState(520);

  const findActiveRequestId = async (): Promise<string | null> => {
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
  };

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

  const toggleValue = (
    value: string,
    values: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setValues((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const derivedExtraSupplies = Array.from(
    new Set(reliefContexts.flatMap((ctx) => CONTEXT_EXTRA_SUPPLIES[ctx] || [])),
  );

  const handleRequestTypeChange = (type: "Rescue" | "Relief") => {
    setRequestType(type);
    if (type === "Rescue") {
      setReliefNeedMedicine(false);
      setReliefContexts([]);
      setReliefExtraNeeds([]);
      setReliefMedicineDetails("");
      setReliefNote("");
      setSelectedReliefComboId(null);
      setSelectedReliefQuickAction(null);
    }
  };

  const applyReliefQuickAction = (actionId: string) => {
    const action = quickReliefActions.find((item) => item.id === actionId);
    if (!action) return;

    setSelectedReliefQuickAction(action.id);
    setReliefNeedMedicine(action.needs.some((need) => need === MEDICINE_NEED));
    setReliefContexts([...action.contexts]);
    setReliefExtraNeeds([]);

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
    if (!coordinates) {
      toast({
        variant: "destructive",
        title: "Chưa có vị trí GPS",
        description:
          "Không thể gửi yêu cầu khi chưa xác định được vị trí. Vui lòng bật GPS và nhấn Cập nhật.",
      });
      return;
    }

    const selectedCombo = RELIEF_COMBO_TEMPLATES.find(
      (combo) => combo.id === selectedReliefComboId,
    );
    if (!selectedCombo) {
      toast({
        variant: "destructive",
        title: "Thiếu combo cứu trợ",
        description: "Vui lòng chọn combo 2, 4 hoặc 6 người trước khi gửi.",
      });
      return;
    }

    const selectedSupplies = Array.from(
      new Set([
        ...reliefExtraNeeds,
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
    const comboLines = selectedCombo.items.map(
      (item) => `${item.label}: ${item.qty}`,
    );

    const reliefDescription = [
      selectedCondition ? `Tình trạng khu vực: ${selectedCondition.label}` : "",
      `Combo đã chọn: ${selectedCombo.label} (${selectedCombo.peopleCount} người)`,
      `Danh mục combo: ${comboLines.join(", ")}`,
      `Ghi chú: ${reliefNote.trim()}`,
      selectedSupplies.length > 0 ? `Nhu cầu bổ sung: ${selectedSupplies.join(", ")}` : "",
      reliefContexts.length > 0 ? `Gia đình có: ${reliefContexts.join(", ")}` : "",
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
        peopleCount: selectedCombo.peopleCount,
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
      setReliefExtraNeeds([]);
      setReliefMedicineDetails("");
      setReliefNote("");
      setSelectedReliefComboId(null);
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
    "rounded-2xl border border-white/15 bg-[#16384f]/65 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.15)]";

  return (
    <div className="h-[100dvh] bg-[#133249] flex flex-col overflow-hidden overscroll-none">
      <header className="sticky top-0 z-50 px-4 py-3 lg:px-5 lg:py-4 border-b border-white/15 bg-[#133249]/95 backdrop-blur-md">
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
            <p className="text-white/80 text-xs lg:text-sm">Chọn vị trí chính xác để coordinator điều phối nhanh hơn</p>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden overscroll-none">
        <div className="h-full lg:grid lg:grid-cols-12">
          <section className="lg:col-span-3 overflow-y-auto overscroll-contain pb-20 lg:pb-4 border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]">
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
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                    >
                      <div className="font-bold text-white text-sm lg:text-base">{type.title}</div>
                      <div className="text-[#FFB066] text-xs lg:text-sm">{type.subtitle}</div>
                    </div>
                  ))}
                </div>
              </div>

              {requestType === "Rescue" && (
                <div className={`${sectionCardClass} p-4 space-y-3.5 bg-white/[0.04] border border-white/10 rounded-xl`}>
                  <div className="space-y-2.5">
                    <label className="text-sm text-white font-semibold block">Tình huống</label>
                    <select
                      value={rescueRequest.dangerType}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setSelectedQuickAction(selected);
                        setRescueRequest((prev) => ({
                          ...prev,
                          dangerType: selected,
                          description: prev.description || defaultDescriptionMap[selected] || prev.description,
                        }));
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
                <div className={`${sectionCardClass} p-4 space-y-3.5 bg-white/[0.04] border border-white/10 rounded-xl`}>
                  <div className="space-y-2.5">
                    <label className="text-sm text-white font-semibold block">Tình huống khu vực</label>
                    <select
                      value={selectedReliefQuickAction || ""}
                      onChange={(e) => applyReliefQuickAction(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#89b8d4]/45 bg-[#0f2f44]/95 px-3 text-[#f3f9ff] text-sm focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]/50 hover:border-[#9ec8e0]/70"
                    >
                      <option value="">Chọn tình huống</option>
                      {quickReliefActions.map((action) => (
                        <option key={action.id} value={action.id}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-sm text-white font-semibold block">Combo hàng hóa *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {RELIEF_COMBO_TEMPLATES.map((combo) => (
                        <button
                          key={combo.id}
                          type="button"
                          onClick={() => setSelectedReliefComboId(combo.id)}
                          className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all duration-200 ${selectedReliefComboId === combo.id
                            ? "border-[#FF7700] bg-[#FF7700]/20 text-[#FFD1A0] shadow-[0_0_8px_rgba(255,119,0,0.2)]"
                            : "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"
                            }`}
                        >
                          {combo.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-sm text-white font-semibold block">Tình trạng gia đình</label>
                    <div className="grid grid-cols-3 gap-2">
                      {CONTEXT_OPTIONS.map((context) => {
                        const checked = reliefContexts.includes(context);
                        return (
                          <label
                            key={context}
                            className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold cursor-pointer transition-all duration-200 ${checked
                              ? "border-[#FF7700] bg-[#FF7700]/15 text-[#FFD1A0]"
                              : "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleValue(context, reliefContexts, setReliefContexts)}
                              className="h-3.5 w-3.5 accent-[#FF7700]"
                            />
                            <span>{context}</span>
                          </label>
                        );
                      })}
                    </div>
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

              <div className="sticky bottom-0 bg-gradient-to-t from-[#133249] via-[#133249]/98 to-transparent pt-3 pb-2 border-t border-white/10">
                <button
                  onClick={requestType === "Rescue" ? handleRescueSubmit : handleReliefSubmit}
                  disabled={isSubmitting || submitDisabled}
                  className="w-full min-h-12 bg-[#FF7700] hover:bg-[#FF8800] active:bg-[#FF6600] text-white font-extrabold text-base py-3 rounded-xl shadow-[0_8px_24px_rgba(255,119,0,0.32)] active:shadow-[0_4px_12px_rgba(255,119,0,0.24)] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          <aside className="hidden lg:block lg:col-span-9 p-4">
            <div className="h-full rounded-2xl border border-white/15 bg-[linear-gradient(145deg,rgba(0,0,0,0.22),rgba(255,255,255,0.04))] p-3.5 flex flex-col gap-3 shadow-[0_10px_36px_rgba(0,0,0,0.2)]">
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
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                      isManualSelectionMode
                        ? "border-[#FF7700] bg-[#FF7700]/20 text-[#FFD1A0] shadow-[0_0_8px_rgba(255,119,0,0.2)]"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    {isManualSelectionMode ? "✓ Chọn thủ công" : "Chọn thủ công"}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10">
                <OpenMap
                  latitude={coordinates?.lat}
                  longitude={coordinates?.lon}
                  address={currentLocation}
                  isSelectionMode={isManualSelectionMode}
                  onLocationSelect={handleManualLocationSelect}
                  height={desktopMapHeight}
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
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
    </div>
  );
}
