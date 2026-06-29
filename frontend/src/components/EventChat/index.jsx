import { useState } from "react";

export default function EventChat({ initialParticipants = [], initialMessages = [] }) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [messages, setMessages] = useState(initialMessages);
  const [newParticipant, setNewParticipant] = useState("");
  const [newMessage, setNewMessage] = useState("");

  function addParticipant() {
    const trimmed = newParticipant.trim();
    if (!trimmed) return;
    setParticipants((current) => [
      ...current,
      { id: Date.now(), name: trimmed },
    ]);
    setNewParticipant("");
  }

  function sendMessage() {
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "Você", text: trimmed },
    ]);
    setNewMessage("");
  }

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Chat do evento</p>
          <h2 className="text-2xl font-semibold text-white">Converse com participantes</h2>
        </div>
        <div className="rounded-2xl bg-slate-950/90 px-4 py-2 text-sm text-slate-300">
          {participants.length} participantes
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.65fr]">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Adicionar participante</label>
          <div className="flex gap-2">
            <input
              value={newParticipant}
              onChange={(event) => setNewParticipant(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none focus:border-fuchsia-500"
              placeholder="Nome do participante"
            />
            <button
              type="button"
              onClick={addParticipant}
              className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Adicionar
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Participantes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {participants.map((participant) => (
              <span
                key={participant.id}
                className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-300"
              >
                {participant.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((message) => {
          const isMe = message.sender === "Você";
          return (
            <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-3xl p-4 max-w-[70%] ${
                  isMe
                    ? "bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 text-white"
                    : "bg-slate-950/80 text-slate-300"
                }`}
              >
                <p className={`text-sm font-semibold ${isMe ? "text-white text-right" : "text-white text-left"}`}>
                  {message.sender}
                </p>
                <p className={`mt-1 text-sm ${isMe ? "text-white text-right" : "text-slate-300 text-left"}`}>
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <input
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500"
          placeholder="Enviar mensagem"
        />
        <button
          type="button"
          onClick={sendMessage}
          className="rounded-2xl bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Enviar
        </button>
      </div>
    </section>
  );
}
