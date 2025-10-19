"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  CircleUserRoundIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"

import { useFileUpload } from "@/hooks/use-file-upload"
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Button } from "../ui/button"

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number }

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous") // Needed for canvas Tainted check
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) return null

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg")
    })
  } catch (error) {
    console.error("Error in getCroppedImg:", error)
    return null
  }
}

export default function ImageCropperForm() {
  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
  })

  const previewUrl = files[0]?.preview || null
  const fileId = files[0]?.id

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [zoom, setZoom] = useState(1)
  const previousFileIdRef = useRef<string | undefined | null>(null)

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleApply = async () => {
    // if (!previewUrl || !fileId || !croppedAreaPixels) return

    // Check if we have the necessary data
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      console.error("Missing data for apply:", {
        previewUrl,
        fileId,
        croppedAreaPixels,
      })
      // Remove file if apply is clicked without crop data?
      if (fileId) {
        removeFile(fileId)
        setCroppedAreaPixels(null)
      }
      return
    }

    try {
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels)
      if (!croppedBlob) throw new Error("Failed to generate cropped image blob.")

      const newFinalUrl = URL.createObjectURL(croppedBlob)
      if (finalImageUrl) URL.revokeObjectURL(finalImageUrl)
      setFinalImageUrl(newFinalUrl)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error during apply:", error)
      setIsDialogOpen(false)
    }
  }

  const handleRemoveFinalImage = () => {
    if (finalImageUrl) URL.revokeObjectURL(finalImageUrl)
    setFinalImageUrl(null)
  }

  useEffect(() => {
    const currentFinalUrl = finalImageUrl
    return () => {
      if (currentFinalUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl)
      }
    }
  }, [finalImageUrl])

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true)
      setCroppedAreaPixels(null)
      setZoom(1)
    }
    previousFileIdRef.current = fileId
  }, [fileId])

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="relative inline-flex">
        {/* Drop area with click-to-upload */}
        <label
          htmlFor="fileInput"
          // className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border border-dashed border-input transition-colors outline-none hover:bg-accent/50 cursor-pointer has-[img]:border-none data-[dragging=true]:bg-accent/50"
          className="bg-background dark:bg-input/30 border-input border border-dashed shadow-xs relative flex size-28 items-center justify-center overflow-hidden rounded-full transition-[color,box-shadow] outline-none hover:bg-accent/50 cursor-pointer has-[img]:border-none data-[dragging=true]:bg-accent/50"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
        >
          {finalImageUrl ? (
            <img
              className="size-full object-cover"
              src={finalImageUrl}
              alt="User avatar"
              width={64}
              height={64}
            />
          ) : (
            <CircleUserRoundIcon className="size-6 opacity-60" />
          )}
        </label>

        {/*  Hidden input triggers file selection */}
        <input
          {...getInputProps()}
          id="fileInput"
          type="file"
          className="sr-only"
          aria-label="Upload image file"
        />

        {/* Remove button */}
        {finalImageUrl && (
          <Button
            variant="destructive"
            onClick={handleRemoveFinalImage}
            size="icon"
            className="absolute -top- right-1 size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background bg-destructive-saturated"
            aria-label="Remove image"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Cropper Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Crop image</span>
              </div>
              <Button
                size="sm"
                className="-my-1"
                onClick={handleApply}
                disabled={!previewUrl}
                autoFocus
              >
                Apply
              </Button>
            </DialogTitle>
          </DialogHeader>

          {previewUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={previewUrl}
              zoom={zoom}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea className="rounded-full" />
            </Cropper>
          )}

          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              {/* <ZoomOutIcon className="shrink-0 opacity-60" size={16} />
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
              />
              <ZoomInIcon className="shrink-0 opacity-60" size={16} /> */}
              <Slider
                defaultValue={[1]}
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                aria-label="Zoom slider"
              />
              <output className="block w-10 shrink-0 text-right font-mono text-sm font-medium tabular-nums">
                {parseFloat(zoom.toFixed(1))}x
              </output>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="mt-2 text-xs text-muted-foreground">
        Drag and drop or click to choose any image you want
      </p>
    </div>
  )
}
