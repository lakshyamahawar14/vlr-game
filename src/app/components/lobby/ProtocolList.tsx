export default function ProtocolList() {
  const protocols = [
    { id: "01", title: "Budgeting", desc: "Players are capped at a $100 spending limit." },
    { id: "02", title: "Selection", desc: "You must draft a complete roster of five players." },
    { id: "03", title: "Global Pool", desc: "Both users pick from the same live player pool." },
    { id: "04", title: "The Sniped", desc: "If your opponent picks a player first, you lose them." },
    { id: "05", title: "Victory", desc: "The manager with the highest total roster value wins." },
  ];

  return (
    <div className="w-full lg:w-80 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-6 flex flex-col bg-gray-50">
      <h2 className="text-xl font-black uppercase mb-6 border-b-2 border-black pb-1 italic">DRAFT PROTOCOL</h2>
      <ul className="space-y-6">
        {protocols.map((p) => (
          <li key={p.id} className="flex gap-4">
            <span className="font-black text-xl">{p.id}</span>
            <div>
              <p className="text-[11px] font-black uppercase text-red-500 mb-0.5">{p.title}</p>
              <p className="text-[13px] font-black uppercase leading-tight text-gray-700">{p.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}