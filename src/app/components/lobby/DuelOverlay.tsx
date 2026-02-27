interface Props {
  challengeStack: { id: string; name: string }[];
  onAccept: () => void;
  onDecline: () => void;
}

export default function DuelOverlay({ challengeStack, onAccept, onDecline }: Props) {
  if (challengeStack.length === 0) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black text-white p-6 flex flex-col justify-center items-center text-center">
      <p className="text-xs font-black uppercase text-red-500 mb-2">Incoming Duel ({challengeStack.length})</p>
      <h3 className="text-xl font-black uppercase italic mb-6 truncate w-full">{challengeStack[0].name}</h3>
      <div className="flex flex-col gap-3 w-full">
        <button onClick={onAccept} className="bg-white text-black py-3 font-black uppercase hover:bg-green-400">Accept</button>
        <button onClick={onDecline} className="border-2 border-white py-2 font-black uppercase hover:bg-red-600">Decline</button>
      </div>
    </div>
  );
}