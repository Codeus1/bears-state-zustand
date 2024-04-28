import { StateStorage, createJSONStorage } from "zustand/middleware";

 const storageAPI: StateStorage = {
    getItem: function (name: string): string | Promise<string | null> | null {
        const data = sessionStorage.getItem(name)
        return data;
    },
    setItem: function (name: string, value: string): void | Promise <void> {
        sessionStorage.setItem(name, value)
    },
    removeItem: function (name: string): void | Promise <void> {
        // throw new Error('Function not implemented.');
        console.log('removeitem', name);
    },
};

export const customSessionStorage =  createJSONStorage(() => storageAPI)