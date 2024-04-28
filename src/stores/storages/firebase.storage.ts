import { StateStorage, createJSONStorage } from 'zustand/middleware';

const firebaseUrl =
    'https://zustand-storage-amt-default-rtdb.europe-west1.firebasedatabase.app/zustand';

const storageAPI: StateStorage = {
    getItem: async function (name: string): Promise<string | null> {
        // eslint-disable-next-line no-useless-catch
        try {
            const data = await fetch(`${firebaseUrl}/${name}.json`).then(
                (res) => res.json()
            );
            //^NOTE: esta data debe de ser un string
            return JSON.stringify(data); //tenemos que grabarlo asi, si lo hacemos solo con data no funciona
        } catch (error) {
            throw error;
        }
    },
    setItem: async function (name: string, value: string): Promise<void> {
        const data = await fetch(`${firebaseUrl}/${name}.json`, {
            method: 'PUT',
            body: value,
        }).then((res) => res.json());
        console.log(data);
        return;
    },
    removeItem: function (name: string): void | Promise<void> {
        // throw new Error('Function not implemented.');
        console.log('removeitem', name);
    },
};

export const firebaseStorage = createJSONStorage(() => storageAPI);
