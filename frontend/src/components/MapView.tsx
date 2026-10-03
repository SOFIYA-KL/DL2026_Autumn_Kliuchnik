import { ComposableMap, Geographies, Geography, useMapContext } from "react-simple-maps";
import { useState } from "react";
import type { MouseEvent } from "react";
import { geoMercator } from "d3-geo";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const W = 1200;
const H = 700;
const BASE_SCALE = 180;
const MIN_SCALE = 180;
const MAX_SCALE = 900;
const BASE_CENTER: [number, number] = [0, 10];

interface Props {
  onMapClick?: (lat: number, lng: number) => void;
  disabled?: boolean;
  correctAnswer?: [number, number] | null;
  userPoint?: [number, number] | null;
}

function screenToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return pt.matrixTransform(ctm.inverse());
}

function MapPin({ pos, color = "#2563eb" }: { pos: [number, number]; color?: string }) {
  const { projection } = useMapContext();
  if (!projection) return null;
  const projected = projection([pos[1], pos[0]]);
  if (!projected) return null;
  const [cx, cy] = projected;
  const pinH = 34;
  const pinW = 26;

  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ pointerEvents: "none" }}>
      <ellipse cx={0} cy={2} rx={8} ry={3} fill="rgba(0,0,0,0.4)" />
      <path
        d={`M 0 0 C -${pinW / 2} -${pinH * 0.5} -${pinW / 2} -${pinH} 0 -${pinH} 
            C ${pinW / 2} -${pinH} ${pinW / 2} -${pinH * 0.5} 0 0 Z`}
        fill={color}
        stroke="#ffffff"
        strokeWidth={1.5}
      />
      <circle cx={0} cy={-pinH + 11} r={4.5} fill="#ffffff" />
    </g>
  );
}

function ConnectionLine({ from, to }: { from: [number, number]; to: [number, number] }) {
  const { projection } = useMapContext();
  if (!projection) return null;
  const p1 = projection([from[1], from[0]]);
  const p2 = projection([to[1], to[0]]);
  if (!p1 || !p2) return null;
  return (
    <line
      x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
      stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" opacity={0.9}
    />
  );
}

function MapContent({
  onMapClick, pos, setPos, disabled, correctAnswer, userPoint, onZoomIn,
}: {
  onMapClick?: (lat: number, lng: number) => void;
  pos: [number, number] | null;
  setPos: (p: [number, number]) => void;
  disabled?: boolean;
  correctAnswer?: [number, number] | null;
  userPoint?: [number, number] | null;
  onZoomIn: (lat: number, lng: number) => void;
}) {
  const { projection } = useMapContext();

  const getLatLng = (e: MouseEvent<SVGElement>): [number, number] | null => {
    if (!projection?.invert) return null;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return null;
    const sp = screenToSvg(svg, e.clientX, e.clientY);
    if (!sp) return null;
    const inv = projection.invert([sp.x, sp.y]);
    if (!inv || inv.length < 2) return null;
    return [inv[1], inv[0]];
  };

  const handleClick = (e: MouseEvent<SVGElement>) => {
    if (disabled) return;
    const ll = getLatLng(e);
    if (!ll) return;
    setPos(ll);
    if (onMapClick) onMapClick(ll[0], ll[1]);
  };

  const handleDoubleClick = (e: MouseEvent<SVGElement>) => {
    if (disabled) return;
    const ll = getLatLng(e);
    if (!ll) return;
    onZoomIn(ll[0], ll[1]);
  };

  return (
    <>
      <rect
        x={0} y={0} width={W} height={H} fill="transparent"
        style={{ cursor: disabled ? "default" : "crosshair" }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />

      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#c9c1a8"
              stroke="#7a7466"
              strokeWidth={0.4}
              style={{ outline: "none", cursor: disabled ? "default" : "crosshair" }}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            />
          ))
        }
      </Geographies>

      {userPoint && correctAnswer && <ConnectionLine from={userPoint} to={correctAnswer} />}
      {pos && <MapPin pos={pos} color="#2563eb" />}
      {correctAnswer && <MapPin pos={correctAnswer} color="#22c55e" />}
    </>
  );
}

export default function MapView({ onMapClick, disabled, correctAnswer, userPoint }: Props) {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [scale, setScale] = useState(BASE_SCALE);
  const [center, setCenter] = useState<[number, number]>(BASE_CENTER);

  // Двойной клик — приближаем и центрируем по точке
  const handleZoomIn = (lat: number, lng: number) => {
    const nextScale = Math.min(MAX_SCALE, scale * 2);
    if (nextScale === scale) return;
    setScale(nextScale);
    setCenter([lng, lat]);
  };

  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s * 2));
  const zoomOut = () => {
    const next = Math.max(MIN_SCALE, scale / 2);
    setScale(next);
    if (next === MIN_SCALE) setCenter(BASE_CENTER);
  };
  const resetZoom = () => {
    setScale(BASE_SCALE);
    setCenter(BASE_CENTER);
  };

  const zoomRatio = scale / BASE_SCALE;
  const isZoomed = zoomRatio > 1.05;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#0a1628",
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale, center }}
        width={W}
        height={H}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <MapContent
          onMapClick={onMapClick}
          pos={pos}
          setPos={setPos}
          disabled={disabled}
          correctAnswer={correctAnswer}
          userPoint={userPoint}
          onZoomIn={handleZoomIn}
        />
      </ComposableMap>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 10,
        }}
      >
        <ZoomBtn onClick={zoomIn}>+</ZoomBtn>
        <ZoomBtn onClick={zoomOut}>−</ZoomBtn>
        {isZoomed && <ZoomBtn onClick={resetZoom}>⌂</ZoomBtn>}
      </div>

      {isZoomed && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "4px 10px",
            background: "rgba(0,0,0,0.7)",
            color: "#94a3b8",
            fontSize: 13,
            borderRadius: 6,
            fontFamily: "monospace",
            zIndex: 10,
          }}
        >
          ×{zoomRatio.toFixed(1)}
        </div>
      )}

      {!isZoomed && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 12px",
            background: "rgba(0,0,0,0.55)",
            color: "#94a3b8",
            fontSize: 12,
            borderRadius: 6,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          💡 Двойной клик — приблизить
        </div>
      )}
    </div>
  );
}

function ZoomBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: 8,
        color: "white",
        fontSize: 18,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}