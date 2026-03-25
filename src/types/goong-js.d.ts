declare module "@goongmaps/goong-js" {
  export interface MapOptions {
    container: string | HTMLElement;
    style: string;
    center?: [number, number];
    zoom?: number;
    bearing?: number;
    pitch?: number;
    minZoom?: number;
    maxZoom?: number;
    interactive?: boolean;
    attributionControl?: boolean;
    customAttribution?: string | string[];
    logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    failIfMajorPerformanceCaveat?: boolean;
    preserveDrawingBuffer?: boolean;
    antialias?: boolean;
    refreshExpiredTiles?: boolean;
    maxBounds?: LngLatBoundsLike;
    scrollZoom?: boolean;
    boxZoom?: boolean;
    dragRotate?: boolean;
    dragPan?: boolean;
    keyboard?: boolean;
    doubleClickZoom?: boolean;
    touchZoomRotate?: boolean;
    trackResize?: boolean;
    renderWorldCopies?: boolean;
    maxTileCacheSize?: number;
    transformRequest?: (url: string, resourceType: string) => { url: string };
    locale?: any;
    accessToken?: string;
  }

  export type LngLatLike = [number, number] | { lng: number; lat: number } | { lon: number; lat: number };
  export type LngLatBoundsLike = [[number, number], [number, number]] | [LngLatLike, LngLatLike];

  export class LngLat {
    constructor(lng: number, lat: number);
    lng: number;
    lat: number;
    wrap(): LngLat;
    toArray(): [number, number];
    toString(): string;
    distanceTo(lngLat: LngLat): number;
    static convert(input: LngLatLike): LngLat;
  }

  export class LngLatBounds {
    constructor(sw?: LngLatLike, ne?: LngLatLike);
    setNorthEast(ne: LngLatLike): this;
    setSouthWest(sw: LngLatLike): this;
    extend(obj: LngLatLike | LngLatBoundsLike): this;
    getCenter(): LngLat;
    getSouthWest(): LngLat;
    getNorthEast(): LngLat;
    getNorthWest(): LngLat;
    getSouthEast(): LngLat;
    getWest(): number;
    getSouth(): number;
    getEast(): number;
    getNorth(): number;
    toArray(): [[number, number], [number, number]];
    toString(): string;
    isEmpty(): boolean;
    contains(lnglat: LngLatLike): boolean;
    static convert(input: LngLatBoundsLike): LngLatBounds;
  }

  export interface MarkerOptions {
    element?: HTMLElement;
    anchor?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    offset?: [number, number];
    color?: string;
    draggable?: boolean;
    rotation?: number;
    rotationAlignment?: "map" | "viewport" | "auto";
    pitchAlignment?: "map" | "viewport" | "auto";
  }

  export class Marker {
    constructor(options?: MarkerOptions);
    addTo(map: Map): this;
    remove(): this;
    getLngLat(): LngLat;
    setLngLat(lnglat: LngLatLike): this;
    getElement(): HTMLElement;
    setPopup(popup: Popup): this;
    getPopup(): Popup;
    togglePopup(): this;
    getOffset(): [number, number];
    setOffset(offset: [number, number]): this;
    setDraggable(draggable: boolean): this;
    isDraggable(): boolean;
    setRotation(rotation: number): this;
    getRotation(): number;
    setRotationAlignment(alignment: "map" | "viewport" | "auto"): this;
    getRotationAlignment(): "map" | "viewport" | "auto";
    setPitchAlignment(alignment: "map" | "viewport" | "auto"): this;
    getPitchAlignment(): "map" | "viewport" | "auto";
  }

  export interface PopupOptions {
    closeButton?: boolean;
    closeOnClick?: boolean;
    closeOnMove?: boolean;
    anchor?: "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
    offset?: number | [number, number] | { [key: string]: [number, number] };
    className?: string;
    maxWidth?: string;
  }

  export class Popup {
    constructor(options?: PopupOptions);
    addTo(map: Map): this;
    isOpen(): boolean;
    remove(): this;
    getLngLat(): LngLat;
    setLngLat(lnglat: LngLatLike): this;
    setText(text: string): this;
    setHTML(html: string): this;
    setDOMContent(htmlNode: Node): this;
    getElement(): HTMLElement;
    setMaxWidth(maxWidth: string): this;
    addClassName(className: string): this;
    removeClassName(className: string): this;
    toggleClassName(className: string): this;
  }

  export interface FitBoundsOptions {
    padding?: number | { top: number; bottom: number; left: number; right: number };
    linear?: boolean;
    easing?: (t: number) => number;
    offset?: [number, number];
    maxZoom?: number;
    duration?: number;
  }

  export interface FlyToOptions {
    center?: LngLatLike;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    around?: LngLatLike;
    duration?: number;
    easing?: (t: number) => number;
    offset?: [number, number];
    animate?: boolean;
    essential?: boolean;
    curve?: number;
    minZoom?: number;
    speed?: number;
    screenSpeed?: number;
    maxDuration?: number;
  }

  export class NavigationControl {
    constructor(options?: { showCompass?: boolean; showZoom?: boolean; visualizePitch?: boolean });
  }

  export class GeolocateControl {
    constructor(options?: {
      positionOptions?: PositionOptions;
      fitBoundsOptions?: FitBoundsOptions;
      trackUserLocation?: boolean;
      showAccuracyCircle?: boolean;
      showUserLocation?: boolean;
    });
    trigger(): boolean;
  }

  export class ScaleControl {
    constructor(options?: { maxWidth?: number; unit?: "imperial" | "metric" | "nautical" });
  }

  export class FullscreenControl {
    constructor(options?: { container?: HTMLElement });
  }

  export class Map {
    constructor(options: MapOptions);
    
    // Map methods
    addControl(control: any, position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"): this;
    removeControl(control: any): this;
    resize(): this;
    getBounds(): LngLatBounds;
    getMaxBounds(): LngLatBounds | null;
    setMaxBounds(bounds: LngLatBoundsLike): this;
    setMinZoom(minZoom: number): this;
    getMinZoom(): number;
    setMaxZoom(maxZoom: number): this;
    getMaxZoom(): number;
    setMinPitch(minPitch: number): this;
    getMinPitch(): number;
    setMaxPitch(maxPitch: number): this;
    getMaxPitch(): number;
    getRenderWorldCopies(): boolean;
    setRenderWorldCopies(renderWorldCopies: boolean): this;
    project(lnglat: LngLatLike): { x: number; y: number };
    unproject(point: [number, number]): LngLat;
    isMoving(): boolean;
    isZooming(): boolean;
    isRotating(): boolean;
    
    // Camera methods
    getCenter(): LngLat;
    setCenter(center: LngLatLike): this;
    panBy(offset: [number, number], options?: any): this;
    panTo(lnglat: LngLatLike, options?: any): this;
    getZoom(): number;
    setZoom(zoom: number): this;
    zoomTo(zoom: number, options?: any): this;
    zoomIn(options?: any): this;
    zoomOut(options?: any): this;
    getBearing(): number;
    setBearing(bearing: number): this;
    getPitch(): number;
    setPitch(pitch: number): this;
    cameraForBounds(bounds: LngLatBoundsLike, options?: FitBoundsOptions): any;
    fitBounds(bounds: LngLatBoundsLike, options?: FitBoundsOptions): this;
    fitScreenCoordinates(p0: [number, number], p1: [number, number], bearing: number, options?: any): this;
    jumpTo(options: any): this;
    easeTo(options: any): this;
    flyTo(options: FlyToOptions): this;
    stop(): this;
    
    // Event methods
    on(type: string, listener: (ev: any) => void): this;
    once(type: string, listener: (ev: any) => void): this;
    off(type: string, listener: (ev: any) => void): this;
    
    // Lifecycle
    remove(): void;
    loaded(): boolean;
    
    // Style
    setStyle(style: any): this;
    getStyle(): any;
    isStyleLoaded(): boolean;
    
    // Sources
    addSource(id: string, source: any): this;
    removeSource(id: string): this;
    getSource(id: string): any;
    
    // Layers
    addLayer(layer: any, beforeId?: string): this;
    removeLayer(id: string): this;
    getLayer(id: string): any;
    setLayoutProperty(layerId: string, name: string, value: any): this;
    getLayoutProperty(layerId: string, name: string): any;
    setPaintProperty(layerId: string, name: string, value: any): this;
    getPaintProperty(layerId: string, name: string): any;
    setFilter(layerId: string, filter: any[]): this;
    getFilter(layerId: string): any[];
    
    // Query
    queryRenderedFeatures(geometry?: any, options?: any): any[];
    querySourceFeatures(sourceId: string, parameters?: any): any[];
    
    // Container
    getContainer(): HTMLElement;
    getCanvasContainer(): HTMLElement;
    getCanvas(): HTMLCanvasElement;
  }

  const goongjs: {
    accessToken: string;
    Map: typeof Map;
    Marker: typeof Marker;
    Popup: typeof Popup;
    LngLat: typeof LngLat;
    LngLatBounds: typeof LngLatBounds;
    NavigationControl: typeof NavigationControl;
    GeolocateControl: typeof GeolocateControl;
    ScaleControl: typeof ScaleControl;
    FullscreenControl: typeof FullscreenControl;
  };

  export default goongjs;
}
