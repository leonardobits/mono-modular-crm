import { Card } from "@/components/ui/card";

const queues = [
  { name: "WhatsApp", conversations: 10 },
  { name: "Instagram", conversations: 5 },
  { name: "Facebook", conversations: 2 },
  { name: "Chat Web", conversations: 1 },
  { name: "E-mail", conversations: 3 },
];

export default function InboxesPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col p-4 gap-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-2">Filas</h1>
      <div className="flex gap-2 mb-4">
        <button className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-medium">Todos</button>
        <button className="px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium">Abertos</button>
        <button className="px-3 py-1 rounded bg-muted text-muted-foreground text-sm font-medium">Fechados</button>
      </div>
      <section className="flex flex-col gap-2">
        {queues.map((queue) => (
          <Card key={queue.name} className="flex items-center justify-between p-4">
            <span className="font-medium">{queue.name}</span>
            <span className="text-xs text-muted-foreground">{queue.conversations} conversas</span>
          </Card>
        ))}
      </section>
      <button className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-2xl">+</button>
    </main>
  );
} 