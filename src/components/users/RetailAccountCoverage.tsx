import { useRef, useCallback, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import { stadia } from "../reusable/functions";
import html2canvas from "html2canvas";
import Logo from "../../assets/logo.png";
import { ZONE_DEFAULTS } from "../reusable/zoneDefaults";
import NYC_ZIPS from "../reusable/nyc_zips.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountsData {
  firstname?: string;
  lastname?: string;
  name?: string;
  address?: {
    lat?: number | string;
    lon?: number | string;
    formatted?: string;
  };
  [key: string]: any;
}

interface RetailAccountCoverageProps {
  accountsData: AccountsData;
  setAccountsData: (data: AccountsData) => void;
  refetchAccountData: () => void;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MI_TO_M = 1609.34;

// Pull zone polygons from zone defaults
const ZONE_4 = ZONE_DEFAULTS.find((z) => z.zone_id === 4)!; // Manhattan (DBX zone)
const ZONE_7 = ZONE_DEFAULTS.find((z) => z.zone_id === 7)!; // Coverage Area (service zone)

const DBX_ZONE_LATLNGS: [number, number][] = ZONE_4.polygon.map(
  ({ lat, lon }) => [lat, lon],
);

const SERVICE_AREA_LATLNGS: [number, number][] = ZONE_7.polygon.map(
  ({ lat, lon }) => [lat, lon],
);

const circleConfigs = [
  {
    radius: 1 * MI_TO_M,
    label: "1-hour",
    sublabel: "1mi radius",
    zone: "dbx",
  },
  {
    radius: 6 * MI_TO_M,
    label: "3-hour",
    sublabel: "6mi radius",
    zone: "dbx",
  },
  {
    radius: 15 * MI_TO_M,
    label: "Same-day",
    sublabel: "15mi radius",
    zone: "service",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getZipsInIntersection(rings: [number, number][][]): string[] {
  if (rings.length === 0) return [];
  const turfPolygons = rings.map((ring) =>
    turf.polygon([ring.map(([lat, lon]) => [lon, lat])]),
  );
  const matches: string[] = [];
  for (const { zip, lat, lng } of NYC_ZIPS) {
    const pt = turf.point([lng, lat]);
    if (turfPolygons.some((poly) => turf.booleanPointInPolygon(pt, poly))) {
      matches.push(zip);
    }
  }
  return matches.sort();
}

function getCircleServiceIntersection(
  center: [number, number],
  radiusM: number,
  zone: "dbx" | "service" = "service",
): { rings: [number, number][][]; bounds: L.LatLngBounds } | null {
  const turfCircle = turf.circle([center[1], center[0]], radiusM / 1000, {
    steps: 128,
    units: "kilometers",
  });

  const zoneLatlngs = zone === "dbx" ? DBX_ZONE_LATLNGS : SERVICE_AREA_LATLNGS;
  const servicePolygon = turf.polygon([
    zoneLatlngs.map(([lat, lon]) => [lon, lat]),
  ]);

  let intersection: turf.Feature<turf.Polygon | turf.MultiPolygon> | null =
    null;
  try {
    intersection = turf.intersect(
      turf.featureCollection([turfCircle, servicePolygon]),
    );
  } catch {
    return null;
  }

  if (!intersection) return null;

  const geom = intersection.geometry;
  const rings: [number, number][][] = [];

  if (geom.type === "Polygon") {
    for (const ring of geom.coordinates) {
      rings.push(ring.map(([lon, lat]) => [lat, lon]));
    }
  } else if (geom.type === "MultiPolygon") {
    for (const poly of geom.coordinates) {
      for (const ring of poly) {
        rings.push(ring.map(([lon, lat]) => [lat, lon]));
      }
    }
  }

  if (rings.length === 0) return null;

  const bbox = turf.bbox(intersection);
  const bounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);

  return { rings, bounds };
}

// ─── MapReady ─────────────────────────────────────────────────────────────────

const MapReady = ({
  center,
  intersectionBounds,
}: {
  center: [number, number];
  intersectionBounds: L.LatLngBounds | null;
}) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let fitted = false;

    const fit = () => {
      if (fitted) return;
      fitted = true;
      ro.disconnect();
      map.invalidateSize({ animate: false });
      if (intersectionBounds) {
        map.fitBounds(intersectionBounds, { padding: [8, 8], animate: false });
      } else {
        map.setView(center, 12, { animate: false });
      }
    };

    const ro = new ResizeObserver((entries) => {
      if (entries[0].contentRect.height > 0) fit();
    });
    ro.observe(container);
    if (container.offsetHeight > 0) fit();

    return () => ro.disconnect();
  }, [map, center, intersectionBounds]);

  return null;
};

// ─── IntersectionLayer ───────────────────────────────────────────────────────

const IntersectionLayer = ({
  center,
  radiusM,
  zone,
  onIntersection,
}: {
  center: [number, number];
  radiusM: number;
  zone: "dbx" | "service";
  onIntersection: (
    bounds: L.LatLngBounds | null,
    rings: [number, number][][],
  ) => void;
}) => {
  const result = getCircleServiceIntersection(center, radiusM, zone);

  useEffect(() => {
    onIntersection(result?.bounds ?? null, result?.rings ?? []);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!result) return null;

  return (
    <>
      {result.rings.map((ring, i) => (
        <Polygon
          key={i}
          positions={ring}
          pathOptions={{
            color: "rgb(238, 182, 120)",
            fillColor: "rgb(238, 182, 120)",
            fillOpacity: 0.35,
            opacity: 0.7,
            weight: 2,
          }}
        />
      ))}
    </>
  );
};

// ─── MapCard ──────────────────────────────────────────────────────────────────

interface MapCardProps {
  center: [number, number];
  config: (typeof circleConfigs)[number];
  storeName: string;
  overlayText: string;
}

const MapCard = ({ center, config, storeName, overlayText }: MapCardProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const leafletContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [intersectionBounds, setIntersectionBounds] =
    useState<L.LatLngBounds | null>(null);
  const [zips, setZips] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleIntersection = useCallback(
    (bounds: L.LatLngBounds | null, rings: [number, number][][]) => {
      setIntersectionBounds(bounds);
      setZips(getZipsInIntersection(rings));
    },
    [],
  );

  const handleCopy = useCallback(() => {
    if (!zips.length) return;
    navigator.clipboard.writeText(zips.join(", ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [zips]);

  const handleDownload = useCallback(async () => {
    const el = wrapperRef.current;
    if (!el) return;
    setIsDownloading(true);

    try {
      await new Promise((r) => setTimeout(r, 800));

      const mapPane = (leafletContainerRef.current ?? el).querySelector(
        ".leaflet-map-pane",
      ) as HTMLElement | null;
      let savedTransform = "",
        savedLeft = "",
        savedTop = "";

      if (mapPane) {
        savedTransform = mapPane.style.transform;
        savedLeft = mapPane.style.left;
        savedTop = mapPane.style.top;

        const match = savedTransform.match(
          /translate(?:3d)?\(([^,]+),\s*([^,)]+)/,
        );
        if (match) {
          const tx = parseFloat(match[1]);
          const ty = parseFloat(match[2]);
          mapPane.style.transform = "none";
          mapPane.style.left = tx + "px";
          mapPane.style.top = ty + "px";
        }
      }

      const { width, height } = el.getBoundingClientRect();
      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        width,
        height,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      if (mapPane) {
        mapPane.style.transform = savedTransform;
        mapPane.style.left = savedLeft;
        mapPane.style.top = savedTop;
      }

      const size = Math.min(canvas.width, canvas.height);
      const ox = (canvas.width - size) / 2;
      const oy = (canvas.height - size) / 2;
      const sq = document.createElement("canvas");
      sq.width = size;
      sq.height = size;
      sq.getContext("2d")!.drawImage(
        canvas,
        ox,
        oy,
        size,
        size,
        0,
        0,
        size,
        size,
      );

      sq.toBlob((blob) => {
        if (!blob) return;
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `${storeName || "store"}-${config.label}-coverage.png`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }, "image/png");
    } catch (err) {
      console.error("Map capture failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [storeName, config.label]);

  return (
    <div className="space-y-2">
      <div
        ref={wrapperRef}
        className="rounded-xl overflow-hidden border border-gray-200 w-full aspect-square"
        style={{ position: "relative" }}
      >
        <MapContainer
          ref={(instance: any) => {
            if (instance) leafletContainerRef.current = instance.getContainer();
          }}
          style={{ height: "100%", width: "100%" }}
          center={center}
          zoom={12}
          zoomControl={false}
          scrollWheelZoom={false}
          attributionControl={false}
          preferCanvas={true}
        >
          <TileLayer
            url={`https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${stadia}`}
            crossOrigin={true}
          />
          <IntersectionLayer
            center={center}
            radiusM={config.radius}
            zone={config.zone as "dbx" | "service"}
            onIntersection={handleIntersection}
          />
          <MapReady center={center} intersectionBounds={intersectionBounds} />
        </MapContainer>

        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            right: 10,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.90)",
              borderRadius: 8,
              padding: "0 10px",
              height: 32,
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              color: "#333",
              maxWidth: "70%",
              boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 500,
            }}
          >
            {overlayText}
          </div>

          <div
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.90)",
              borderRadius: 8,
              padding: "0 8px",
              height: 32,
              display: "flex",
              alignItems: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
              flexShrink: 0,
            }}
          >
            <img
              src={Logo}
              alt="DBX Logo"
              style={{ height: 20, width: "auto", display: "block" }}
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 ${
          isDownloading
            ? "bg-themeLightGray cursor-not-allowed"
            : "bg-themeGreen hover:bg-green-600 active:scale-95"
        }`}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
            Generating...
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download {config.label} PNG
          </>
        )}
      </button>

      {zips.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 bg-white">
            <span className="text-xs font-medium text-gray-500">
              ZIP codes ({zips.length})
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-medium text-themeOrange hover:text-themeOrange-700 transition-colors"
            >
              {copied ? (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div
            className="px-3 py-2 text-xs text-gray-600 font-mono leading-relaxed cursor-text select-all"
            onClick={handleCopy}
            title="Click to copy"
          >
            {zips.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── StoreMap ─────────────────────────────────────────────────────────────────

const StoreMap = ({
  lat,
  lon,
  storeName,
}: {
  lat: number;
  lon: number;
  storeName: string;
}) => {
  const center: [number, number] = [lat, lon];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {circleConfigs.map((config) => (
        <MapCard
          key={config.label}
          center={center}
          config={config}
          storeName={storeName}
          overlayText={`${storeName} · ${config.label} (${config.sublabel})`}
        />
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RetailAccountCoverage: React.FC<RetailAccountCoverageProps> = ({
  accountsData,
}) => {
  const lat = Number(accountsData?.address?.lat);
  const lon = Number(accountsData?.address?.lon);
  const hasCoords = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;

  const storeName =
    accountsData?.name ||
    `${accountsData?.firstname || ""} ${accountsData?.lastname || ""}`.trim();

  if (!hasCoords) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center text-gray-400">
        <svg
          className="w-12 h-12 mb-4 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <p className="text-lg font-medium text-gray-500">No address on file</p>
        <p className="text-sm mt-1">
          Add an address in the General tab to generate coverage maps.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">Coverage Maps</h3>
          <p className="text-sm text-gray-500 mt-1">
            Delivery radius visualizations centered on{" "}
            <span className="font-medium text-gray-700">
              {accountsData?.address?.formatted || "store address"}
            </span>
          </p>
        </div>
      </div>

      <StoreMap lat={lat} lon={lon} storeName={storeName} />
    </div>
  );
};

export default RetailAccountCoverage;
