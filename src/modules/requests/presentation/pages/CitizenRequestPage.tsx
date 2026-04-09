"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { FiCheckSquare, FiChevronDown, FiChevronUp, FiMinus, FiPlus, FiSquare } from "react-icons/fi";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import { CreateRescueRequestUseCase } from "@/modules/requests/application/createRescueRequest.usecase";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { GetSuppliesUseCase } from "@/modules/supplies/application/getSupplies.usecase";
import { supplyRepository } from "@/modules/supplies/infrastructure/supply.repository.impl";
import type { Supply } from "@/modules/supplies/domain/supply.entity";
import { GetComboSuppliesUseCase } from "@/modules/supplies/application/getComboSupplies.usecase";
import type { ComboSupply, ComboSupplyItem } from "@/modules/supplies/domain/comboSupply.entity";
import { useToast } from "@/hooks/use-toast";
import { uploadClient } from "@/services/uploadClient";

// Initialize use cases with repositories
const createRescueRequestUseCase = new CreateRescueRequestUseCase(
  requestRepository,
);
const getSuppliesUseCase = new GetSuppliesUseCase(supplyRepository);
const getComboSuppliesUseCase = new GetComboSuppliesUseCase();

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

const MAX_PEOPLE = 20;
const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 500;

const CONTEXT_OPTIONS = ["Trẻ em", "Người già", "Người bị thương"];
const MEDICINE_NEED = "Thuốc";
const CONTEXT_EXTRA_SUPPLIES: Record<string, string[]> = {
  "Trẻ em": ["Sữa trẻ em", "Tã em bé"],
  "Người già": ["Thực phẩm mềm", "Đồ giữ ấm"],
  "Người bị thương": ["Băng gạc", "Thuốc sát trùng"],
};

const RELIEF_MIN_FAMILY_MEMBERS = 1;
const RELIEF_MAX_FAMILY_MEMBERS = 20;

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
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const EXCLUDED_CIVILIAN_COMBO_KEYWORDS = [
  "bo cuu ho duong thuy chuyen dung",
  "bo tim kiem cuu nan dem",
  "bo cuu ho",
  "tim kiem cuu nan",
  "den pin led",
  "den pin",
  "pin aa",
  "dao da nang",
  "ung cao su",
];

const isAllowedForCitizenRelief = (combo: ComboSupply): boolean => {
  const comboText = normalizeText(`${combo.name || ""} ${combo.description || ""}`);
  const supplyText = (combo.supplies || [])
    .map((item) => {
      if (typeof item?.supplyId === "string") return item.supplyId;
      if (item?.supplyId && typeof item.supplyId === "object") {
        const supply = item.supplyId as unknown as Record<string, unknown>;
        if (typeof supply.name === "string") return supply.name;
      }
      return "";
    })
    .join(" ");

  const compositeText = normalizeText(`${comboText} ${supplyText}`);
  return !EXCLUDED_CIVILIAN_COMBO_KEYWORDS.some((keyword) => compositeText.includes(keyword));
};

const RESCUE_AUTO_LINE_PREFIXES = ["Tình trạng ưu tiên:", "Thuốc cần yêu cầu:"];

const mergeRescueDescriptionWithAutoLines = (
  description: string,
  autoLines: string[],
): string => {
  const baseLines = description
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      return !RESCUE_AUTO_LINE_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
    });

  while (baseLines.length > 0 && baseLines[baseLines.length - 1].trim() === "") {
    baseLines.pop();
  }

  if (autoLines.length === 0) {
    return baseLines.join("\n");
  }

  return [...baseLines, ...autoLines].join("\n");
};

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

const extractComboSupplyInfo = (
  supplyRef: ComboSupplyItem["supplyId"],
  index: number,
): { name: string; supplyId?: string } => {
  if (typeof supplyRef === "string") {
    return {
      name: `Vật phẩm ${index + 1}`,
      supplyId: supplyRef,
    };
  }

  if (supplyRef && typeof supplyRef === "object") {
    const candidate = supplyRef as unknown as Record<string, unknown>;
    const name = typeof candidate.name === "string"
      ? candidate.name
      : `Vật phẩm ${index + 1}`;
    const supplyId = typeof candidate.id === "string"
      ? candidate.id
      : typeof candidate._id === "string"
        ? candidate._id
        : undefined;

    return { name, supplyId };
  }

  return {
    name: `Vật phẩm ${index + 1}`,
  };
};

const getComboItemQty = (item: unknown): number => {
  if (!item || typeof item !== "object") return 0;
  const raw = item as Record<string, unknown>;
  const qtyCandidate = raw.quantity ?? raw.qty ?? raw.requestedQty ?? raw.allocatedQty;
  const qty = Number(qtyCandidate);
  return Number.isFinite(qty) && qty > 0 ? qty : 0;
};

const getComboItemDisplayName = (item: unknown, index: number): { name: string; supplyId?: string } => {
  if (!item || typeof item !== "object") {
    return { name: `Vật phẩm ${index + 1}` };
  }

  const raw = item as Record<string, unknown>;
  const directName = typeof raw.name === "string" ? raw.name : "";
  if (directName) {
    const supplyId = typeof raw.supplyId === "string"
      ? raw.supplyId
      : typeof raw.id === "string"
        ? raw.id
        : typeof raw._id === "string"
          ? raw._id
          : undefined;
    return { name: directName, supplyId };
  }

  if (raw.supplyId !== undefined) {
    return extractComboSupplyInfo(raw.supplyId as ComboSupplyItem["supplyId"], index);
  }

  if (raw.supply && typeof raw.supply === "object") {
    const supply = raw.supply as Record<string, unknown>;
    const name = typeof supply.name === "string" ? supply.name : `Vật phẩm ${index + 1}`;
    const supplyId = typeof supply.id === "string"
      ? supply.id
      : typeof supply._id === "string"
        ? supply._id
        : undefined;
    return { name, supplyId };
  }

  return { name: `Vật phẩm ${index + 1}` };
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
  const [needRescue, setNeedRescue] = useState(false);
  const [needRelief, setNeedRelief] = useState(false);
  const [rescueRequest, setRescueRequest] = useState({
    dangerType: "",
    description: "",
    numberOfPeople: 1,
  });
  const [rescueContexts, setRescueContexts] = useState<string[]>([]);
  const [rescueNeedMedicine, setRescueNeedMedicine] = useState(false);
  const [rescueMedicineDetails, setRescueMedicineDetails] = useState("");
  const [uploadedImages, setUploadedImages] = useState<Array<{ publicId: string, secureUrl: string }>>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [reliefDangerType, setReliefDangerType] = useState("");
  const [reliefNeedMedicine, setReliefNeedMedicine] = useState(false);
  const [reliefContexts, setReliefContexts] = useState<string[]>([]);
  const [reliefFamilySize, setReliefFamilySize] = useState(1);
  const [reliefChildCount, setReliefChildCount] = useState(0);
  const [reliefElderlyCount, setReliefElderlyCount] = useState(0);
  const [reliefInjuredCount, setReliefInjuredCount] = useState(0);
  const [isReliefComboModalOpen, setIsReliefComboModalOpen] = useState(false);
  const [reliefMedicineDetails, setReliefMedicineDetails] = useState("");
  const [reliefCombos, setReliefCombos] = useState<ComboSupply[]>([]);
  const [isLoadingReliefCombos, setIsLoadingReliefCombos] = useState(false);
  const [reliefComboError, setReliefComboError] = useState<string | null>(null);
  const [selectedReliefComboId, setSelectedReliefComboId] = useState("");
  const [isScenarioPickerOpen, setIsScenarioPickerOpen] = useState(false);
  const [desktopMapHeight, setDesktopMapHeight] = useState(520);
  const [isCheckingActiveRequest, setIsCheckingActiveRequest] = useState(true);
  const [activeRequestIdOnEntry, setActiveRequestIdOnEntry] = useState<string | null>(null);
  const [availableSupplies, setAvailableSupplies] = useState<Supply[]>([]);
  const [comboSupplies, setComboSupplies] = useState<ComboSupply[]>([]);
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSupplies = async () => {
      try {
        const response = await getSuppliesUseCase.execute();
        if (active && response && Array.isArray(response.data)) {
          setAvailableSupplies(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch available supplies", error);
      }
    };
    fetchSupplies();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await getComboSuppliesUseCase.execute("Citizen");
        if (response && Array.isArray(response.data)) {
          setComboSupplies(response.data);
          if (response.data.length > 0) {
            setSelectedComboId(response.data[0]._id);
          } else {
            setSelectedComboId(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch combo supplies", error);
      }
    };

    fetchCombos();
  }, [rescueRequest.dangerType, reliefDangerType]);

  const isChildSelected = reliefContexts.includes("Trẻ em");
  const isElderlySelected = reliefContexts.includes("Người già");
  const isInjuredSelected = reliefContexts.includes("Người bị thương");

  const selectedChildCount = isChildSelected ? reliefChildCount : 0;
  const selectedElderlyCount = isElderlySelected ? reliefElderlyCount : 0;
  const selectedInjuredCount = isInjuredSelected ? reliefInjuredCount : 0;
  const sharedDangerType = rescueRequest.dangerType || reliefDangerType;

  const applySharedDangerType = useCallback((selected: string) => {
    setSelectedQuickAction(selected || null);
    setReliefDangerType(selected);
    setRescueRequest((prev) => ({
      ...prev,
      dangerType: selected,
    }));
  }, []);

  const handleSharedDangerTypeSelect = useCallback((selected: string) => {
    applySharedDangerType(selected);

    if (needRescue) {
      setRescueRequest((prev) => ({
        ...prev,
        description: defaultDescriptionMap[selected] || "",
      }));
    }

    setIsScenarioPickerOpen(false);
  }, [applySharedDangerType, needRescue]);

  const rescueAutoDetailLines = [
    rescueContexts.length > 0
      ? `Tình trạng ưu tiên: ${rescueContexts.join(", ")}`
      : "",
    rescueNeedMedicine
      ? `Thuốc cần yêu cầu: ${rescueMedicineDetails.trim() || "Có"}`
      : "",
  ].filter(Boolean);

  useEffect(() => {
    setRescueRequest((prev) => ({
      ...prev,
      description: mergeRescueDescriptionWithAutoLines(prev.description, rescueAutoDetailLines),
    }));
  }, [rescueAutoDetailLines]);

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
  const selectedReliefCombo = reliefCombos.find((combo) => combo._id === selectedReliefComboId) || null;
  const selectedReliefComboItems = selectedReliefCombo
    ? (selectedReliefCombo.supplies || [])
      .reduce<Array<{ name: string; supplyId?: string; requestedQty: number }>>((acc, rawItem, index) => {
        const qty = getComboItemQty(rawItem);
        if (qty <= 0) return acc;

        const { name, supplyId } = getComboItemDisplayName(rawItem, index);
        const normalizedName = normalizeText(name);
        const existing = acc.find((entry) => normalizeText(entry.name) === normalizedName);
        if (existing) {
          existing.requestedQty += qty;
          if (!existing.supplyId && supplyId) {
            existing.supplyId = supplyId;
          }
          return acc;
        }

        acc.push({
          name,
          supplyId,
          requestedQty: qty,
        });
        return acc;
      }, [])
    : [];
  const reliefSupplySummaryLines = selectedReliefCombo
    ? selectedReliefComboItems.map((item) => `${item.name}: ${item.requestedQty}`)
    : reliefSupplyPlan.totalLines;

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
      setNeedRescue(true);
      setNeedRelief(false);
      setSelectedQuickAction("flood");
      setRescueRequest((prev) => ({
        ...prev,
        dangerType: "flood",
        description: prev.description || defaultDescriptionMap["flood"],
        numberOfPeople: Math.max(1, prev.numberOfPeople || 1),
      }));
    } else if (typeParam === "relief") {
      setNeedRescue(false);
      setNeedRelief(true);
      setReliefFamilySize((prev) => Math.max(RELIEF_MIN_FAMILY_MEMBERS, prev || 1));
    } else if (typeParam === "report") {
      setNeedRescue(true);
      setNeedRelief(false);
      setSelectedQuickAction("landslide");
      setRescueRequest((prev) => ({
        ...prev,
        dangerType: "landslide",
        description: prev.description || defaultDescriptionMap["landslide"],
        numberOfPeople: Math.max(1, prev.numberOfPeople || 1),
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

  useEffect(() => {
    if (!rescueNeedMedicine && rescueMedicineDetails) {
      setRescueMedicineDetails("");
    }
  }, [rescueNeedMedicine, rescueMedicineDetails]);

  useEffect(() => {
    if (!reliefNeedMedicine && reliefMedicineDetails) {
      setReliefMedicineDetails("");
    }
  }, [reliefNeedMedicine, reliefMedicineDetails]);

  useEffect(() => {
    if (needRelief) {
      setReliefFamilySize((current) =>
        Math.max(
          RELIEF_MIN_FAMILY_MEMBERS,
          Math.min(RELIEF_MAX_FAMILY_MEMBERS, current || RELIEF_MIN_FAMILY_MEMBERS),
        ),
      );
      return;
    }

    setReliefFamilySize(0);
  }, [needRelief]);

  useEffect(() => {
    let cancelled = false;

    const loadReliefCombos = async () => {
      if (!needRelief) {
        setReliefCombos([]);
        setSelectedReliefComboId("");
        setReliefComboError(null);
        setIsLoadingReliefCombos(false);
        return;
      }

      setIsLoadingReliefCombos(true);
      setReliefComboError(null);

      try {
        const response = await getComboSuppliesUseCase.execute("Citizen");
        const responseData = (response as { data?: unknown })?.data;
        const rawCombos = Array.isArray(responseData)
          ? responseData
          : (responseData && typeof responseData === "object" && Array.isArray((responseData as { data?: unknown }).data)
            ? (responseData as { data: unknown[] }).data
            : []);
        const combos = rawCombos
          .filter((combo): combo is ComboSupply => !!combo && typeof combo === "object")
          .filter((combo) => combo?.isActive !== false)
          .filter(isAllowedForCitizenRelief);

        if (cancelled) return;

        setReliefCombos(combos);
        setSelectedReliefComboId((prev) => {
          if (combos.some((combo) => combo._id === prev)) {
            return prev;
          }
          return combos[0]?._id || "";
        });
      } catch (error) {
        console.error("Cannot load combo supplies:", error);
        if (!cancelled) {
          setReliefCombos([]);
          setSelectedReliefComboId("");
          setReliefComboError("Không tải được combo từ hệ thống, đang dùng chế độ tính thủ công.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingReliefCombos(false);
        }
      }
    };

    void loadReliefCombos();

    return () => {
      cancelled = true;
    };
  }, [needRelief, sharedDangerType]);

  const handleNeedRescueToggle = (checked: boolean) => {
    setNeedRescue(checked);
    setRescueRequest((prev) => ({
      ...prev,
      numberOfPeople: checked
        ? Math.max(1, prev.numberOfPeople || 1)
        : 0,
    }));

    if (!checked) {
      setRescueContexts([]);
      setRescueNeedMedicine(false);
      setRescueMedicineDetails("");
    }
  };

  const handleNeedReliefToggle = (checked: boolean) => {
    setNeedRelief(checked);
    if (checked) {
      setReliefFamilySize((prev) => Math.max(RELIEF_MIN_FAMILY_MEMBERS, prev || 1));
      if (rescueRequest.dangerType) {
        setReliefDangerType(rescueRequest.dangerType);
      }
      return;
    }

    setReliefFamilySize(0);
    setReliefContexts([]);
    setReliefChildCount(0);
    setReliefElderlyCount(0);
    setReliefInjuredCount(0);
    setReliefNeedMedicine(false);
    setReliefMedicineDetails("");
    setReliefDangerType("");
    setReliefCombos([]);
    setSelectedReliefComboId("");
    setReliefComboError(null);
  };

  const handleGoHome = useCallback(() => {
    // Use hard navigation to avoid any client-side interception from map/overlays.
    window.location.assign("/home");
  }, []);

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

  const applyBalancedReliefCounts = (nextCounts: {
    child: number;
    elderly: number;
    injured: number;
  }) => {
    let remaining = reliefFamilySize;

    const nextChild = Math.min(nextCounts.child, remaining);
    remaining -= nextChild;

    const nextElderly = Math.min(nextCounts.elderly, remaining);
    remaining -= nextElderly;

    const nextInjured = Math.min(nextCounts.injured, remaining);

    setReliefChildCount(nextChild);
    setReliefElderlyCount(nextElderly);
    setReliefInjuredCount(nextInjured);
  };

  const handleReliefContextCountChange = (context: string, rawValue: string) => {
    if (rawValue.trim() === "") {
      applyBalancedReliefCounts({
        child: context === "Trẻ em" ? 1 : reliefChildCount,
        elderly: context === "Người già" ? 1 : reliefElderlyCount,
        injured: context === "Người bị thương" ? 1 : reliefInjuredCount,
      });
      return;
    }

    const parsed = Number.parseInt(rawValue || "0", 10);
    const next = Number.isFinite(parsed) ? parsed : 0;
    const clamped = Math.max(1, Math.min(20, next));

    applyBalancedReliefCounts({
      child: context === "Trẻ em" ? clamped : reliefChildCount,
      elderly: context === "Người già" ? clamped : reliefElderlyCount,
      injured: context === "Người bị thương" ? clamped : reliefInjuredCount,
    });
  };

  const changeReliefContextCount = (context: string, delta: number) => {
    const current = context === "Trẻ em"
      ? reliefChildCount
      : context === "Người già"
        ? reliefElderlyCount
        : reliefInjuredCount;
    const base = Math.max(1, current || 1);
    const next = Math.max(1, Math.min(20, base + delta));
    handleReliefContextCountChange(context, String(next));
  };

  useEffect(() => {
    applyBalancedReliefCounts({
      child: isChildSelected ? Math.max(reliefChildCount, 1) : 0,
      elderly: isElderlySelected ? Math.max(reliefElderlyCount, 1) : 0,
      injured: isInjuredSelected ? Math.max(reliefInjuredCount, 1) : 0,
    });
  }, [
    reliefFamilySize,
    isChildSelected,
    isElderlySelected,
    isInjuredSelected,
    reliefChildCount,
    reliefElderlyCount,
    reliefInjuredCount,
  ]);

  // Xử lý submit form cứu hộ + cứu trợ nhu yếu phẩm
  const handleSubmit = async () => {
    if (!needRescue && !needRelief) {
      toast({
        variant: "destructive",
        title: "Chưa chọn nhu cầu",
        description: "Vui lòng tick ít nhất một mục: cứu hộ hoặc cứu trợ nhu yếu phẩm.",
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

    if ((needRescue || needRelief) && !sharedDangerType) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn tình huống trước khi gửi yêu cầu.",
      });
      return;
    }

    if (needRescue && !rescueRequest.description.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu mô tả",
        description: "Vui lòng mô tả tình huống trước khi gửi yêu cầu cứu hộ.",
      });
      return;
    }

    if (needRescue && rescueRequest.description.trim().length < MIN_DESCRIPTION) {
      toast({
        variant: "destructive",
        title: "Mô tả quá ngắn",
        description: `Mô tả tình huống phải có ít nhất ${MIN_DESCRIPTION} ký tự.`,
      });
      return;
    }

    if (needRescue && rescueRequest.numberOfPeople > MAX_PEOPLE) {
      toast({
        variant: "destructive",
        title: "Số người không hợp lệ",
        description: `Số người cần hỗ trợ không được vượt quá ${MAX_PEOPLE} người.`,
      });
      return;
    }

    if (
      needRelief
      && (reliefFamilySize < RELIEF_MIN_FAMILY_MEMBERS || reliefFamilySize > RELIEF_MAX_FAMILY_MEMBERS)
    ) {
      toast({
        variant: "destructive",
        title: "Số người cứu trợ không hợp lệ",
        description: `Số người cần cứu trợ phải từ ${RELIEF_MIN_FAMILY_MEMBERS} đến ${RELIEF_MAX_FAMILY_MEMBERS}.`,
      });
      return;
    }

    if (needRelief && reliefDistributionInvalid) {
      toast({
        variant: "destructive",
        title: "Phân bổ thành viên chưa hợp lệ",
        description: "Tổng trẻ em, người già và người bị thương không được vượt quá số người cần cứu trợ.",
      });
      return;
    }

    const reliefGroupChecks = [
      { selected: isChildSelected, label: "Trẻ em", count: selectedChildCount },
      { selected: isElderlySelected, label: "Người già", count: selectedElderlyCount },
      { selected: isInjuredSelected, label: "Người bị thương", count: selectedInjuredCount },
    ];

    const invalidReliefGroup = needRelief
      ? reliefGroupChecks.find(
        (group) => group.selected && (group.count <= 0 || group.count > reliefFamilySize),
      )
      : undefined;

    if (invalidReliefGroup) {
      toast({
        variant: "destructive",
        title: "Số lượng nhóm ưu tiên chưa hợp lệ",
        description: `${invalidReliefGroup.label} phải lớn hơn 0 và nhỏ hơn hoặc bằng số người cần cứu trợ (${reliefFamilySize}).`,
      });
      return;
    }

    const rescueDescription = rescueRequest.description.trim();
    const rescuePriorityLines = [
      rescueContexts.length > 0 ? `Tình trạng ưu tiên: ${rescueContexts.join(", ")}` : "",
      rescueNeedMedicine
        ? `Nhu cầu thuốc: ${rescueMedicineDetails.trim() || "Có"}`
        : "",
    ].filter(Boolean);
    const reliefDescriptionLines = needRelief
      ? [
        `Tình huống: ${quickRescueActions.find((item) => item.id === sharedDangerType)?.label || sharedDangerType}`,
        `Số người cần cứu trợ: ${reliefFamilySize}`,
        `Cơ cấu: Trưởng thành ${reliefComposition.adult}, Trẻ em ${reliefComposition.child}, Người già ${reliefComposition.elderly}, Bị thương ${reliefComposition.injured}`,
        selectedReliefCombo
          ? `Combo đã chọn: ${selectedReliefCombo.name}`
          : "Chưa chọn combo hệ thống, đang dùng ước tính nhu yếu phẩm mặc định.",
        `Nhu yếu phẩm 3 ngày: ${reliefSupplySummaryLines.join(", ")}`,
        reliefNeedMedicine && reliefMedicineDetails.trim() ? `Thuốc cần hỗ trợ: ${reliefMedicineDetails.trim()}` : "",
      ].filter(Boolean)
      : [];

    const descriptionSections: string[] = [];
    if (needRescue) {
      descriptionSections.push(`Phần cứu hộ:`);
      descriptionSections.push(...[rescueDescription, ...rescuePriorityLines]);
    }
    if (needRelief) {
      if (descriptionSections.length > 0) {
        descriptionSections.push("");
      }
      descriptionSections.push(`Phần cứu trợ nhu yếu phẩm:`);
      descriptionSections.push(...reliefDescriptionLines);
    }

    const combinedDescription = descriptionSections.join("\n");

    setIsSubmitting(true);
    try {
      const requestSupplies = needRelief
        ? selectedReliefCombo
          ? selectedReliefComboItems.map((item) => ({
            name: item.name,
            supplyId: item.supplyId,
            requestedQty: item.requestedQty,
          }))
          : reliefSupplyPlan.totalItems
            .filter((item) => (Number(item.qty) || 0) > 0)
            .map((item) => ({
              name: item.label,
              requestedQty: Number(item.qty) || 0,
            }))
        : [];

      const requestType = needRescue
        ? "Rescue"
        : "Relief";

      const payload: Record<string, unknown> = {
        type: requestType,
        incidentType: {
          flood: "Flood",
          trapped: "Trapped",
          injury: "Injured",
          landslide: "Landslide",
          other: "Other",
        }[sharedDangerType]
          ?? (sharedDangerType || "Other"),
        description: combinedDescription,
        peopleCount: needRescue ? rescueRequest.numberOfPeople : reliefFamilySize,
        location: {
          type: "Point",
          coordinates: [coordinates.lon, coordinates.lat] as [number, number],
        },
        comboSupplyId: selectedComboId,
      };

      if (needRelief) {
        payload.requestSupplies = requestSupplies;
        payload.comboSupplyId = selectedReliefCombo ? selectedReliefCombo._id : null;
      }

      if (uploadedImages.length > 0) {
        payload.media = uploadedImages.map((img) => ({
          publicId: img.publicId,
          secureUrl: img.secureUrl,
          uploadedAt: new Date(),
        }));
      }

      const createdRequest = await createRescueRequestUseCase.execute(payload as any);
      const createdRequestId = getCreatedRequestId(createdRequest);

      toast({
        title: "Yêu cầu đã được gửi! 🎉",
        description: "Hệ thống đã tiếp nhận cả thông tin cứu hộ và cứu trợ của bạn.",
      });

      if (createdRequestId) {
        router.push(`/history/${createdRequestId}`);
        return;
      }

      setRescueRequest({
        dangerType: "",
        description: "",
        numberOfPeople: 0,
      });
      setRescueContexts([]);
      setRescueNeedMedicine(false);
      setRescueMedicineDetails("");
      setNeedRescue(false);
      setNeedRelief(false);
      setReliefDangerType("");
      setReliefNeedMedicine(false);
      setReliefContexts([]);
      setReliefFamilySize(0);
      setReliefChildCount(0);
      setReliefElderlyCount(0);
      setReliefInjuredCount(0);
      setReliefMedicineDetails("");
      setReliefCombos([]);
      setSelectedReliefComboId("");
      setReliefComboError(null);
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
        "Lỗi khi gửi yêu cầu";

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

  // Hàm upload ảnh lên Cloudinary (Direct Signed Upload)
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setUploadImageError(null);
    try {
      // Upload using uploadImage to get full metadata
      const result = await uploadClient.uploadImage(
        file,
        "rescue_requests",
        {
          requestType: "combined",
        },
        false // no eager transformations for now
      );

      if (result) {
        setUploadedImages((prev) => [...prev, {
          publicId: result.public_id,
          secureUrl: result.secure_url
        }]);
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
  const descOverLimit = needRescue && descLen > MAX_DESCRIPTION;
  const submitDisabled = (!needRescue && !needRelief) || descOverLimit;
  const sectionCardClass =
    "border border-white/20 bg-[#0f2f44]/70 backdrop-blur-sm shadow-[0_10px_24px_rgba(0,0,0,0.18)]";

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
      <header className="sticky top-0 z-[200] px-4 py-3 lg:px-5 lg:py-4 border-b border-white/15 bg-[#0b2233]/82 backdrop-blur-md pointer-events-auto">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleGoHome}
            className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
          >
            Về trang chủ
          </button>
          <div className="text-right">
            <h1 className="text-white text-xl lg:text-2xl font-extrabold">Gửi yêu cầu</h1>

          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="h-full lg:grid lg:grid-cols-12">
          <section className="lg:col-span-3 overflow-visible lg:overflow-y-auto overscroll-contain pb-20 lg:pb-6 border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] request-form-section" style={{ 'scrollbarWidth': 'thin', 'scrollbarColor': 'rgba(255,119,0,0.4) rgba(15,47,68,0.5)' }}>
            <div className="p-4 lg:p-3.5 space-y-4 max-w-[600px] mx-auto">
              <div className="space-y-4 pb-2">

              </div>

              <div className="space-y-0">
                <div className={`rounded-xl border border-white/20 overflow-hidden ${isScenarioPickerOpen ? "bg-[#0f2f44]/70" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setIsScenarioPickerOpen((prev) => !prev)}
                    aria-expanded={isScenarioPickerOpen}
                    className={`relative z-10 w-full min-h-[3.25rem] border-0 px-3 py-2.5 text-left font-semibold transition-all duration-200 flex items-center justify-between gap-3 ${isScenarioPickerOpen ? "rounded-t-xl rounded-b-none bg-[#FF7700]/20 text-[#FF7700] shadow-[0_1px_0_rgba(255,119,0,0.45)]" : "rounded-xl bg-[#0f2f44]/70 text-white hover:bg-[#1a3f57]/80"}`}
                  >
                    <span className="truncate text-sm lg:text-[15px]">
                      {sharedDangerType
                        ? `Tình huống: ${quickRescueActions.find((item) => item.id === sharedDangerType)?.label || sharedDangerType}`
                        : "Chọn tình huống"}
                    </span>
                    {isScenarioPickerOpen ? (
                      <FiChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>

                  <div className={`overflow-hidden border-t border-white/20 bg-[#0f2f44]/70 rounded-b-xl rounded-t-none transition-all duration-200 ease-out ${isScenarioPickerOpen ? "max-h-[420px] opacity-100 translate-y-0 p-3.5" : "max-h-0 opacity-0 -translate-y-2 p-0 border-transparent"}`}>
                    <div className={`${isScenarioPickerOpen ? "pointer-events-auto" : "pointer-events-none"} space-y-2`}>
                      {quickRescueActions.map((item) => {
                        const active = sharedDangerType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSharedDangerTypeSelect(item.id)}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${active ? "border-[#FF7700] bg-[#FF7700]/15 text-[#FF7700]" : "border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]"}`}
                          >{item.label}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-0">
                <div className={`rounded-xl border border-white/20 overflow-hidden ${needRescue ? "bg-[#0f2f44]/70" : ""}`}>
                  <button
                    type="button"
                    onClick={() => handleNeedRescueToggle(!needRescue)}
                    aria-pressed={needRescue}
                    className={`relative z-10 w-full min-h-[3.25rem] border-0 px-3 py-2.5 text-left font-semibold transition-all duration-200 flex items-center justify-between gap-3 ${needRescue ? "rounded-t-xl rounded-b-none bg-[#FF7700]/20 text-[#FF7700] shadow-[0_1px_0_rgba(255,119,0,0.45)]" : "rounded-xl bg-[#0f2f44]/70 text-white hover:bg-[#1a3f57]/80"}`}
                  >
                    <span className="flex items-center gap-2">
                      {needRescue ? (
                        <FiCheckSquare className="h-4 w-4 shrink-0" />
                      ) : (
                        <FiSquare className="h-4 w-4 shrink-0" />
                      )}
                      <span className="text-sm lg:text-[15px]">Cần cứu hộ</span>
                    </span>
                    {needRescue ? (
                      <FiChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>

                  <div className={`overflow-hidden border-t border-white/20 bg-[#0f2f44]/70 rounded-b-xl rounded-t-none transition-all duration-200 ease-out ${needRescue ? "max-h-[1200px] opacity-100 translate-y-0 p-5" : "max-h-0 opacity-0 -translate-y-2 p-0 border-transparent"}`}>
                    <div className={`${needRescue ? "pointer-events-auto" : "pointer-events-none"} space-y-5`}>
                      {/* Tình huống */}
                      {/* Số người cần hỗ trợ + Thêm ảnh */}
                      <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                        <div className="space-y-2.5">
                          <label className="text-sm text-white font-semibold">Số người cần hỗ trợ</label>
                          <div className="h-10 grid grid-cols-3 border border-white/20 bg-white/[0.03]">
                            <button
                              type="button"
                              disabled={!needRescue || rescueRequest.numberOfPeople <= 1}
                              onClick={() => setRescueRequest((prev) => ({
                                ...prev,
                                numberOfPeople: Math.max(1, (prev.numberOfPeople || 1) - 1),
                              }))}
                              className="flex items-center justify-center border-r border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <FiMinus className="h-4 w-4" />
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              disabled={!needRescue}
                              value={needRescue ? rescueRequest.numberOfPeople : 0}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "");
                                const parsed = Number.parseInt(digits || "0", 10);
                                const next = Number.isFinite(parsed) ? parsed : 1;
                                setRescueRequest((prev) => ({
                                  ...prev,
                                  numberOfPeople: Math.max(1, Math.min(MAX_PEOPLE, next)),
                                }));
                              }}
                              className="h-full w-full border-0 bg-transparent text-center text-sm font-semibold text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={!needRescue || rescueRequest.numberOfPeople >= MAX_PEOPLE}
                              onClick={() => setRescueRequest((prev) => ({
                                ...prev,
                                numberOfPeople: Math.min(MAX_PEOPLE, (prev.numberOfPeople || 1) + 1),
                              }))}
                              className="flex items-center justify-center border-l border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <FiPlus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <label className="h-10 inline-flex items-center justify-center rounded-lg border border-dashed border-white/30 px-3 text-sm text-[#FF7700] cursor-pointer hover:border-[#FF7700]/80 hover:bg-[#FF7700]/10 transition-all duration-200">
                          Thêm ảnh
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={isUploadingImage || (!needRescue && !needRelief)}
                            onChange={(e) => {
                              Array.from(e.target.files || []).forEach(handleImageUpload);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>

                      {/* Mô tả */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-white font-semibold">Mô tả *</label>
                          <span className={`text-[11px] font-mono ${descOverLimit ? "text-red-400" : "text-gray-500"}`}>
                            {descLen}/{MAX_DESCRIPTION}
                          </span>
                        </div>
                        <textarea
                          disabled={!needRescue}
                          value={rescueRequest.description}
                          onChange={(e) => setRescueRequest({
                            ...rescueRequest,
                            description: mergeRescueDescriptionWithAutoLines(e.target.value, rescueAutoDetailLines),
                          })}
                          className={`w-full min-h-[96px] rounded-none border bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${descOverLimit ? "border-red-500 focus:ring-red-500/50" : "border-white/20 focus:border-[#FF7700] focus:ring-[#FF7700]/50"}`}
                          placeholder="Mô tả ngắn gọn tình huống..."
                        />
                      </div>

                      {/* Hiển thị thumbnail ảnh đã gửi */}
                      {uploadedImages.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs text-white font-semibold block">Ảnh đã gửi</label>
                          <div className="flex flex-wrap gap-2">
                            {uploadedImages.map((media, idx) => (
                              <div key={idx} className="w-20 h-20 rounded-none overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
                                <img
                                  src={media.secureUrl}
                                  alt={`Uploaded image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">Đã tải {uploadedImages.length} ảnh hiện trường</p>
                        </div>
                      )}

                      {uploadImageError && (
                        <p className="text-xs text-red-300">{uploadImageError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-0">
                <div className={`rounded-xl border border-white/20 overflow-hidden ${needRelief ? "bg-[#0f2f44]/70" : ""}`}>
                  <button
                    type="button"
                    onClick={() => handleNeedReliefToggle(!needRelief)}
                    aria-pressed={needRelief}
                    className={`relative z-10 w-full min-h-[3.25rem] border-0 px-3 py-2.5 text-left font-semibold transition-all duration-200 flex items-center justify-between gap-3 ${needRelief ? "rounded-t-xl rounded-b-none bg-[#FF7700]/20 text-[#FF7700] shadow-[0_1px_0_rgba(255,119,0,0.45)]" : "rounded-xl bg-[#0f2f44]/70 text-white hover:bg-[#1a3f57]/80"}`}
                  >
                    <span className="flex items-center gap-2">
                      {needRelief ? (
                        <FiCheckSquare className="h-4 w-4 shrink-0" />
                      ) : (
                        <FiSquare className="h-4 w-4 shrink-0" />
                      )}
                      <span className="text-sm lg:text-[15px]">Cần nhu yếu phẩm</span>
                    </span>
                    {needRelief ? (
                      <FiChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>

                  <div className={`overflow-hidden border-t border-white/20 bg-[#0f2f44]/70 rounded-b-xl rounded-t-none transition-all duration-200 ease-out ${needRelief ? "max-h-[1200px] opacity-100 translate-y-0 p-5" : "max-h-0 opacity-0 -translate-y-2 p-0 border-transparent"}`}>
                    <div className={`${needRelief ? "pointer-events-auto" : "pointer-events-none"} space-y-5`}>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-sm text-white font-semibold block">Chi tiết cứu trợ</label>
                          <button
                            type="button"
                            disabled={!needRelief}
                            onClick={() => setIsReliefComboModalOpen(true)}
                            className="rounded-lg border border-[#FF7700]/45 bg-[#FF7700]/15 px-2.5 py-1.5 text-xs font-semibold text-[#FF7700] hover:bg-[#FF7700]/25 transition-colors"
                          >
                            Xem combo
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-sm text-white font-semibold block">Số người cần cứu trợ</label>
                        <div className="h-10 grid grid-cols-3 border border-white/20 bg-white/[0.03]">
                          <button
                            type="button"
                            disabled={!needRelief || reliefFamilySize <= RELIEF_MIN_FAMILY_MEMBERS}
                            onClick={() => setReliefFamilySize((prev) => Math.max(RELIEF_MIN_FAMILY_MEMBERS, prev - 1))}
                            className="flex items-center justify-center border-r border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <FiMinus className="h-4 w-4" />
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            disabled={!needRelief}
                            value={needRelief ? reliefFamilySize : 0}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              const parsed = Number.parseInt(digits || "0", 10);
                              const next = Number.isFinite(parsed) ? parsed : RELIEF_MIN_FAMILY_MEMBERS;
                              setReliefFamilySize(
                                Math.max(RELIEF_MIN_FAMILY_MEMBERS, Math.min(RELIEF_MAX_FAMILY_MEMBERS, next)),
                              );
                            }}
                            className="h-full w-full border-0 bg-transparent text-center text-sm font-semibold text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={!needRelief || reliefFamilySize >= RELIEF_MAX_FAMILY_MEMBERS}
                            onClick={() => setReliefFamilySize((prev) => Math.min(RELIEF_MAX_FAMILY_MEMBERS, prev + 1))}
                            className="flex items-center justify-center border-l border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <FiPlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-none border border-white/20 bg-[#0f2f44]/70 p-3 space-y-1.5 text-xs">
                        <p className="text-white/80">Người trưởng thành: <span className="text-[#FF7700] font-semibold">{reliefAdultCount}</span></p>
                        <p className="text-white/70">Trẻ em: {selectedChildCount} | Người già: {selectedElderlyCount} | Bị thương: {selectedInjuredCount}</p>
                        {reliefDistributionInvalid && (
                          <p className="text-red-300">Tổng trẻ em, người già và người bị thương không được vượt quá số người cần cứu trợ.</p>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-sm text-white font-semibold block">Tình trạng ưu tiên</label>
                        <div className="space-y-2.5">
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
                                className={`rounded-none border px-3 py-2 transition-all duration-200 ${checked
                                  ? "border-[#FF7700] bg-[#FF7700]/15"
                                  : "border-white/20 bg-[#0f2f44]/70"
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      disabled={!needRelief}
                                      checked={checked}
                                      onChange={(e) => {
                                        const nextChecked = e.target.checked;
                                        setReliefContexts((prev) => {
                                          if (nextChecked) {
                                            if (prev.includes(context)) return prev;
                                            return [...prev, context];
                                          }
                                          return prev.filter((item) => item !== context);
                                        });

                                        if (nextChecked) {
                                          applyBalancedReliefCounts({
                                            child: context === "Trẻ em" ? Math.max(reliefChildCount, 1) : reliefChildCount,
                                            elderly: context === "Người già" ? Math.max(reliefElderlyCount, 1) : reliefElderlyCount,
                                            injured: context === "Người bị thương" ? Math.max(reliefInjuredCount, 1) : reliefInjuredCount,
                                          });
                                          return;
                                        }

                                        applyBalancedReliefCounts({
                                          child: context === "Trẻ em" ? 0 : reliefChildCount,
                                          elderly: context === "Người già" ? 0 : reliefElderlyCount,
                                          injured: context === "Người bị thương" ? 0 : reliefInjuredCount,
                                        });
                                      }}
                                      className="h-3.5 w-3.5 accent-[#FF7700]"
                                    />
                                    <span className={`text-xs font-semibold ${checked ? "text-[#FF7700]" : "text-white"}`}>{context}</span>
                                  </label>

                                  {checked && (
                                    <div className="h-8 w-24 grid grid-cols-3 border border-white/20 bg-[#0f2f44]/80">
                                      <button
                                        type="button"
                                        disabled={!needRelief || currentCount <= 1}
                                        onClick={() => changeReliefContextCount(context, -1)}
                                        className="flex items-center justify-center border-r border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        <FiMinus className="h-3 w-3" />
                                      </button>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        disabled={!needRelief}
                                        value={currentCount || 1}
                                        onChange={(e) => handleReliefContextCountChange(context, e.target.value.replace(/\D/g, ""))}
                                        className="h-full w-full border-0 bg-transparent text-center text-xs font-semibold text-white focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        disabled={!needRelief || currentCount >= 20}
                                        onClick={() => changeReliefContextCount(context, 1)}
                                        className="flex items-center justify-center border-l border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        <FiPlus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="flex items-center gap-3 text-sm text-white cursor-pointer hover:text-[#FF7700] transition-colors">
                          <input
                            type="checkbox"
                            disabled={!needRelief}
                            checked={reliefNeedMedicine}
                            onChange={(e) => setReliefNeedMedicine(e.target.checked)}
                            className="w-4 h-4 accent-[#FF7700] rounded cursor-pointer"
                          />
                          Có nhu cầu thuốc
                        </label>

                        {reliefNeedMedicine && (
                          <input
                            type="text"
                            disabled={!needRelief}
                            value={reliefMedicineDetails}
                            onChange={(e) => setReliefMedicineDetails(e.target.value)}
                            placeholder="Tên thuốc cần hỗ trợ"
                            className="w-full h-10 rounded-none border border-white/20 bg-white/[0.03] px-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#FF7700] focus:ring-1 focus:ring-[#FF7700]/50 hover:border-white/30"
                          />
                        )}
                      </div>

                      <div className="rounded-none border border-white/20 bg-[#0f2f44]/70 p-3 space-y-2">
                        <p className="text-xs text-white font-semibold">Tổng nhu cầu thiết yếu</p>
                        <p className="text-[11px] text-white/70 leading-relaxed">
                          {reliefSupplySummaryLines.length > 0
                            ? reliefSupplySummaryLines.join(", ")
                            : "Chưa có nhu cầu được tính"}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 pb-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || submitDisabled}
                  className="w-full min-h-[3rem] bg-[#FF7700] hover:bg-[#FF8800] active:bg-[#FF6600] text-white font-extrabold text-base py-3 rounded-xl shadow-[0_8px_24px_rgba(255,119,0,0.32)] active:shadow-[0_4px_12px_rgba(255,119,0,0.24)] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ĐANG GỬI...
                    </>
                  ) : (
                    "GỬI YÊU CẦU"
                  )}
                </button>
              </div>

              <div className="lg:hidden rounded-2xl border border-white/20 bg-[#0f2f44]/70 p-3 space-y-3 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-white text-sm font-bold">Mini map vị trí</h3>
                    <p className="text-white/70 text-[11px]">Chạm hoặc kéo marker để chọn đúng điểm</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManualSelectionMode(!isManualSelectionMode)}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 ${isManualSelectionMode
                      ? "border-[#FF7700] bg-[#FF7700]/20 text-[#FF7700]"
                      : "border-white/20 bg-[#0f2f44]/70 text-white"
                      }`}
                  >
                    {isManualSelectionMode ? "✓ Thủ công" : "Thủ công"}
                  </button>
                </div>

                <div className="h-[220px] rounded-xl overflow-hidden border border-white/20">
                  <OpenMap
                    latitude={coordinates?.lat}
                    longitude={coordinates?.lon}
                    address={currentLocation}
                    isSelectionMode={isManualSelectionMode}
                    onLocationSelect={handleManualLocationSelect}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-white/85 text-xs truncate">{currentLocation}</p>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="shrink-0 rounded-lg border border-[#FF7700]/45 bg-[#FF7700]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[#FF7700] hover:bg-[#FF7700]/25 disabled:opacity-60 transition-colors"
                  >
                    {isLoadingLocation ? "Đang định vị..." : "GPS"}
                  </button>
                </div>

                {coordinates && (
                  <p className="text-white/65 text-[11px] font-mono">
                    {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                  </p>
                )}
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
                    className="rounded-lg border border-[#FF7700]/45 bg-[#FF7700]/15 px-3 py-2 text-sm font-semibold text-[#FF7700] hover:bg-[#FF7700]/25 disabled:opacity-60 transition-colors"
                  >
                    {isLoadingLocation ? "Đang định vị..." : "Lấy vị trí GPS"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManualSelectionMode(!isManualSelectionMode)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-200 ${isManualSelectionMode
                      ? "border-[#FF7700] bg-[#FF7700]/20 text-[#FF7700] shadow-[0_0_8px_rgba(255,119,0,0.2)]"
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
        <div className="fixed inset-0 z-[520] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4">
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
              {reliefCombos.length > 0 ? reliefCombos.map((combo) => (
                <div key={combo._id} className="rounded-xl border border-white/20 bg-[#0f2f44]/70 p-3 space-y-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{combo.name}</p>
                    <p className="text-white/65 text-xs">{combo.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {combo.supplies.map((item, index) => {
                      const { name } = extractComboSupplyInfo(item.supplyId, index);
                      return (
                        <div key={`${combo._id}-${index}`} className="rounded-md border border-white/20 bg-[#0f2f44]/70 px-2.5 py-2 text-white/90">
                          {name}: <span className="font-semibold text-[#FF7700]">{item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-white/20 bg-[#0f2f44]/70 p-3 space-y-1.5">
                  <p className="text-white text-sm font-semibold">Chưa có combo từ hệ thống</p>
                  <p className="text-white/70 text-xs">Vui lòng chọn tình huống khác hoặc tiếp tục gửi yêu cầu với chế độ tính mặc định.</p>
                </div>
              )}

              <div className="rounded-xl border border-[#FF7700]/35 bg-[#FF7700]/10 p-3 space-y-1.5">
                <p className="text-[#FF7700] text-sm font-semibold">Tổng nhu cầu theo gia đình hiện tại của bạn</p>
                <p className="text-white/80 text-xs">
                  Trưởng thành {reliefComposition.adult}, Trẻ em {reliefComposition.child}, Người già {reliefComposition.elderly}, Bị thương {reliefComposition.injured}
                </p>
                <p className="text-white text-xs leading-relaxed">
                  {reliefSupplySummaryLines.length > 0
                    ? reliefSupplySummaryLines.join(", ")
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
