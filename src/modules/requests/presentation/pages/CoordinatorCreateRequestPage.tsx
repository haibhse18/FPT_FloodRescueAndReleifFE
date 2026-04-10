"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  PiUserBold,
  PiPhoneBold,
  PiSirenBold,
  PiMapPinBold,
  PiNotePencilBold,
  PiArrowLeftBold,
  PiMagnifyingGlassBold
} from "react-icons/pi";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckSquare,
  FiSquare,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { toast } from "sonner";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import { CreateOnBehalfUseCase } from "../../application/createOnBehalf.usecase";
import { CreateOnBehalfInput, IncidentType } from "../../domain/request.entity";
import { GetComboSuppliesUseCase } from "@/modules/supplies/application/getComboSupplies.usecase";
import type { ComboSupply, ComboSupplyItem } from "@/modules/supplies/domain/comboSupply.entity";

// Map component using OpenMapvn/MapLibre (consistency with screenshot)
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF7700] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

const INCIDENT_OPTIONS: Array<{ value: IncidentType; label: string }> = [
  { value: "Flood", label: "Ngập lụt" },
  { value: "Trapped", label: "Mắc kẹt" },
  { value: "Landslide", label: "Sạt lở" },
  { value: "Other", label: "Khác" },
];

const SCENARIO_OPTIONS: Array<{ id: string; value: IncidentType; label: string }> = [
  { id: "flood", value: "Flood", label: "Ngập lụt" },
  { id: "trapped", value: "Trapped", label: "Mắc kẹt" },
  { id: "landslide", value: "Landslide", label: "Sạt lở" },
  { id: "other", value: "Other", label: "Khác" },
];

const INCIDENT_DESCRIPTION_TEMPLATES: Record<IncidentType, string> = {
  Flood:
    "Khu vực đang ngập sâu, nước dâng nhanh, người dân khó di chuyển và cần hỗ trợ tiếp cận an toàn.",
  Trapped:
    "Người dân đang mắc kẹt tại vị trí hiện tại, không thể tự thoát ra và cần đội cứu hộ tiếp cận khẩn cấp.",
  Landslide:
    "Khu vực có nguy cơ sạt lở hoặc đã xảy ra sạt lở, đường đi bị cản trở và cần hỗ trợ sơ tán an toàn.",
  Injured:
    "Có người bị thương cần được sơ cứu hoặc hỗ trợ y tế ban đầu, vui lòng ưu tiên tiếp cận an toàn.",
  Other:
    "Tình huống khẩn cấp khác cần hỗ trợ cứu hộ. Vui lòng bổ sung chi tiết cụ thể để điều phối nhanh hơn.",
};

const createOnBehalfUseCase = new CreateOnBehalfUseCase(requestRepository);
const getComboSuppliesUseCase = new GetComboSuppliesUseCase();
const MIN_PEOPLE_COUNT = 1;
const MAX_PEOPLE_COUNT = 20;
const RELIEF_MIN_FAMILY_MEMBERS = 1;
const RELIEF_MAX_FAMILY_MEMBERS = 20;

const CONTEXT_OPTIONS = ["Trẻ em", "Người già", "Người bị thương"];
const RELIEF_CONTEXT_KEY_BY_LABEL: Record<string, "child" | "elderly" | "injured"> = {
  "Trẻ em": "child",
  "Người già": "elderly",
  "Người bị thương": "injured",
};
const RELIEF_LABEL_BY_CONTEXT_KEY: Record<"child" | "elderly" | "injured", string> = {
  child: "Trẻ em",
  elderly: "Người già",
  injured: "Người bị thương",
};

type ReliefGroupKey = "adult" | "child" | "elderly" | "injured";

type ReliefComboItemTemplate = {
  label: string;
  qtyPerPerson3Days: number;
};

type ReliefGroupComboTemplate = {
  key: ReliefGroupKey;
  label: string;
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
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 9 },
      { label: "Thực phẩm", qtyPerPerson3Days: 6 },
      { label: "Chăn / áo ấm", qtyPerPerson3Days: 1 },
    ],
  },
  child: {
    key: "child",
    label: "Combo trẻ em",
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 6 },
      { label: "Sữa trẻ em", qtyPerPerson3Days: 6 },
      { label: "Thực phẩm mềm", qtyPerPerson3Days: 6 },
      { label: "Tã em bé", qtyPerPerson3Days: 9 },
    ],
  },
  elderly: {
    key: "elderly",
    label: "Combo người già",
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 7 },
      { label: "Thực phẩm mềm", qtyPerPerson3Days: 6 },
      { label: "Đồ giữ ấm", qtyPerPerson3Days: 1 },
      { label: "Bộ y tế cơ bản", qtyPerPerson3Days: 1 },
    ],
  },
  injured: {
    key: "injured",
    label: "Combo người bị thương",
    items: [
      { label: "Nước uống", qtyPerPerson3Days: 8 },
      { label: "Thực phẩm", qtyPerPerson3Days: 6 },
      { label: "Băng gạc", qtyPerPerson3Days: 6 },
      { label: "Thuốc sát trùng", qtyPerPerson3Days: 3 },
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

const getComboRawItems = (combo: ComboSupply | null | undefined): unknown[] => {
  if (!combo || typeof combo !== "object") return [];

  const record = combo as unknown as Record<string, unknown>;
  const candidates = [record.supplies, record.items, record.requestSupplies];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const getComboItemLabel = (item: unknown, index: number): string => {
  if (!item || typeof item !== "object") {
    return `Vật phẩm ${index + 1}`;
  }

  const raw = item as Record<string, unknown>;
  const directName = [raw.name, raw.supplyName, raw.itemName, raw.label]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (directName) {
    return directName;
  }

  const supplyRef = raw.supplyId ?? raw.supply ?? raw.supplyInfo;
  if (supplyRef && typeof supplyRef === "object") {
    const supply = supplyRef as Record<string, unknown>;
    const nestedName = [supply.name, supply.supplyName, supply.title, supply.label]
      .find((value): value is string => typeof value === "string" && value.trim().length > 0);
    if (nestedName) {
      return nestedName;
    }
  }

  return `Vật phẩm ${index + 1}`;
};

const getComboItemSupplyId = (item: unknown): string | undefined => {
  if (!item || typeof item !== "object") return undefined;

  const raw = item as Record<string, unknown>;
  if (typeof raw.supplyId === "string") return raw.supplyId;
  if (typeof raw.id === "string") return raw.id;
  if (typeof raw._id === "string") return raw._id;

  if (raw.supplyId && typeof raw.supplyId === "object") {
    const supply = raw.supplyId as Record<string, unknown>;
    if (typeof supply.id === "string") return supply.id;
    if (typeof supply._id === "string") return supply._id;
  }

  if (raw.supply && typeof raw.supply === "object") {
    const supply = raw.supply as Record<string, unknown>;
    if (typeof supply.id === "string") return supply.id;
    if (typeof supply._id === "string") return supply._id;
  }

  return undefined;
};

const getComboItemQty = (item: unknown): number => {
  if (!item || typeof item !== "object") return 0;
  const raw = item as Record<string, unknown>;
  const qtyCandidate =
    raw.quantity ??
    raw.qty ??
    raw.requestedQty ??
    raw.allocatedQty ??
    raw.requestQty ??
    raw.totalQty ??
    raw.count;
  const qty = Number(qtyCandidate);
  return Number.isFinite(qty) && qty > 0 ? qty : 0;
};

const isAllowedForCitizenRelief = (combo: ComboSupply): boolean => {
  const comboText = normalizeText(`${combo.name || ""} ${combo.description || ""}`);
  const supplyText = getComboRawItems(combo)
    .map((item, index) => `${getComboItemLabel(item, index)} ${getComboItemSupplyId(item) || ""}`)
    .join(" ");

  const compositeText = normalizeText(`${comboText} ${supplyText}`);
  return !EXCLUDED_CIVILIAN_COMBO_KEYWORDS.some((keyword) => compositeText.includes(keyword));
};

const buildReliefSupplyPlan = (
  composition: ReliefHouseholdComposition,
  includeMedicine: boolean,
  medicineDetails: string,
) => {
  const totals = new Map<string, { label: string; qty: number }>();

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
    });
  };

  (Object.keys(composition) as ReliefGroupKey[]).forEach((groupKey) => {
    const count = composition[groupKey];
    if (count <= 0) return;
    const combo = RELIEF_GROUP_COMBO_TEMPLATES[groupKey];
    combo.items.forEach((item) => addItem(item, item.qtyPerPerson3Days * count));
  });

  if (includeMedicine && medicineDetails.trim()) {
    addItem(
      {
        label: `Thuốc theo chỉ định (${medicineDetails.trim()})`,
        qtyPerPerson3Days: 1,
      },
      Math.max(1, composition.injured),
    );
  }

  const totalItems = Array.from(totals.values());
  const totalLines = totalItems.map((item) => `${item.label}: ${item.qty}`);

  return {
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

const getComboItemDisplayName = (item: unknown, index: number): { name: string; supplyId?: string } => {
  return {
    name: getComboItemLabel(item, index),
    supplyId: getComboItemSupplyId(item),
  };
};

const clampPeopleCount = (value: number) =>
  Math.min(MAX_PEOPLE_COUNT, Math.max(MIN_PEOPLE_COUNT, value));

const isValidPhoneNumber = (phone: string) => {
  const normalized = phone.replace(/[\s.-]/g, "");
  return /^(\+84|0)\d{9,10}$/.test(normalized);
};

export default function CoordinatorCreateRequestPage() {
  const router = useRouter();
  const reverseGeoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incidentDropdownRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<Partial<CreateOnBehalfInput>>({
    type: "Rescue",
    incidentType: "Flood",
    peopleCount: 1,
    description: "",
    userName: "",
    phoneNumber: "",
    location: {
      type: "Point",
      coordinates: [105.7801, 21.0285], // Default Hanoii
    },
  });

  const [currentAddress, setCurrentAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScenarioPickerOpen, setIsScenarioPickerOpen] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [needRescue, setNeedRescue] = useState(true);
  const [needRelief, setNeedRelief] = useState(false);
  const [reliefContexts, setReliefContexts] = useState<string[]>([]);
  const [reliefFamilySize, setReliefFamilySize] = useState(RELIEF_MIN_FAMILY_MEMBERS);
  const [reliefChildCount, setReliefChildCount] = useState(0);
  const [reliefElderlyCount, setReliefElderlyCount] = useState(0);
  const [reliefInjuredCount, setReliefInjuredCount] = useState(0);
  const [reliefNeedMedicine, setReliefNeedMedicine] = useState(false);
  const [reliefMedicineDetails, setReliefMedicineDetails] = useState("");
  const [isReliefComboModalOpen, setIsReliefComboModalOpen] = useState(false);
  const [reliefCombos, setReliefCombos] = useState<ComboSupply[]>([]);
  const [isLoadingReliefCombos, setIsLoadingReliefCombos] = useState(false);
  const [reliefComboError, setReliefComboError] = useState<string | null>(null);
  const [selectedReliefComboId, setSelectedReliefComboId] = useState("");

  const hasRequiredIdentity =
    (formData.userName || "").trim().length > 0 &&
    (formData.phoneNumber || "").trim().length > 0;
  const canFillRequestDetails = hasRequiredIdentity;

  const selectedIncidentLabel =
    INCIDENT_OPTIONS.find((option) => option.value === formData.incidentType)?.label || "Chọn tình huống";

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

  const selectedReliefCombo = reliefCombos.find((combo) => combo._id === selectedReliefComboId) || null;
  const selectedReliefComboItems = selectedReliefCombo
    ? getComboRawItems(selectedReliefCombo)
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
    ? selectedReliefComboItems.length > 0
      ? selectedReliefComboItems.map((item) => `${item.name}: ${item.requestedQty}`)
      : ["Combo từ API chưa có vật tư hợp lệ"]
    : reliefSupplyPlan.totalLines;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!incidentDropdownRef.current) {
        return;
      }
      if (!incidentDropdownRef.current.contains(event.target as Node)) {
        setIsScenarioPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!needRelief) {
      setReliefContexts([]);
      setReliefFamilySize(RELIEF_MIN_FAMILY_MEMBERS);
      setReliefChildCount(0);
      setReliefElderlyCount(0);
      setReliefInjuredCount(0);
      setReliefNeedMedicine(false);
      setReliefMedicineDetails("");
      setReliefCombos([]);
      setSelectedReliefComboId("");
      setReliefComboError(null);
    }
  }, [needRelief]);

  useEffect(() => {
    let cancelled = false;

    const loadReliefCombos = async () => {
      if (!needRelief) {
        setIsLoadingReliefCombos(false);
        return;
      }

      setIsLoadingReliefCombos(true);
      setReliefComboError(null);
      try {
        // Load combo type "Citizen" cho relief (không phải incidentType)
        const response = await getComboSuppliesUseCase.execute("Citizen");
        const responseData = (response as { data?: unknown })?.data;
        const rawCombos = Array.isArray(responseData)
          ? responseData
          : Array.isArray((responseData as { data?: unknown })?.data)
            ? (responseData as { data: unknown[] }).data
            : Array.isArray((responseData as { items?: unknown })?.items)
              ? (responseData as { items: unknown[] }).items
              : Array.isArray(response)
                ? response
                : [];
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
        console.error("Cannot load combo supplies for coordinator form:", error);
        if (!cancelled) {
          setReliefCombos([]);
          setSelectedReliefComboId("");
          setReliefComboError("Không tải được combo cứu trợ từ hệ thống.");
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
  }, [needRelief]);

  const applyBalancedReliefCounts = (nextCounts: {
    child: number;
    elderly: number;
    injured: number;
  }) => {
    const orderedKeys: Array<"child" | "elderly" | "injured"> = ["child", "elderly", "injured"];
    let selectedKeys = orderedKeys.filter((key) => (nextCounts[key] || 0) > 0);

    if (selectedKeys.length > reliefFamilySize) {
      selectedKeys = selectedKeys.slice(0, reliefFamilySize);
      setReliefContexts(selectedKeys.map((key) => RELIEF_LABEL_BY_CONTEXT_KEY[key]));
    }

    let remaining = reliefFamilySize;
    const balanced: { child: number; elderly: number; injured: number } = {
      child: 0,
      elderly: 0,
      injured: 0,
    };

    selectedKeys.forEach((key, idx) => {
      const selectedLeft = selectedKeys.length - idx - 1;
      const minForRemaining = selectedLeft;
      const desired = Math.max(1, Math.floor(nextCounts[key] || 1));
      const maxAllowed = Math.max(1, remaining - minForRemaining);
      const assigned = Math.max(1, Math.min(desired, maxAllowed));
      balanced[key] = assigned;
      remaining -= assigned;
    });

    setReliefChildCount(balanced.child);
    setReliefElderlyCount(balanced.elderly);
    setReliefInjuredCount(balanced.injured);
  };

  const handleReliefContextCountChange = (context: string, rawValue: string) => {
    const contextKey = RELIEF_CONTEXT_KEY_BY_LABEL[context];
    if (!contextKey) return;

    if (rawValue.trim() === "") {
      const nextCounts = {
        child: reliefChildCount,
        elderly: reliefElderlyCount,
        injured: reliefInjuredCount,
      };
      nextCounts[contextKey] = 1;
      applyBalancedReliefCounts(nextCounts);
      return;
    }

    const parsed = Number.parseInt(rawValue || "0", 10);
    const next = Number.isFinite(parsed) ? parsed : 0;
    const clamped = Math.max(1, Math.min(20, next));

    const nextCounts = {
      child: reliefChildCount,
      elderly: reliefElderlyCount,
      injured: reliefInjuredCount,
    };
    nextCounts[contextKey] = clamped;
    applyBalancedReliefCounts(nextCounts);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "peopleCount" ? Number.parseInt(value) || 0 : value
    }));
  };

  const handlePeopleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === "") {
      setFormData((prev) => ({ ...prev, peopleCount: MIN_PEOPLE_COUNT }));
      return;
    }

    const parsedValue = Number.parseInt(rawValue, 10);
    setFormData((prev) => ({
      ...prev,
      peopleCount: Number.isNaN(parsedValue) ? MIN_PEOPLE_COUNT : clampPeopleCount(parsedValue),
    }));
  };

  const increasePeopleCount = () => {
    setFormData((prev) => ({
      ...prev,
      peopleCount: clampPeopleCount((prev.peopleCount ?? MIN_PEOPLE_COUNT) + 1),
    }));
  };

  const decreasePeopleCount = () => {
    setFormData((prev) => ({
      ...prev,
      peopleCount: clampPeopleCount((prev.peopleCount ?? MIN_PEOPLE_COUNT) - 1),
    }));
  };

  const handleNeedRescueToggle = (checked: boolean) => {
    setNeedRescue(checked);
    if (checked) return;

    setFormData((prev) => ({
      ...prev,
      description: "",
      peopleCount: MIN_PEOPLE_COUNT,
    }));
  };

  const handleNeedReliefToggle = (checked: boolean) => {
    setNeedRelief(checked);
    if (checked) {
      setReliefFamilySize((prev) => Math.max(RELIEF_MIN_FAMILY_MEMBERS, prev || RELIEF_MIN_FAMILY_MEMBERS));
      return;
    }

    setReliefFamilySize(RELIEF_MIN_FAMILY_MEMBERS);
    setReliefContexts([]);
    setReliefChildCount(0);
    setReliefElderlyCount(0);
    setReliefInjuredCount(0);
    setReliefNeedMedicine(false);
    setReliefMedicineDetails("");
    setReliefCombos([]);
    setSelectedReliefComboId("");
    setReliefComboError(null);
  };

  const handleManualLocationSelect = (lat: number, lon: number) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [lon, lat],
      },
    }));

    if (reverseGeoTimerRef.current) clearTimeout(reverseGeoTimerRef.current);
    reverseGeoTimerRef.current = setTimeout(() => {
      void getAddressFromCoords(lat, lon);
    }, 500);
  };

  const getAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      setCurrentAddress(address);
    } catch (error) {
      console.warn("Reverse geocode failed", error);
      setCurrentAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = addressQuery.trim();
    if (!query) {
      toast.error("Vui lòng nhập địa chỉ");
      return;
    }

    try {
      setIsAddressSearching(true);

      let result: any = null;
      const response = await fetch(`/api/goong/geocode?address=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data?.results) && data.results.length > 0) {
        result = data.results[0];
      } else {
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const fallbackData = await fallbackResponse.json();
        if (!fallbackResponse.ok || !Array.isArray(fallbackData) || fallbackData.length === 0) {
          throw new Error("Không tìm thấy địa chỉ");
        }

        result = {
          formatted_address: fallbackData[0]?.display_name,
          geometry: {
            location: {
              lat: Number(fallbackData[0]?.lat),
              lng: Number(fallbackData[0]?.lon),
            },
          },
        };
      }

      const lat = Number(result?.geometry?.location?.lat);
      const lon = Number(result?.geometry?.location?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error("Không tìm thấy tọa độ hợp lệ");
      }

      setFormData((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
      }));

      setCurrentAddress(result?.formatted_address || query);
    } catch {
      toast.error("Không tìm thấy địa chỉ. Vui lòng thử lại.");
    } finally {
      setIsAddressSearching(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userName = (formData.userName || "").trim();
    const phoneNumber = (formData.phoneNumber || "").trim();
    const description = (formData.description || "").trim();

    if (!userName) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    if (!phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    if (!needRescue && !needRelief) {
      toast.error("Vui lòng chọn ít nhất một mục: Cần cứu hộ hoặc Cần nhu yếu phẩm.");
      return;
    }

    if (needRescue && !description) {
      toast.error("Vui lòng nhập mô tả chi tiết");
      return;
    }

    if (needRelief) {
      if (
        reliefFamilySize < RELIEF_MIN_FAMILY_MEMBERS
        || reliefFamilySize > RELIEF_MAX_FAMILY_MEMBERS
      ) {
        toast.error(`Số người cần cứu trợ phải từ ${RELIEF_MIN_FAMILY_MEMBERS} đến ${RELIEF_MAX_FAMILY_MEMBERS}.`);
        return;
      }

      if (reliefDistributionInvalid) {
        toast.error("Tổng trẻ em, người già và người bị thương không được vượt quá số người cần cứu trợ.");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Tự động chọn combo theo groupKey từ reliefCombos
      const autoSelectedCombos: Array<{ comboId: string; groupKey: string; quantity: number }> = [];
      
      if (needRelief && reliefCombos.length > 0) {
        // Map số lượng người theo nhóm
        const groupCounts = [
          { key: "adult" as const, count: reliefAdultCount },
          { key: "child" as const, count: selectedChildCount },
          { key: "elderly" as const, count: selectedElderlyCount },
          { key: "injured" as const, count: selectedInjuredCount },
        ];
        
        for (const { key, count } of groupCounts) {
          if (count > 0) {
            // Tìm combo phù hợp với groupKey từ reliefCombos
            const matchedCombo = reliefCombos.find((combo) => combo.groupKey === key);
            if (matchedCombo) {
              autoSelectedCombos.push({
                comboId: matchedCombo._id,
                groupKey: key,
                quantity: count,
              });
            }
          }
        }
      }

      // Build requestCombos từ combo đã chọn
      const requestCombos = autoSelectedCombos.map(({ comboId, quantity }) => ({
        comboSupplyId: comboId,
        quantity,
      }));

      if (needRelief && requestCombos.length === 0) {
        toast.error("Chưa có combo cứu trợ hợp lệ. Vui lòng kiểm tra danh sách combo.");
        setIsSubmitting(false);
        return;
      }

      const reliefDescriptionLines = needRelief
        ? [
          "Phần cứu trợ nhu yếu phẩm:",
          `Số người cần cứu trợ: ${reliefFamilySize}`,
          `Cơ cấu: Trưởng thành ${reliefComposition.adult}, Trẻ em ${reliefComposition.child}, Người già ${reliefComposition.elderly}, Bị thương ${reliefComposition.injured}`,
          autoSelectedCombos.length > 0
            ? `Combo đã chọn: ${autoSelectedCombos.map(c => `${c.groupKey} x${c.quantity}`).join(", ")}`
            : "Chưa có combo hệ thống, dùng tính thủ công.",
          `Nhu yếu phẩm 3 ngày: ${reliefSupplySummaryLines.join(", ")}`,
          reliefNeedMedicine && reliefMedicineDetails.trim() ? `Thuốc cần hỗ trợ: ${reliefMedicineDetails.trim()}` : "",
        ].filter(Boolean)
        : [];

      const descriptionSections: string[] = [];
      if (needRescue) {
        descriptionSections.push("Phần cứu hộ:");
        descriptionSections.push(description);
      }
      if (needRelief) {
        if (descriptionSections.length > 0) {
          descriptionSections.push("");
        }
        descriptionSections.push(...reliefDescriptionLines);
      }

      const fullDescription = descriptionSections.join("\n");

      // Explicitly construct payload - hardcode type = "Rescue" cho mọi request
      const payload: CreateOnBehalfInput = {
        type: "Rescue",
        incidentType: (formData.incidentType as any) || "Flood",
        priority: "Normal",
        peopleCount: needRescue
          ? clampPeopleCount(Number(formData.peopleCount) || MIN_PEOPLE_COUNT)
          : needRelief
            ? Math.max(RELIEF_MIN_FAMILY_MEMBERS, Math.min(RELIEF_MAX_FAMILY_MEMBERS, reliefFamilySize))
            : MIN_PEOPLE_COUNT,
        description: fullDescription,
        userName,
        phoneNumber,
        location: {
          type: "Point",
          coordinates: formData.location?.coordinates || [105.7801, 21.0285]
        },
        // Chỉ gửi requestCombos, BE sẽ tự tính requestSupplies từ combo data
        requestCombos: needRelief ? requestCombos : undefined,
      };

      await createOnBehalfUseCase.execute(payload);
      toast.success("Tạo yêu cầu thành công!");
      router.push("/requests");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Lỗi khi tạo yêu cầu";
      toast.error(errorMsg);
      console.error("Create on behalf error:", err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#133249]">
      {/* Header */}
      <header className="flex-shrink-0 z-30 px-6 py-4 border-b border-white/10 bg-[#0d1e2c]/80 backdrop-blur-md">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition font-bold"
          >
            <PiArrowLeftBold /> Quay lại
          </button>
          <h1 className="text-white text-2xl font-black uppercase tracking-widest">
            Tạo yêu cầu
          </h1>
          <div className="w-[120px]"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full p-4 lg:p-6 gap-6">

        {/* Left Section: Form */}
        <section className="w-full lg:w-[360px] xl:w-[420px] flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Citizen Identity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-[#FF7700] text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <PiUserBold className="text-lg" /> Thông tin Citizen
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 mb-1 block">Họ và tên</label>
                  <div className="relative">
                    <PiUserBold className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Nhập tên người cần cứu trợ"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#FF7700] outline-none transition"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Số điện thoại</label>
                  <div className="relative">
                    <PiPhoneBold className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Số điện thoại liên lạc"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#FF7700] outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Request Type */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-[#FF7700] text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <PiSirenBold className="text-lg" /> Chi tiết yêu cầu
              </h2>

              <div className="space-y-3">
                <div
                  className={`rounded-xl border border-white/20 overflow-hidden ${isScenarioPickerOpen ? "bg-[#0f2f44]/70" : "bg-[#0f2f44]/55"}`}
                  ref={incidentDropdownRef}
                >
                  <button
                    type="button"
                    disabled={!canFillRequestDetails}
                    onClick={() => setIsScenarioPickerOpen((prev) => !prev)}
                    aria-expanded={isScenarioPickerOpen}
                    className={`relative z-10 w-full min-h-[3.25rem] border-0 px-3 py-2.5 text-left font-semibold transition-all duration-200 flex items-center justify-between gap-3 ${isScenarioPickerOpen ? "rounded-t-xl rounded-b-none bg-[#FF7700]/20 text-[#FF7700] shadow-[0_1px_0_rgba(255,119,0,0.45)]" : "rounded-xl bg-[#0f2f44]/70 text-white hover:bg-[#1a3f57]/80"} ${!canFillRequestDetails ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="truncate text-sm lg:text-[15px]">
                      Tình huống: {selectedIncidentLabel}
                    </span>
                    {isScenarioPickerOpen ? (
                      <FiChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>

                  <div className={`overflow-hidden border-t border-white/20 bg-[#0f2f44]/70 rounded-b-xl rounded-t-none transition-all duration-200 ease-out ${isScenarioPickerOpen ? "max-h-[420px] opacity-100 translate-y-0 p-3.5" : "max-h-0 opacity-0 -translate-y-2 p-0 border-transparent"}`}>
                    <div className={`${isScenarioPickerOpen ? "pointer-events-auto" : "pointer-events-none"} space-y-2`}>
                      {SCENARIO_OPTIONS.map((option) => {
                        const isActive = formData.incidentType === option.value;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                incidentType: option.value,
                                description: INCIDENT_DESCRIPTION_TEMPLATES[option.value] || prev.description,
                              }));
                              setIsScenarioPickerOpen(false);
                            }}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${isActive ? "border-[#FF7700] bg-[#FF7700]/15 text-[#FF7700]" : "border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]"}`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`rounded-xl border border-white/20 overflow-hidden ${needRescue ? "bg-[#0f2f44]/70" : "bg-[#0f2f44]/55"}`}>
                    <button
                      type="button"
                      disabled={!canFillRequestDetails}
                      onClick={() => handleNeedRescueToggle(!needRescue)}
                      aria-pressed={needRescue}
                      className={`w-full rounded-xl border-0 px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-between gap-2 ${needRescue
                        ? "bg-[#FF7700]/20 text-[#FF7700]"
                        : "bg-[#0f2f44]/70 text-white hover:bg-[#1a3f57]/80"
                        } ${!canFillRequestDetails ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {needRescue ? <FiCheckSquare className="h-4 w-4" /> : <FiSquare className="h-4 w-4" />}
                        Cần cứu hộ
                      </span>
                      {needRescue ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className={`rounded-xl border border-white/20 overflow-hidden ${needRelief ? "bg-[#0f2f44]/70" : "bg-[#0f2f44]/55"}`}>
                    <button
                      type="button"
                      disabled={!canFillRequestDetails}
                      onClick={() => handleNeedReliefToggle(!needRelief)}
                      aria-pressed={needRelief}
                      className={`w-full rounded-xl border-0 px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-between gap-2 ${needRelief
                        ? "bg-[#FF7700]/20 text-[#FF7700]"
                        : "bg-[#0f2f44]/70 text-white hover:bg-[#1a3f57]/80"
                        } ${!canFillRequestDetails ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {needRelief ? <FiCheckSquare className="h-4 w-4" /> : <FiSquare className="h-4 w-4" />}
                        Cần nhu yếu phẩm
                      </span>
                      {needRelief ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!canFillRequestDetails && (
                  <p className="text-xs text-white/70">Vui lòng nhập đầy đủ Họ và tên, Số điện thoại để mở phần Chi tiết yêu cầu.</p>
                )}

              </div>

              {needRescue && (
                <div className="space-y-4 border-t border-white/10 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Số người cứu hộ</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={decreasePeopleCount}
                        disabled={!canFillRequestDetails || (formData.peopleCount ?? MIN_PEOPLE_COUNT) <= MIN_PEOPLE_COUNT}
                        className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 text-white text-xl font-bold hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        aria-label="Giảm số người"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        name="peopleCount"
                        value={formData.peopleCount ?? MIN_PEOPLE_COUNT}
                        onChange={handlePeopleCountChange}
                        min={MIN_PEOPLE_COUNT}
                        max={MAX_PEOPLE_COUNT}
                        step={1}
                        inputMode="numeric"
                        disabled={!canFillRequestDetails}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white outline-none focus:border-[#FF7700] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={increasePeopleCount}
                        disabled={!canFillRequestDetails || (formData.peopleCount ?? MIN_PEOPLE_COUNT) >= MAX_PEOPLE_COUNT}
                        className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 text-white text-xl font-bold hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        aria-label="Tăng số người"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Mô tả cứu hộ</label>
                    <div className="relative">
                      <PiNotePencilBold className="absolute left-4 top-4 text-gray-400" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        disabled={!canFillRequestDetails}
                        placeholder="Mô tả cụ thể tình hình của người dân..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:border-[#FF7700] transition"
                        required={needRescue}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4 space-y-4">
                {needRelief && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Số người cần cứu trợ</label>
                      <button
                        type="button"
                        disabled={!canFillRequestDetails}
                        onClick={() => setIsReliefComboModalOpen(true)}
                        className="rounded-lg border border-[#FF7700]/45 bg-[#FF7700]/15 px-2.5 py-1.5 text-xs font-semibold text-[#FF7700] hover:bg-[#FF7700]/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Xem combo
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReliefFamilySize((prev) => Math.max(RELIEF_MIN_FAMILY_MEMBERS, prev - 1))}
                        disabled={!canFillRequestDetails || reliefFamilySize <= RELIEF_MIN_FAMILY_MEMBERS}
                        className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 text-white text-xl font-bold hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={reliefFamilySize}
                        onChange={(e) => {
                          const parsed = Number.parseInt(e.target.value || "0", 10);
                          const next = Number.isFinite(parsed) ? parsed : RELIEF_MIN_FAMILY_MEMBERS;
                          setReliefFamilySize(
                            Math.max(RELIEF_MIN_FAMILY_MEMBERS, Math.min(RELIEF_MAX_FAMILY_MEMBERS, next)),
                          );
                        }}
                        disabled={!canFillRequestDetails}
                        min={RELIEF_MIN_FAMILY_MEMBERS}
                        max={RELIEF_MAX_FAMILY_MEMBERS}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white outline-none focus:border-[#FF7700]"
                      />
                      <button
                        type="button"
                        onClick={() => setReliefFamilySize((prev) => Math.min(RELIEF_MAX_FAMILY_MEMBERS, prev + 1))}
                        disabled={!canFillRequestDetails || reliefFamilySize >= RELIEF_MAX_FAMILY_MEMBERS}
                        className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 text-white text-xl font-bold hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        +
                      </button>
                    </div>

                    <div className="rounded-xl border border-white/15 bg-[#0d1e2c]/70 p-3 space-y-1 text-xs">
                      <p className="text-white/85">Người trưởng thành: <span className="text-[#FF7700] font-semibold">{reliefAdultCount}</span></p>
                      <p className="text-white/75">Trẻ em: {selectedChildCount} | Người già: {selectedElderlyCount} | Bị thương: {selectedInjuredCount}</p>
                      {reliefDistributionInvalid && (
                        <p className="text-red-300">Tổng trẻ em, người già và người bị thương không được vượt quá số người cần cứu trợ.</p>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 block">Tình trạng ưu tiên</label>
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
                              className={`rounded-xl border px-3 py-2 ${checked
                                ? "border-[#FF7700]/60 bg-[#FF7700]/10"
                                : "border-white/10 bg-white/[0.02]"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <label className="inline-flex items-center gap-2 text-sm text-white cursor-pointer">
                                  <input
                                    type="checkbox"
                                    disabled={!canFillRequestDetails}
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
                                    className="h-4 w-4 accent-[#FF7700]"
                                  />
                                  <span>{context}</span>
                                </label>

                                {checked && (
                                  <div className="h-8 w-24 grid grid-cols-3 border border-white/20 bg-[#0f2f44]/80 rounded-md overflow-hidden">
                                    <button
                                      type="button"
                                      disabled={!canFillRequestDetails || currentCount <= 1}
                                      onClick={() => changeReliefContextCount(context, -1)}
                                      className="flex items-center justify-center border-r border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      disabled={!canFillRequestDetails}
                                      value={currentCount || 1}
                                      onChange={(e) => handleReliefContextCountChange(context, e.target.value.replace(/\D/g, ""))}
                                      className="h-full w-full border-0 bg-transparent text-center text-xs font-semibold text-white focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      disabled={!canFillRequestDetails || currentCount >= 20}
                                      onClick={() => changeReliefContextCount(context, 1)}
                                      className="flex items-center justify-center border-l border-white/20 text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!canFillRequestDetails}
                          checked={reliefNeedMedicine}
                          onChange={(e) => setReliefNeedMedicine(e.target.checked)}
                          className="h-4 w-4 accent-[#FF7700]"
                        />
                        Có nhu cầu thuốc
                      </label>
                      {reliefNeedMedicine && (
                        <input
                          type="text"
                          disabled={!canFillRequestDetails}
                          value={reliefMedicineDetails}
                          onChange={(e) => setReliefMedicineDetails(e.target.value)}
                          placeholder="Tên thuốc cần hỗ trợ"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#FF7700]"
                        />
                      )}
                    </div>

                    {reliefComboError && (
                      <p className="text-amber-300 text-xs">{reliefComboError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#FF7700] hover:bg-[#FF8820] text-white font-black text-lg uppercase tracking-widest transition-all shadow-lg shadow-[#FF7700]/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận tạo yêu cầu"}
            </button>
          </form>
        </section>

        {/* Right Section: Map (Fills remaining) */}
        <section className="flex-1 min-w-0 flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative">

          <OpenMap
            latitude={formData.location?.coordinates[1]}
            longitude={formData.location?.coordinates[0]}
            onLocationSelect={hasRequiredIdentity ? handleManualLocationSelect : undefined}
            isSelectionMode={true}
            address={currentAddress}
          />

          {!hasRequiredIdentity && (
            <div className="absolute inset-0 z-10 bg-[#0d1e2c]/45 backdrop-blur-[1px] flex items-center justify-center px-6 text-center pointer-events-auto">
              <p className="text-white/90 text-sm font-semibold max-w-sm">
                Vui lòng nhập đầy đủ Họ và tên, Số điện thoại trước khi chọn vị trí và nhập thông tin yêu cầu.
              </p>
            </div>
          )}

          {/* Map Footer Bar (Address Area) */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0d1e2c]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF7700]/10 flex items-center justify-center text-[#FF7700] text-xl border border-[#FF7700]/20 flex-shrink-0">
              <PiMapPinBold />
            </div>
            <form onSubmit={handleSearchAddress} className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-gray-300 uppercase ml-1 mb-1 block">
                Nhập địa chỉ để định vị
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  disabled={!hasRequiredIdentity}
                  placeholder="Ví dụ: 123 Lê Lợi, Quận 1, TP.HCM"
                  className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-[#FF7700]"
                />
                <button
                  type="submit"
                  disabled={!hasRequiredIdentity || isAddressSearching}
                  className="p-2.5 rounded-xl bg-[#FF7700] hover:bg-[#FF8820] text-white transition disabled:opacity-60"
                  aria-label="Tìm địa chỉ"
                >
                  <PiMagnifyingGlassBold className="text-lg" />
                </button>
              </div>
              {currentAddress ? (
                <>
                  <p className="text-white text-xs font-semibold truncate mt-1.5">{currentAddress}</p>
                  <p className="text-gray-500 text-[10px] font-mono mt-0.5">
                    {formData.location?.coordinates[1].toFixed(6)}, {formData.location?.coordinates[0].toFixed(6)}
                  </p>
                </>
              ) : null}
            </form>
          </div>
        </section>

      </main>

      {isReliefComboModalOpen && (
        <div className="fixed inset-0 z-[520] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-white/20 bg-[#0f2f44]/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <h3 className="text-white text-lg font-bold">Combo nhu yếu phẩm</h3>
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
                    {getComboRawItems(combo).map((item, index) => {
                      const name = getComboItemLabel(item, index);
                      const qty = getComboItemQty(item);
                      return (
                        <div key={`${combo._id}-${index}`} className="rounded-md border border-white/20 bg-[#0f2f44]/70 px-2.5 py-2 text-white/90">
                          {name}: <span className="font-semibold text-[#FF7700]">{qty > 0 ? qty : "-"}</span>
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

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
