import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/** Placeholder AI Chat section. */
export function AiChatPage() {
  return (
    <div className="p-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>AI Chat</CardTitle>
          <CardDescription>
            Dealership assistant. Print Center is not part of this chat.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Chat wiring comes later. Use Print Center for hang tags, key tags,
          spec sheets, and brochures.
        </CardContent>
      </Card>
    </div>
  )
}
