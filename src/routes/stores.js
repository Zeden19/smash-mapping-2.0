import {writable} from "svelte/store";

// Filters
export const startDate = writable(new Date().toISOString().split("T")[0]);
export const endDate = writable(new Date().setDate(new Date().getDate() + 7));
export const country = writable()
export const minAttendees = writable(0)
export const state = writable();
export const game = writable();

// Result/Error Messages
export const loading = writable(false);
export const errorMessage = writable(false);
export const tooManyRequestsError = writable(false);
export const noData = writable(false);
export const playerDoesNotExistError = writable(false);
export const locationDeniedError = writable(false)

// player or country or location search
export const showSearchPlayer = writable(false);
export const showSearchTournament = writable(true);
export const useCurrentLocationSearch = writable(false);

// Search variables
export const selectedPlayer = writable("");
export const search = writable("");
export const circles = writable([]);
export const radius = writable();

// Misc
export const mapResult = writable();