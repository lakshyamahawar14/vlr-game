const ID_KEY = "vlr_duel_id";
const NAME_KEY = "vlr_duel_username";

export const getStoredUser = () => {
  if (typeof window === "undefined") return { id: "", name: "" };

  let id = localStorage.getItem(ID_KEY);
  let name = localStorage.getItem(NAME_KEY);

  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
    
    localStorage.setItem(ID_KEY, id);
  }

  if (!name) {
    name = `PLAYER_${id.slice(0, 4)}`.toUpperCase();
    localStorage.setItem(NAME_KEY, name);
  }

  return { id, name };
};

export const setStoredName = (newName: string) => {
  if (typeof window !== "undefined") {
    const formattedName = newName.trim().toUpperCase() || "ANONYMOUS";
    localStorage.setItem(NAME_KEY, formattedName);
    return formattedName;
  }
  return newName;
};