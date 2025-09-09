

'use client';

import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  Download, Upload, Trash2, Copy, MousePointerClick, Square, Circle, RectangleHorizontal, Type,
  Table as TableIcon, ArrowRightLeft, RotateCcw, ZoomIn, ZoomOut, Grid2X2,
  Settings2, Lamp, Sofa, Mic, Speaker, Monitor, Projector, Wind, Disc,
  Video, Music, Guitar, Bot, Megaphone, Camera, Tent, Flame, Plug, Leaf, Beer,
  Wine, Coffee, Gift, Users, UserCheck, Wrench, Hammer, BriefcaseMedical, Building2,
  Mountain, PartyPopper, Sparkles, Shield, Car, CalendarCheck2, Cake, Heart, Utensils,
  ChevronRight, Component
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

// --- PRODUCT GROUPS (PG) ---
const PG = {
  ARREGLOS_E_ILUMINACION: {
    color: "hsl(var(--chart-5))",
    items: [
      { type: "arreglo_floral_basico", label: "Arreglos Florales Básicos", icon: Sparkles, baseW: 20, baseH: 15, color: "#F59E0B" },
      { type: "arreglo_floral_premium", label: "Arreglos Florales Premium", icon: Sparkles, baseW: 25, baseH: 20, color: "#F43F5E" },
      { type: "bouquet_personalizado", label: "Bouquets Personalizados", icon: Gift, baseW: 18, baseH: 18, color: "#EC4899" },
      { type: "arcos_florales", label: "Arcos Florales", icon: Square, baseW: 110, baseH: 20, color: "#A78BFA" },
      { type: "jardin_temporales", label: "Diseño de Jardines Temporales", icon: Leaf, baseW: 120, baseH: 80, color: "#10B981" },
      { type: "iluminacion_basica", label: "Iluminación Ambiental (Básica)", icon: Lamp, baseW: 60, baseH: 30, color: "#38BDF8" },
      { type: "iluminacion_arquitectonica", label: "Iluminación Arquitectónica", icon: Lamp, baseW: 70, baseH: 30, color: "#0EA5E9" },
      { type: "candelabros_velas", label: "Candelabros y Velas", icon: Flame, baseW: 15, baseH: 10, color: "#F59E0B" },
    ],
  },
  MOBILIARIO_Y_TEXTILES: {
    color: "hsl(var(--muted-foreground))",
    items: [
      { type: "mobiliario_lounge", label: "Mobiliario Lounge", icon: Sofa, baseW: 90, baseH: 45, color: "#64748B" },
      { type: "sillas", label: "Sillas (Tiffany, Avant Garde)", icon: Sofa, baseW: 20, baseH: 20, color: "#6B7280" },
      { type: "mesas_redondas", label: "Mesas (Redondas)", icon: Circle, baseW: 70, baseH: 70, color: "#FB923C" },
      { type: "mesas_rectangulares", label: "Mesas (Rectangulares)", icon: RectangleHorizontal, baseW: 90, baseH: 50, color: "#F59E0B" },
      { type: "plato_y_copa", label: "Plato y Copa", icon: Utensils, baseW: 12, baseH: 12, color: "#9CA3AF" },
    ],
  },
  EQUIPO_AUDIOVISUAL: {
    color: "hsl(var(--chart-1))",
    items: [
      { type: "sistema_sonido_basico", label: "Sistema de Sonido Básico", icon: Speaker, baseW: 30, baseH: 45, color: "#4F46E5" },
      { type: "sistema_sonido_concierto", label: "Sistema de Sonido Concierto", icon: Speaker, baseW: 50, baseH: 70, color: "#312E81" },
      { type: "microfonos", label: "Micrófonos", icon: Mic, baseW: 10, baseH: 10, color: "#6366F1" },
      { type: "pantallas_led", label: "Pantallas LED", icon: Monitor, baseW: 120, baseH: 70, color: "#A5B4FC" },
      { type: "proyectores", label: "Proyectores", icon: Projector, baseW: 25, baseH: 15, color: "#C7D2FE" },
      { type: "camara_video", label: "Cámara de Video", icon: Camera, baseW: 20, baseH: 15, color: "#818CF8" },
      { type: "maquina_humo", label: "Máquina de Humo", icon: Wind, baseW: 25, baseH: 15, color: "#A5B4FC" },
    ],
  },
  CATERING_Y_COMIDA: {
    color: "hsl(var(--chart-2))",
    items: [
      { type: "estacion_buffet", label: "Estación de Buffet", icon: TableIcon, baseW: 120, baseH: 40, color: "#059669" },
      { type: "barra_bebidas", label: "Barra de Bebidas", icon: Beer, baseW: 80, baseH: 35, color: "#10B981" },
      { type: "estacion_cafe", label: "Estación de Café", icon: Coffee, baseW: 60, baseH: 35, color: "#6EE7B7" },
      { type: "fuente_chocolate", label: "Fuente de Chocolate", icon: Cake, baseW: 25, baseH: 35, color: "#D97706" },
      { type: "mesa_postres", label: "Mesa de Postres", icon: Gift, baseW: 100, baseH: 40, color: "#F59E0B" },
    ],
  },
  PERSONAL_Y_STAFF: {
    color: "hsl(var(--destructive))",
    items: [
      { type: "staff_meseros", label: "Meseros", icon: Users, baseW: 15, baseH: 15, color: "#DB2777" },
      { type: "staff_seguridad", label: "Seguridad", icon: Shield, baseW: 15, baseH: 15, color: "#9D174D" },
      { type: "staff_cocina", label: "Personal de Cocina", icon: Utensils, baseW: 15, baseH: 15, color: "#F472B6" },
      { type: "coordinador_evento", label: "Coordinador de Evento", icon: UserCheck, baseW: 15, baseH: 15, color: "#BE185D" },
    ],
  },
  ESTRUCTURAS_Y_LOGISTICA: {
    color: "hsl(var(--chart-4))",
    items: [
      { type: "carpas", label: "Carpas", icon: Tent, baseW: 150, baseH: 150, color: "#CA8A04" },
      { type: "tarimas", label: "Tarimas y Escenarios", icon: RectangleHorizontal, baseW: 120, baseH: 60, color: "#EAB308" },
      { type: "pista_baile", label: "Pista de Baile", icon: Disc, baseW: 100, baseH: 100, color: "#FACC15" },
      { type: "planta_electrica", label: "Planta Eléctrica", icon: Plug, baseW: 50, baseH: 30, color: "#A16207" },
      { type: "transporte", label: "Transporte Invitados", icon: Car, baseW: 60, baseH: 25, color: "#FEF08A" },
    ],
  },
  DECORACION_TEMATICA: {
    color: "hsl(var(--chart-3))",
    items: [
      { type: "boda", label: "Decoración de Boda", icon: Heart, baseW: 40, baseH: 40, color: "#C084FC" },
      { type: "cumpleanos", label: "Decoración de Cumpleaños", icon: Cake, baseW: 40, baseH: 40, color: "#A78BFA" },
      { type: "corporativo", label: "Decoración Corporativa", icon: BriefcaseMedical, baseW: 40, baseH: 40, color: "#8B5CF6" },
      { type: "fiesta_privada", label: "Fiesta Privada", icon: PartyPopper, baseW: 40, baseH: 40, color: "#7C3AED" },
    ],
  },
  ELEMENTOS_BASICOS: {
    color: "#6B7280",
    items: [
      { type: "forma_rectangulo", label: "Rectángulo", icon: Square, baseW: 50, baseH: 50, color: "#6B7280" },
      { type: "forma_circulo", label: "Círculo", icon: Circle, baseW: 50, baseH: 50, color: "#9CA3AF" },
      { type: "texto", label: "Texto", icon: Type, baseW: 80, baseH: 20, color: "#4B5563" },
    ],
  },
};
const PALETTE_GROUPS = Object.entries(PG).map(([key, group]) => ({ key, ...group }));
const ALL_ITEMS = PALETTE_GROUPS.flatMap(g => g.items).reduce((acc, item) => { acc[item.type] = item; return acc; }, {} as Record<string, any>);


// --- DECORATION STYLES ---
const DECOR_STYLES = [
  { 
    event: "🎀 Bodas", 
    styles: [
      { name: "Clásico / Elegante", items: ["mesas_redondas", "sillas", "arreglo_floral_basico"] },
      { name: "Romántico", items: ["mesas_redondas", "sillas", "candelabros_velas", "arreglo_floral_premium"] },
    ]
  },
  {
    event: "🎂 Cumpleaños",
    styles: [
       { name: "Juvenil / Neón", items: ["mobiliario_lounge", "iluminacion_basica"] },
       { name: "Adulto Elegante", items: ["mesas_rectangulares", "sillas", "mobiliario_lounge"] },
    ]
  },
  {
    event: "🎉 Fiestas",
    styles: [
      { name: "Gala / Corporativo", items: ["mesas_rectangulares", "sillas"] },
      { name: "Tropical", items: ["mobiliario_lounge", "jardin_temporales"] },
    ]
  }
];


let ID_SEQ = 1;
const genId = () => `n_${ID_SEQ++}`;

function useKeyDown(callback: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => callback(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [callback]);
}

const ToolbarButton = ({ icon: Icon, children, active, onClick, title, className, ...props }: any) => (
  <button
    title={title}
    onClick={onClick}
    className={cn(`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors`,
      `bg-transparent text-card-foreground hover:bg-muted`,
      active && "bg-primary text-primary-foreground",
      className
    )}
    {...props}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
);


function SmartSetupWizard({ onGenerate, onOpenChange }: { onGenerate: (options: { guests: number, tableType: 'mesas_redondas' | 'mesas_rectangulares', addCenterpieces: boolean, addPlaceSettings: boolean }) => void, onOpenChange: (open: boolean) => void }) {
    const [step, setStep] = useState(1);
    const [guests, setGuests] = useState("150");
    const [tableType, setTableType] = useState<'mesas_redondas' | 'mesas_rectangulares'>('mesas_redondas');
    const [addCenterpieces, setAddCenterpieces] = useState(true);
    const [addPlaceSettings, setAddPlaceSettings] = useState(true);
    const [decorStyle, setDecorStyle] = useState("Clásico / Elegante");

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleGenerate = () => {
        const numGuests = parseInt(guests);
        if (numGuests > 0) {
            onGenerate({ guests: numGuests, tableType, addCenterpieces, addPlaceSettings });
            onOpenChange(false);
        }
    }
    
    const decorOptions = useMemo(() => DECOR_STYLES.flatMap(e => e.styles), []);

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Asistente de Montaje Inteligente</DialogTitle>
                <DialogDescription>
                    Genera una distribución de mesas y sillas automáticamente.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
                {step === 1 && (
                     <div className="space-y-2">
                        <Label>Paso 1: ¿Qué estilo de decoración prefieres?</Label>
                        <RadioGroup defaultValue={decorStyle} onValueChange={setDecorStyle} className="space-y-1">
                             {decorOptions.map(style => (
                                <div key={style.name} className="flex items-center space-x-2">
                                  <RadioGroupItem value={style.name} id={`ds-${style.name}`} />
                                  <Label htmlFor={`ds-${style.name}`}>{style.name}</Label>
                                </div>
                             ))}
                        </RadioGroup>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-2">
                        <Label htmlFor="guests-count">Paso 2: ¿Cuántos invitados esperas?</Label>
                        <Input id="guests-count" type="number" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="Ej: 150" />
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Paso 3: ¿Qué tipo de mesa usarás?</Label>
                          <RadioGroup defaultValue={tableType} onValueChange={(v) => setTableType(v as any)}>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="mesas_redondas" id="r-round" />
                                  <Label htmlFor="r-round">Redondas</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="mesas_rectangulares" id="r-rect" />
                                  <Label htmlFor="r-rect">Rectangulares</Label>
                              </div>
                          </RadioGroup>
                        </div>
                    </div>
                )}
                 {step === 4 && (
                     <div className="space-y-4">
                        <Label>Paso 4: ¿Añadir detalles adicionales?</Label>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="add-centerpieces" checked={addCenterpieces} onCheckedChange={setAddCenterpieces as any} />
                            <Label htmlFor="add-centerpieces">Añadir centros de mesa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="add-place-settings" checked={addPlaceSettings} onCheckedChange={setAddPlaceSettings as any} />
                            <Label htmlFor="add-place-settings">Añadir platos y copas</Label>
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
                {step > 1 && <Button variant="ghost" onClick={handleBack}>Atrás</Button>}
                {step < 4 ? (
                    <Button onClick={handleNext} disabled={step === 2 && (!guests || parseInt(guests) <= 0)}>Siguiente</Button>
                ) : (
                    <Button onClick={handleGenerate}>Generar Montaje</Button>
                )}
            </DialogFooter>
        </DialogContent>
    )
}

export default function MaquetacionVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<any[]>([]); 
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [snap, setSnap] = useState(true);
  const [grid, setGrid] = useState(20);
  const { toast } = useToast();
  const [placementMode, setPlacementMode] = useState<{isActive: boolean, totalTables: number, placedTables: number, config: any} | null>(null);

  useEffect(() => {
    toast({
      title: "Sesión de Diseño Colaborativo",
      description: "Los cambios se guardan automáticamente y son visibles para tu equipo.",
    });
  }, [toast]);


  const [isPaletteModalOpen, setPaletteModalOpen] = useState(false);
  const [paletteView, setPaletteView] = useState<'categories' | 'items'>('categories');
  const [currentPaletteCategory, setCurrentPaletteCategory] = useState<any>(null);

  const [isDuplicatePromptOpen, setDuplicatePromptOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<any>(null);
  const [duplicateCount, setDuplicateCount] = useState("1");
  const countInputRef = useRef<HTMLInputElement>(null);
  const [isSmartSetupOpen, setSmartSetupOpen] = useState(false);

  const toLocal = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - viewOffset.x) / zoom;
    const y = (clientY - rect.top - viewOffset.y) / zoom;
    return { x, y };
  };

  const applySnap = (v: number) => (snap ? Math.round(v / grid) * grid : v);

  const handleOpenPaletteCategory = (category: any) => {
    setCurrentPaletteCategory(category);
    setPaletteView('items');
  }

  const addItemsToCanvas = (items: any[], center = true) => {
      if (!containerRef.current) return;
      
      const { x: canvasCenterX, y: canvasCenterY } = toLocal(containerRef.current.clientWidth / 2, containerRef.current.clientHeight / 2);

      const newNodes = items.map((item, i) => {
          const offset = center ? i * grid : 0;
          const nx = applySnap(canvasCenterX - (item.baseW / 2) + offset);
          const ny = applySnap(canvasCenterY - (item.baseH / 2) + offset);
          return {
              id: genId(), type: item.type, x: nx, y: ny, w: item.baseW, h: item.baseH,
              rot: 0, scale: 1, text: '', color: item.color,
          };
      });
      setNodes(prev => [...prev, ...newNodes]);
      if (newNodes.length > 0) {
          setSelectedIds([newNodes[newNodes.length - 1].id]);
      }
  };

  const handleSelectPaletteItem = (item: any) => {
    setItemToAdd(item);
    setPaletteModalOpen(false);
    setDuplicatePromptOpen(true);
    setDuplicateCount("1");
    setTimeout(() => {
      countInputRef.current?.focus();
      countInputRef.current?.select();
    }, 100);
  }

  const handleConfirmDuplicates = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!itemToAdd) return;
    const count = parseInt(duplicateCount, 10);
    if (isNaN(count) || count < 1) return;
    addItemsToCanvas(Array(count).fill(itemToAdd));
    setDuplicatePromptOpen(false);
    setItemToAdd(null);
  }
  
  const handleDuplicateSelectedNodes = () => {
    if (selectedIds.length === 0) return;

    const newNodes:any[] = [];
    const newSelectedIds:string[] = [];
    const idMap = new Map<string, string>();
    const isGroupDuplication = nodes.find(n => n.id === selectedIds[0])?.groupId;
    const newGroupId = isGroupDuplication ? `group-${genId()}` : undefined;

    selectedIds.forEach(id => {
      const copyId = genId();
      idMap.set(id, copyId);
      newSelectedIds.push(copyId);
    });

    nodes.forEach(n => {
      if(selectedIds.includes(n.id)) {
        const newNode = { ...n, id: idMap.get(n.id), x: n.x + grid, y: n.y + grid };
        if (isGroupDuplication) {
          newNode.groupId = newGroupId;
        }
        newNodes.push(newNode);
      }
    });
    setNodes(prev => [...prev, ...newNodes]);
    setSelectedIds(newSelectedIds);
  };

  const handleRotateSelectedNodes = () => {
    if (selectedIds.length === 0) return;
    performActionOnSelection(n => ({...n, rot: (n.rot + 15) % 360}));
  };

  const handleScaleUpSelectedNodes = () => {
    if (selectedIds.length === 0) return;
    performActionOnSelection(n => ({...n, scale: Math.min(3, n.scale + 0.1)}));
  };

  const handleScaleDownSelectedNodes = () => {
    if (selectedIds.length === 0) return;
    performActionOnSelection(n => ({...n, scale: Math.max(0.1, n.scale - 0.1)}));
  };

  const handleDeleteSelectedNodes = () => {
    if (selectedIds.length === 0) return;
    setNodes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  const handleCancelDuplicates = () => {
      setDuplicatePromptOpen(false);
      setItemToAdd(null);
  };

  const handleAddDecorStyle = (style: any) => {
    const items = style.items.map((type: string) => ALL_ITEMS[type]).filter(Boolean);
    if (items.length > 0) {
        addItemsToCanvas(items);
        toast({ title: `Estilo '${style.name}' añadido`, description: `Se agregaron ${items.length} elementos al lienzo.` });
    } else {
        toast({ title: 'Estilo no encontrado', description: 'No se encontraron los elementos para este estilo.', variant: 'destructive'});
    }
  };

  const handleGenerateSmartSetup = (config: { guests: number, tableType: string, addCenterpieces: boolean, addPlaceSettings: boolean }) => {
    if (!containerRef.current) return;
    
    const { guests, tableType } = config;
    const tableItem = ALL_ITEMS[tableType];
    if (!tableItem) return;

    const guestsPerTable = tableType === 'mesas_redondas' ? 10 : 8;
    const tablesNeeded = Math.ceil(guests / guestsPerTable);
    
    setPlacementMode({
        isActive: true,
        totalTables: tablesNeeded,
        placedTables: 0,
        config: config,
    });
  }


  const onDropCanvas = (e: React.DragEvent) => e.preventDefault();
  const onDragOverCanvas = (e: React.DragEvent) => e.preventDefault();
  
  const dragStateRef = useRef<{ ids: string[]; startX: number; startY: number; nodeStartPositions: Map<string, {x: number, y: number}>; }>({ ids: [], startX: 0, startY: 0, nodeStartPositions: new Map() });

  const onPointerDownNode = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (placementMode?.isActive) return;

    const n = nodes.find((n) => n.id === id);
    if (!n) return;

    // Select group or single node
    const idsToSelect = n.groupId ? nodes.filter(node => node.groupId === n.groupId).map(node => node.id) : [id];
    setSelectedIds(idsToSelect);
    
    // Setup for drag operation
    const nodeStartPositions = new Map<string, { x: number, y: number }>();
    nodes.forEach(node => {
      if (idsToSelect.includes(node.id)) {
        nodeStartPositions.set(node.id, { x: node.x, y: node.y });
      }
    });

    dragStateRef.current = { ids: idsToSelect, startX: e.clientX, startY: e.clientY, nodeStartPositions };
    
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

 const onPointerMove = (e: PointerEvent) => {
    const { ids, startX, startY, nodeStartPositions } = dragStateRef.current;
    if (ids.length === 0) return;

    const deltaX = (e.clientX - startX) / zoom;
    const deltaY = (e.clientY - startY) / zoom;

    setNodes(prev =>
      prev.map(n => {
        const startPos = nodeStartPositions.get(n.id);
        if (startPos) {
          return { ...n, x: applySnap(startPos.x + deltaX), y: applySnap(startPos.y + deltaY) };
        }
        return n;
      })
    );
  };


  const onPointerUp = () => {
    dragStateRef.current = { ids: [], startX: 0, startY: 0, nodeStartPositions: new Map() };
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!placementMode || !placementMode.isActive) {
      setSelectedIds([]);
      return;
    }

    const { x: clickX, y: clickY } = toLocal(e.clientX, e.clientY);
    const groupId = `group-${genId()}`;
    const newNodes: any[] = [];

    const { guests, tableType, addCenterpieces, addPlaceSettings } = placementMode.config;
    const tableItem = ALL_ITEMS[tableType];
    const chairItem = ALL_ITEMS['sillas'];
    const centerpieceItem = ALL_ITEMS['arreglo_floral_premium'];
    const placeSettingItem = ALL_ITEMS['plato_y_copa'];

    // Add table
    newNodes.push({
      id: genId(), groupId, type: tableItem.type, x: applySnap(clickX - tableItem.baseW / 2), y: applySnap(clickY - tableItem.baseH / 2),
      w: tableItem.baseW, h: tableItem.baseH, rot: 0, color: tableItem.color,
    });
    
    if (addCenterpieces && centerpieceItem) {
        newNodes.push({
            id: genId(), groupId, type: centerpieceItem.type,
            x: applySnap(clickX - centerpieceItem.baseW / 2),
            y: applySnap(clickY - centerpieceItem.baseH / 2),
            w: centerpieceItem.baseW, h: centerpieceItem.baseH, rot: 0, color: centerpieceItem.color,
        });
    }

    const guestsPerTable = tableType === 'mesas_redondas' ? 10 : 8;
    const remainingGuests = guests - (placementMode.placedTables * guestsPerTable);
    const chairsThisTable = Math.min(guestsPerTable, remainingGuests);

    if (tableType === 'mesas_redondas') {
        const angleStep = (2 * Math.PI) / chairsThisTable;
        const chairRadius = (tableItem.baseW / 2) + chairItem.baseH / 2 + 5;
        const placeRadius = tableItem.baseW / 2 - placeSettingItem.baseW * 1.2;

        for (let i = 0; i < chairsThisTable; i++) {
            const angle = angleStep * i;
            const chairRot = (angle * 180) / Math.PI + 90;
            
            const chairX = clickX + chairRadius * Math.cos(angle);
            const chairY = clickY + chairRadius * Math.sin(angle);
            newNodes.push({ id: genId(), groupId, type: chairItem.type, x: applySnap(chairX - chairItem.baseW/2), y: applySnap(chairY - chairItem.baseH/2), w: chairItem.baseW, h: chairItem.baseH, rot: chairRot, color: chairItem.color });

            if (addPlaceSettings && placeSettingItem) {
                const placeX = clickX + placeRadius * Math.cos(angle);
                const placeY = clickY + placeRadius * Math.sin(angle);
                newNodes.push({ id: genId(), groupId, type: placeSettingItem.type, x: applySnap(placeX - placeSettingItem.baseW / 2), y: applySnap(placeY - placeSettingItem.baseH / 2), w: placeSettingItem.baseW, h: placeSettingItem.baseH, rot: chairRot, color: placeSettingItem.color });
            }
        }
    } else { // Rectangular tables
        const chairsTop = Math.ceil(chairsThisTable / 2);
        const chairsBottom = chairsThisTable - chairsTop;
        
        const placeSide = (count: number, side: 'top' | 'bottom') => {
            if (count === 0) return;
            const totalChairWidth = count * chairItem.baseW;
            const totalSpacing = tableItem.baseW - totalChairWidth;
            const singleSpacing = totalSpacing / (count + 1);
            let currentX = clickX - tableItem.baseW / 2 + singleSpacing;

            for (let i = 0; i < count; i++) {
                const chairX = currentX;
                const chairY = (side === 'top' ? clickY - tableItem.baseH/2 - chairItem.baseH - 5 : clickY + tableItem.baseH/2 + 5);
                const rot = side === 'top' ? 0 : 180;
                newNodes.push({ id: genId(), groupId, type: chairItem.type, x: applySnap(chairX), y: applySnap(chairY), w: chairItem.baseW, h: chairItem.baseH, rot, color: chairItem.color });
                
                if (addPlaceSettings && placeSettingItem) {
                    const placeX = chairX + chairItem.baseW / 2 - placeSettingItem.baseW / 2;
                    const placeY = (side === 'top' ? clickY - tableItem.baseH/2 + placeSettingItem.baseH / 2 : clickY + tableItem.baseH/2 - placeSettingItem.baseH * 1.5);
                    newNodes.push({ id: genId(), groupId, type: placeSettingItem.type, x: applySnap(placeX), y: applySnap(placeY), w: placeSettingItem.baseW, h: placeSettingItem.baseH, rot, color: placeSettingItem.color });
                }
                currentX += chairItem.baseW + singleSpacing;
            }
        }
        placeSide(chairsTop, 'top');
        placeSide(chairsBottom, 'bottom');
    }

    setNodes(prev => [...prev, ...newNodes]);

    const newPlacedCount = placementMode.placedTables + 1;
    if (newPlacedCount >= placementMode.totalTables) {
        setPlacementMode(null);
    } else {
        setPlacementMode(prev => prev ? ({ ...prev, placedTables: newPlacedCount }) : null);
    }
  }
  
  const selectedNode = useMemo(() => {
    if (selectedIds.length === 1) {
      return nodes.find((n) => n.id === selectedIds[0]) || null;
    }
    return null;
  }, [nodes, selectedIds]);

  const performActionOnSelection = (action: (node: any) => any) => {
      setNodes(prev => prev.map(n => selectedIds.includes(n.id) ? action(n) : n));
  };
    
  useKeyDown((e) => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

    if (e.key === "Escape" && placementMode?.isActive) {
        e.preventDefault();
        setPlacementMode(null);
        toast({ title: "Modo de colocación cancelado." });
    }

    if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
      e.preventDefault();
      setNodes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    }
    
    if (e.key.toLowerCase() === "r" && selectedIds.length > 0) {
      e.preventDefault();
      performActionOnSelection(n => ({...n, rot: (n.rot + 15) % 360}));
    }
    if ((e.key === "+" || e.key === "=") && selectedIds.length > 0) {
      e.preventDefault();
      performActionOnSelection(n => ({...n, scale: Math.min(3, n.scale + 0.1)}));
    }
    if ((e.key === "-" || e.key === "_") && selectedIds.length > 0) {
      e.preventDefault();
       performActionOnSelection(n => ({...n, scale: Math.max(0.1, n.scale - 0.1)}));
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedIds.length > 0) {
      e.preventDefault();
      const step = e.shiftKey ? grid : Math.max(2, grid / 2);
      const dx = (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0);
      const dy = (e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0);
      performActionOnSelection(n => ({...n, x: applySnap(n.x + dx), y: applySnap(n.y + dy)}));
    }
  });

  const exportJSON = () => {
    const data = { nodes, meta: { grid, version: 2 } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maqueta_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Diseño Exportado", description: "El archivo JSON se ha guardado en tus descargas." });
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data && Array.isArray(data.nodes)) {
            setNodes(data.nodes);
            if (data.meta?.grid) setGrid(data.meta.grid);
            toast({ title: "Diseño Importado", description: "El diseño se ha cargado en el lienzo." });
        } else {
             toast({ title: "Error de Formato", description: "El archivo JSON no tiene el formato esperado.", variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: "Error de Archivo", description: "No se pudo leer el archivo. Asegúrate de que sea un JSON válido.", variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!containerRef.current) return;
    
    const factor = direction === 'in' ? 1.1 : 1 / 1.1;
    const newZoom = Math.max(0.1, Math.min(2.5, zoom * factor));
    
    const { clientWidth, clientHeight } = containerRef.current;
    
    const centerX = clientWidth / 2;
    const centerY = clientHeight / 2;

    const newOffsetX = viewOffset.x + (centerX - viewOffset.x) * (1 - factor);
    const newOffsetY = viewOffset.y + (centerY - viewOffset.y) * (1 - factor);

    setZoom(newZoom);
    setViewOffset({ x: newOffsetX, y: newOffsetY });
  };
  
  const zoomToFit = () => {
    if (nodes.length === 0 || !containerRef.current) {
        setZoom(1);
        setViewOffset({ x: 0, y: 0 });
        return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.w);
        maxY = Math.max(maxY, node.y + node.h);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    if (contentWidth <= 0 || contentHeight <= 0) {
       setZoom(1);
       setViewOffset({ x: 0, y: 0 });
       return;
    }

    const { clientWidth: canvasWidth, clientHeight: canvasHeight } = containerRef.current;
    
    const zoomX = canvasWidth / contentWidth;
    const zoomY = canvasHeight / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, 2.5) * 0.9; // 90% padding, max zoom 2.5

    const newOffsetX = (canvasWidth / 2) - (minX + contentWidth / 2) * newZoom;
    const newOffsetY = (canvasHeight / 2) - (minY + contentHeight / 2) * newZoom;

    setZoom(newZoom);
    setViewOffset({ x: newOffsetX, y: newOffsetY });
  };


  const NodeView = ({ n, selected }: { n: any, selected: boolean }) => {
    const paletteItem = useMemo(() => ALL_ITEMS[n.type] || { label: n.type, icon: Square, color: '#ccc' }, [n.type]);
    const Icon = paletteItem.icon;

    const baseStyle: React.CSSProperties = {
        position: "absolute",
        left: n.x,
        top: n.y,
        width: n.w,
        height: n.h,
        transform: `rotate(${n.rot}deg) scale(${n.scale})`,
        transformOrigin: "center center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        cursor: selected ? "grabbing" : "grab",
        filter: selected ? `drop-shadow(0 0 5px hsl(var(--primary)))` : 'none',
        transition: 'filter 0.2s',
    };
    
    let content;
    if(n.type.includes('mesas_redondas')){
        content = <div style={{width:'100%', height:'100%', borderRadius:'9999px', backgroundColor: n.color}} />
    } else if(n.type.includes('mesas_rectangulares')){
        content = <div style={{width:'100%', height:'100%', borderRadius:'4px', backgroundColor: n.color}} />
    } else {
        content = (
            <Icon
                style={{
                    width: '100%', height: '100%', color: n.color,
                    filter: `drop-shadow(0 1px 2px ${n.color}40)`
                }}
            />
        );
    }

    return (
      <div onPointerDown={(e) => onPointerDownNode(e, n.id)} style={baseStyle}>
        {content}
      </div>
    );
  };
  
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    setViewOffset({ x: clientWidth / 2, y: clientHeight / 2 });
    setZoom(1); 
  }, []);

  return (
    <>
      <div className="w-full h-full flex flex-col p-0 bg-background">
        <div className="flex items-center justify-between gap-2 bg-card border-b border-border p-1.5 shadow-sm">
            <div className="flex items-center gap-1">
                <ToolbarButton title="Mover" icon={MousePointerClick} active={!placementMode?.isActive} />
                
                <Separator orientation="vertical" className="h-4 mx-1" />

                <Dialog open={isSmartSetupOpen} onOpenChange={setSmartSetupOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Bot className="mr-2 h-4 w-4" /> Asistente IA</Button>
                    </DialogTrigger>
                    <SmartSetupWizard onGenerate={handleGenerateSmartSetup} onOpenChange={setSmartSetupOpen} />
                </Dialog>

                <Dialog open={isPaletteModalOpen} onOpenChange={setPaletteModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setPaletteView('categories')}><Component className="mr-2 h-4 w-4" /> Elementos</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                        <DialogTitle>
                            {paletteView === 'categories' 
                                ? 'Seleccionar Categoría' 
                                : (
                                    <button onClick={() => setPaletteView('categories')} className="flex items-center gap-2 hover:text-primary">
                                        <ChevronRight className="h-4 w-4 transform rotate-180" />
                                        {currentPaletteCategory?.key.replaceAll('_',' ')}
                                    </button>
                                )
                            }
                        </DialogTitle>
                        </DialogHeader>
                        {paletteView === 'categories' ? (
                            <div className="grid grid-cols-2 gap-2 py-4">
                            {PALETTE_GROUPS.map((grp) => (
                                <button key={grp.key} onClick={() => handleOpenPaletteCategory(grp)} className="flex items-center p-3 rounded-lg transition-all group bg-secondary/50 hover:bg-secondary">
                                    <span className="w-4 h-4 rounded-full mr-3" style={{ background: grp.color }} />
                                    <span className="text-sm font-medium">{grp.key.replaceAll('_',' ')}</span>
                                    <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground transition-transform group-hover:translate-x-1" />
                                </button>
                            ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 py-4 max-h-[60vh] overflow-y-auto">
                                {currentPaletteCategory?.items.map((item: any) => {
                                    const Icon = item.icon || Square;
                                    return (
                                        <TooltipProvider key={item.type}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button 
                                                    onClick={() => handleSelectPaletteItem(item)} 
                                                    className="flex flex-col items-center justify-center p-2 rounded-lg transition-all aspect-square group bg-transparent border hover:bg-muted"
                                                    >
                                                        <Icon 
                                                            className="h-10 w-10 transition-all duration-300 group-hover:scale-110"
                                                            style={{
                                                                color: item.color,
                                                                filter: `drop-shadow(0 2px 4px ${item.color}50)`
                                                            }}
                                                        />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{item.label}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                })}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
            
            <div className="flex items-center gap-1">
                <ToolbarButton title="Alejar" icon={ZoomOut} onClick={() => handleZoom('out')} />
                <ToolbarButton title="Ver Todo" icon={Grid2X2} onClick={zoomToFit} />
                <ToolbarButton title="Acercar" icon={ZoomIn} onClick={() => handleZoom('in')} />
                <div className="text-xs text-muted-foreground w-12 text-center border-x px-2">{(zoom * 100).toFixed(0)}%</div>
            </div>

            <div className="flex items-center gap-1 min-w-[180px]">
                {selectedIds.length > 0 ? (
                    <>
                    <ToolbarButton title="Duplicar (Ctrl/Cmd + D)" icon={Copy} onClick={handleDuplicateSelectedNodes} />
                    <ToolbarButton title="Rotar 15° (R)" icon={RotateCcw} onClick={handleRotateSelectedNodes} />
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <ToolbarButton title="Escalar -" icon={ZoomOut} onClick={handleScaleDownSelectedNodes}/>
                    <ToolbarButton title="Escalar +" icon={ZoomIn} onClick={handleScaleUpSelectedNodes}/>
                    <Separator orientation="vertical" className="h-4 mx-1" />
                    <ToolbarButton title="Eliminar (Supr)" icon={Trash2} onClick={handleDeleteSelectedNodes} className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20 hover:border-destructive/30"/>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <ToolbarButton title="Exportar JSON" icon={Download} onClick={exportJSON} />
                        <label className="inline-flex items-center gap-2">
                        <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
                        <ToolbarButton asChild title="Importar JSON" icon={Upload}>
                            <span></span>
                        </ToolbarButton>
                        </label>
                    </div>
                )}
            </div>
        </div>
        <div className="flex-1 flex gap-2 p-2">
            <aside className="w-64 bg-card border border-border rounded-lg p-2 flex flex-col gap-1 shadow-sm overflow-y-auto">
                <div className="p-2">
                    <h3 className="text-sm font-semibold">Estilos de Decoración</h3>
                    <p className="text-xs text-muted-foreground">Kits de inicio rápido</p>
                </div>
                <Separator />
                <div className="flex flex-col gap-1.5 p-1">
                {DECOR_STYLES.map(event => (
                    <div key={event.event}>
                        <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground">{event.event}</div>
                        {event.styles.map(style => (
                            <Button key={style.name} variant="ghost" size="sm" className="w-full justify-start h-8" onClick={() => handleAddDecorStyle(style)}>
                            <span className="text-xs font-normal">{style.name}</span>
                            </Button>
                        ))}
                    </div>
                ))}
                </div>

                <div className="mt-auto p-1 space-y-2">
                {/* This space can be used for layer controls or other tools later */}
                </div>
            </aside>

            <section className="flex-1 flex flex-col gap-2">
                <div
                ref={containerRef}
                onDrop={onDropCanvas}
                onDragOver={onDragOverCanvas}
                onPointerDown={handleCanvasClick}
                className={cn("relative flex-1 bg-card border rounded-lg overflow-hidden shadow-sm", placementMode?.isActive && "cursor-crosshair")}
                style={{
                    backgroundSize: `${grid * zoom}px ${grid * zoom}px`,
                    backgroundImage: `linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)`,
                    backgroundPosition: `${viewOffset.x}px ${viewOffset.y}px`
                }}
                >

                <div className="absolute inset-0 w-full h-full" style={{ transform: `translate(${viewOffset.x}px, ${viewOffset.y}px) scale(${zoom})` }}>
                    {nodes.map((n) => (
                    <NodeView key={n.id} n={n} selected={selectedIds.includes(n.id)} />
                    ))}
                </div>

                {placementMode?.isActive ? (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-semibold p-2 rounded-md shadow-lg animate-pulse">
                        Haz clic para colocar la Mesa {placementMode.placedTables + 1} de {placementMode.totalTables}. (Presiona 'Esc' para cancelar)
                    </div>
                ) : (
                     <div className="absolute bottom-2 right-2 text-xs text-muted-foreground p-1 rounded">
                        Atajos: <b>R</b> rotar · <b>+/-</b> escalar · <b>Ctrl+D</b> duplicar · <b>Supr</b> borrar
                    </div>
                )}
                </div>
            </section>
        </div>
      </div>
      <AlertDialog open={isDuplicatePromptOpen} onOpenChange={handleCancelDuplicates}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Añadir Elemento</AlertDialogTitle>
              <AlertDialogDescription>
                  ¿Cuántas copias de "{itemToAdd?.label}" quieres añadir al lienzo?
              </AlertDialogDescription>
              </AlertDialogHeader>
              <form onSubmit={handleConfirmDuplicates}>
                  <div className="py-4">
                      <Label htmlFor="duplicate-count">Cantidad</Label>
                      <Input
                          ref={countInputRef}
                          id="duplicate-count" 
                          type="number" 
                          min="1" 
                          value={duplicateCount} 
                          onChange={(e) => setDuplicateCount(e.target.value)}
                      />
                  </div>
                  <AlertDialogFooter>
                      <AlertDialogCancel type="button" onClick={handleCancelDuplicates}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction type="submit">Añadir</AlertDialogAction>
                  </AlertDialogFooter>
              </form>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
