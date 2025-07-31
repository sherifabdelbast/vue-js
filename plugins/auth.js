import { useUser, useAuth } from "~/composables/useAuth";

export default defineNuxtPlugin(async () => {
  const user = useUser();
  const { fetchCurrentUser } = useAuth();

  // Skip if already initialized on server
  if (user.value !== undefined) return;

  user.value = await fetchCurrentUser();
});
