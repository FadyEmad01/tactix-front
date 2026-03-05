// "use client";

// import React, { useState } from "react";
// import {
//   Plus,
//   Lock,
//   MoreVertical,
//   Edit2,
//   Trash2,
//   Tag,
//   ShieldCheck
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { TagInput } from "./tag-input"; // Adjust import path
// import { cn } from "@/lib/utils";
// import { Categories } from "@/constant/EVENTS";

// // --- 1. CONSTANTS ---


// const PRESET_COLORS = [
//   { name: "Slate", value: "#64748b" },     // slate-500
//   { name: "Red", value: "#ef4444" },       // red-500
//   { name: "Orange", value: "#f97316" },    // orange-500
//   { name: "Green", value: "#10b981" },     // emerald-500
//   { name: "Blue", value: "#3b82f6" },      // blue-500
//   { name: "Violet", value: "#8b5cf6" },    // violet-500
// ];

// // --- 2. TYPES ---

// type CustomPanel = {
//   id: string;
//   name: string;
//   color: string;
//   events: string[];
// };

// // --- 3. MAIN COMPONENT ---

// export default function TagsDashboard() {
//   // State for Custom Panels
//   const [customPanels, setCustomPanels] = useState<CustomPanel[]>([]);

//   // State for Dialog
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingPanelId, setEditingPanelId] = useState<string | null>(null);

//   // Form State
//   const [formData, setFormData] = useState<{ name: string; color: string; tags: string[] }>({
//     name: "",
//     color: PRESET_COLORS[0].value,
//     tags: [],
//   });

//   // -- HANDLERS --

//   const resetForm = () => {
//     setFormData({ name: "", color: PRESET_COLORS[0].value, tags: [] });
//     setEditingPanelId(null);
//   };

//   const handleOpenCreate = () => {
//     resetForm();
//     setIsDialogOpen(true);
//   };

//   const handleOpenEdit = (panel: CustomPanel) => {
//     setFormData({
//       name: panel.name,
//       color: panel.color,
//       tags: [...panel.events],
//     });
//     setEditingPanelId(panel.id);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = (id: string) => {
//     if (confirm("Are you sure you want to delete this panel?")) {
//       setCustomPanels((prev) => prev.filter((p) => p.id !== id));
//     }
//   };

//   const handleSave = () => {
//     if (!formData.name.trim()) return; // Simple validation

//     if (editingPanelId) {
//       // Update existing
//       setCustomPanels((prev) =>
//         prev.map((p) =>
//           p.id === editingPanelId
//             ? { ...p, name: formData.name, color: formData.color, events: formData.tags }
//             : p
//         )
//       );
//     } else {
//       // Create new
//       const newPanel: CustomPanel = {
//         id: Math.random().toString(36).substring(7),
//         name: formData.name,
//         color: formData.color,
//         events: formData.tags,
//       };
//       setCustomPanels((prev) => [...prev, newPanel]);
//     }
//     setIsDialogOpen(false);
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 space-y-12">

//       {/* HEADER */}
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Tags Dashboard</h1>
//         <p className="text-muted-foreground mt-1">
//           Manage your analysis tags. Core system tags are fixed, but you can create your own panels below.
//         </p>
//       </div>

//       {/* SECTION 1: CORE SYSTEM TAGS (READ ONLY) */}
//       <section className="space-y-4">
//         <div className="flex items-center gap-2">
//           <ShieldCheck className="w-5 h-5 text-primary" />
//           <h2 className="text-xl font-semibold">Core System Tags</h2>
//         </div>

//         {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> */}
//         <div className="columns-1 md:columns-2 lg:columns-4 inline-block">
//           {Categories.map((category, idx) => (
//             <Card key={idx} className="bg-muted/30 border-dashed border-2 opacity-90 relative overflow-hidden mb-6 mx-1">
//               {/* Watermark / Lock Icon */}
//               <div className="absolute top-2 right-2 text-muted-foreground/20">
//                 <Lock className="w-12 h-12" />
//               </div>

//               <CardHeader className="pb-2">
//                 <CardTitle className="text-lg font-medium flex items-center gap-2 text-muted-foreground">
//                   {category.name}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-wrap gap-2">
//                   {category.events.map((event) => (
//                     <Badge key={event} variant="outline" className="bg-background text-muted-foreground hover:bg-background cursor-not-allowed">
//                       {event}
//                     </Badge>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </section>

//       <Separator />

//       {/* SECTION 2: CUSTOM TAGS PANEL */}
//       <section className="space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Tag className="w-5 h-5 text-primary" />
//             <h2 className="text-xl font-semibold">Custom Tags Panels</h2>
//           </div>
//           <Button size="sm" onClick={handleOpenCreate}>
//             <Plus className="mr-2 h-4 w-4" /> Create Panel
//           </Button>
//         </div>

//         {customPanels.length === 0 ? (
//           // EMPTY STATE
//           <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/10 border-dashed">
//             <div className="bg-muted p-4 rounded-full mb-4">
//               <Tag className="h-8 w-8 text-muted-foreground" />
//             </div>
//             <h3 className="text-lg font-medium">No custom panels yet</h3>
//             <p className="text-muted-foreground text-sm max-w-sm text-center mt-1 mb-4">
//               Create a new panel to start adding your own tracking events and tags.
//             </p>
//             <Button size="sm" variant="outline" onClick={handleOpenCreate}>
//               Create your first panel
//             </Button>
//           </div>
//         ) : (
//           // GRID OF CUSTOM PANELS
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {customPanels.map((panel) => (
//               // <Card key={panel.id} className="relative group hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: panel.color.replace('bg-', 'var(--') /* Hacky for tailwind, usually needs map */ }}>
//               <Card key={panel.id} className={cn("relative group hover:shadow-md transition-all border-l-4")}
//               style={{ borderLeftColor: panel.color /* Hacky for tailwind, usually needs map */ }}
//               >
//                 {/* Color strip indicator using inline style or utility class if mapping exists */}
//                 {/* <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", panel.color)} /> */}

//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-lg font-medium">
//                     {panel.name}
//                   </CardTitle>

//                   {/* Actions Menu */}
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
//                         <span className="sr-only">Open menu</span>
//                         <MoreVertical className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => handleOpenEdit(panel)}>
//                         <Edit2 className="mr-2 h-4 w-4" /> Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem
//                         className="text-red-600 focus:text-red-600"
//                         onClick={() => handleDelete(panel.id)}
//                       >
//                         <Trash2 className="mr-2 h-4 w-4" /> Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </CardHeader>

//                 <CardContent>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {panel.events.length > 0 ? panel.events.map((event) => (
//                       <Badge key={event} className={cn("text-white hover:bg-opacity-90")} style={{ backgroundColor: panel.color }}>
//                         {event}
//                       </Badge>
//                     )) : (
//                       <span className="text-xs text-muted-foreground italic">No tags in this panel.</span>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* --- DIALOG: CREATE / EDIT --- */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         {/* <DialogContent className="sm:max-w-[500px]"> */}
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>{editingPanelId ? "Edit Panel" : "Create New Panel"}</DialogTitle>
//             <DialogDescription>
//               Organize your custom tags into a named group.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="grid gap-4 py-4">
//             {/* 1. Panel Name */}
//             <div className="grid gap-2">
//               <Label htmlFor="name">Panel Name</Label>
//               <Input
//                 id="name"
//                 placeholder="e.g. Set Pieces"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               />
//             </div>

//             {/* 2. Color Selection */}
//             <div className="grid gap-2">
//               <Label>Color Theme</Label>
//               <div className="flex gap-3">
//                 {/* {PRESET_COLORS.map((c) => (
//                   <button
//                     key={c.name}
//                     type="button"
//                     onClick={() => setFormData({ ...formData, color: c.value })}
//                     className={cn(
//                       "w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background focus:outline-none focus:ring-2",
//                       c.value,
//                       formData.color === c.value ? "ring-2 ring-foreground scale-100" : "hover:scale-100"
//                     )}
//                     style={{ backgroundColor: c.value }}
//                     title={c.name}
//                   />
//                 ))} */}
//                 <Input className="w-auto min-w-15" type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
//               </div>
//             </div>

//             {/* 3. Tags Manager (Custom Component) */}
//             <div className="grid gap-2">
//               <Label>Tags</Label>
//               <TagInput
//                 tags={formData.tags}
//                 setTags={(newTags) => setFormData({ ...formData, tags: newTags })}
//                 placeholder="Type tag name and press Enter..."
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
//             <Button size="sm" onClick={handleSave} disabled={!formData.name}>
//               {editingPanelId ? "Save Changes" : "Create Panel"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Lock,
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TagInput } from "./tag-input";
import { cn } from "@/lib/utils";
import { Categories } from "@/constant/EVENTS";

import {
  createPanel,
  deletePanel,
  Panel,
  updatePanel,
} from "@/lib/panel/panel-actions";

/* -------------------- TYPES -------------------- */

type TagsDashboardProps = {
  initialPanels?: Panel[];
};

/* -------------------- COMPONENT -------------------- */

export default function TagsDashboard({ initialPanels = [] }: TagsDashboardProps) {
  const router = useRouter();

  const [customPanels, setCustomPanels] = useState<Panel[]>(initialPanels);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tags: [] as string[],
  });

  // Sync state when initialPanels changes (after server revalidation)
  useEffect(() => {
    setCustomPanels(initialPanels);
  }, [initialPanels]);

  /* -------------------- FORM HELPERS -------------------- */

  const resetForm = () => {
    setFormData({
      name: "",
      tags: [],
    });
    setEditingPanelId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (panel: Panel) => {
    setFormData({
      name: panel.title,
      tags: [...panel.tags],
    });
    setEditingPanelId(panel.id);
    setIsDialogOpen(true);
  };

  /* -------------------- DELETE PANEL -------------------- */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this panel?")) return;

    setIsLoading(true);

    try {
      const res = await deletePanel(id);

      if (res.success) {
        // Update local state immediately
        setCustomPanels((prev) => prev.filter((panel) => panel.id !== id));

        // Refresh server data
        router.refresh();
      } else {
        console.error("Failed to delete panel");
      }
    } catch (error) {
      console.error("Error deleting panel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- SAVE PANEL -------------------- */

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsLoading(true);

    const payload = {
      title: formData.name,
      tags: formData.tags,
    };

    try {
      if (editingPanelId) {
        // UPDATE existing panel
        const res = await updatePanel(editingPanelId, payload);

        if (!res.success) {
          console.error("Update failed:", res.error);
          return;
        }

        // Update local state
        setCustomPanels((prev) =>
          prev.map((p) =>
            p.id === editingPanelId ? res.data : p
          )
        );
      } else {
        // CREATE new panel
        const res = await createPanel(payload);

        if (!res.success) {
          console.error("Create failed:", res.error);
          return;
        }

        // Add to local state
        setCustomPanels((prev) => [...prev, res.data]);
      }

      // Close dialog and reset
      setIsDialogOpen(false);
      resetForm();

      // Refresh to sync with server
      router.refresh();
    } catch (error) {
      console.error("Error saving panel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 space-y-12">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tags Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your analysis tags. Core system tags are fixed, but you can
          create your own panels below.
        </p>
      </div>

      {/* CORE SYSTEM TAGS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Core System Tags</h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-4">
          {Categories.map((category, idx) => (
            <Card
              key={idx}
              className="bg-muted/30 border-dashed border-2 opacity-90 relative overflow-hidden mb-6 mx-1 break-inside-avoid"
            >
              <div className="absolute top-2 right-2 text-muted-foreground/20">
                <Lock className="w-12 h-12" />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-muted-foreground">
                  {category.name}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.events.map((event) => (
                    <Badge
                      key={event}
                      variant="outline"
                      className="cursor-not-allowed bg-background text-muted-foreground hover:bg-background"
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* CUSTOM PANELS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Custom Panels</h2>
          </div>

          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Panel
          </Button>
        </div>

        {customPanels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/10 border-dashed">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No custom panels yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm text-center mt-1 mb-4">
              Create a new panel to start adding your own tracking events and
              tags.
            </p>
            <Button size="sm" variant="outline" onClick={handleOpenCreate}>
              Create your first panel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customPanels.map((panel) => (
              <Card
                key={panel.id}
                className="relative group hover:shadow-md transition-all"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {panel.title}
                  </CardTitle>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        disabled={isLoading}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(panel)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(panel.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {panel.tags.length > 0 ? (
                      panel.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No tags in this panel.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* DIALOG: CREATE / EDIT */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPanelId ? "Edit Panel" : "Create New Panel"}
            </DialogTitle>
            <DialogDescription>
              Organize your custom tags into a named group.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="panel-name">Panel Name</Label>
              <Input
                id="panel-name"
                placeholder="e.g. Set Pieces"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                tags={formData.tags}
                setTags={(tags) => setFormData({ ...formData, tags })}
                placeholder="Type tag name and press Enter..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingPanelId ? "Saving..." : "Creating..."}
                </>
              ) : editingPanelId ? (
                "Save Changes"
              ) : (
                "Create Panel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}