import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DateSlice, createDateSlice } from './date.slice';
import { GuestSlice, createGuestSlice } from './guest.clice';
import { PersonSlice, createPersonSlice } from './person.slice';
import { ConfirmationSlice, createConfirmationSlice } from './confirmation.slice';

type ShareState = PersonSlice & GuestSlice & DateSlice & ConfirmationSlice

export const useWeddingBoundStore = create<ShareState>()(
    devtools((...a) => ({
        ...createPersonSlice(...a),
        ...createGuestSlice(...a),
        ...createDateSlice(...a),
        ...createConfirmationSlice(...a),
    }))
);
