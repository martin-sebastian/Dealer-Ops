import { BoldIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { getField } from "@/data/fields"
import type { LayoutElement, TextElement } from "@/lib/layout"

type StyleBarProps = {
  element: LayoutElement | null
  onChange: (patch: Partial<TextElement>) => void
  onToggleSnap: (snap: boolean) => void
  onDelete: () => void
}

/**
 * Font size, bold/normal, color, and per-element snap for the one selected
 * canvas item. Image elements only expose snap and delete.
 */
export function StyleBar({
  element,
  onChange,
  onToggleSnap,
  onDelete,
}: StyleBarProps) {
  if (!element) {
    return (
      <p className="text-sm text-muted-foreground">
        Select one element to edit font size, weight, and color.
      </p>
    )
  }

  const field = getField(element.fieldId)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-medium">{field?.label ?? element.fieldId}</p>
      {element.kind === "text" ? (
        <>
          <div className="flex w-40 items-center gap-2">
            <Label className="text-xs text-muted-foreground">Size</Label>
            <Slider
              min={8}
              max={72}
              value={[element.fontSize]}
              onValueChange={(value) => {
                const size = Array.isArray(value) ? value[0] : value
                onChange({ fontSize: size })
              }}
            />
            <span className="w-8 text-xs tabular-nums">{element.fontSize}</span>
          </div>
          <Toggle
            pressed={element.bold}
            onPressedChange={(pressed) => onChange({ bold: pressed })}
            aria-label="Bold"
          >
            <BoldIcon />
          </Toggle>
          <Input
            className="h-8 w-10 p-1"
            type="color"
            value={element.color}
            onChange={(event) => onChange({ color: event.target.value })}
            aria-label="Color"
          />
        </>
      ) : (
        <span className="text-xs text-muted-foreground">CDN image field</span>
      )}
      <div className="flex items-center gap-2">
        <Switch
          checked={element.snap}
          onCheckedChange={onToggleSnap}
          aria-label="Snap to grid while dragging"
        />
        <Label className="text-xs">Snap while dragging</Label>
      </div>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        <Trash2Icon />
        Remove
      </Button>
    </div>
  )
}
