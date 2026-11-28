import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/** Placeholder Service section. Repair orders land here later. */
export function ServicePage() {
  return (
    <div className="p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Service</CardTitle>
          <CardDescription>
            Repair orders and shop status. Print Center stays outside this
            section.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          RO fields from the `ro` table can be dropped onto print templates.
          No joins to sales or customer records in phase one.
        </CardContent>
      </Card>
    </div>
  )
}
