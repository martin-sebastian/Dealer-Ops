import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/** Placeholder Sales section. Inventory and deals land here later. */
export function SalesPage() {
  return (
    <div className="p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Sales</CardTitle>
          <CardDescription>
            Major units, quotes, and web listings. Print Center is a separate
            top-level section — it is not nested under Sales.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          This AppShell slot is reserved for sales work. Field values from the
          `mu` table are available to Print Center without joining other
          modules.
        </CardContent>
      </Card>
    </div>
  )
}
