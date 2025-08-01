export const useUser = () => {
  return useState("user", () => undefined);
};

export const useAuth = () => {
  const router = useRouter();
  const user = useUser();
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendUrl;
  const isLoggedIn = computed(() => !!user.value);

  const getCsrfToken = async () => {
    try {
      await $larafetch(`${backendUrl}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        mode: "cors",
      });
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      throw new Error("Unable to fetch CSRF token");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = useCookie("auth_token");
      if (!token.value) return null;
      return await $larafetch(`${backendUrl}/api/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: "application/json",
        },
        credentials: "include",
        redirectIfNotAuthenticated: false,
      });
    } catch (error) {
      if ([401, 419].includes(error?.response?.status)) return null;
      throw error;
    }
  };

  const refresh = async () => {
    try {
      user.value = await fetchCurrentUser();
    } catch {
      user.value = null;
    }
  };

  const login = async (credentials) => {
    if (isLoggedIn.value) return;
    try {
      await getCsrfToken();
      const response = await $larafetch(`${backendUrl}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
      useCookie("auth_token").value = response.token;
      await refresh();
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const join = async (credentials) => {
    try {
      await getCsrfToken();
      const response = await $larafetch(`${backendUrl}/join`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
      console.log("Join response:", response);
      return response;
    } catch (error) {
      console.error("Join error:", error);
      throw error;
    }
  };

  const checkIdentify = async (credentials) => {
    try {
      await getCsrfToken();
      return await $larafetch(`${backendUrl}/welcome`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
    } catch (error) {
      console.error("Check identify error:", error);
      throw error;
    }
  };

  const complete = async (credentials) => {
    try {
      await getCsrfToken();
      const response = await $larafetch(`${backendUrl}/register-complete`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
      useCookie("auth_token").value = response.token;
      await refresh();
      return response;
    } catch (error) {
      console.error("Complete error:", error);
      throw error;
    }
  };

  const checkToken = async (credentials) => {
    try {
      await getCsrfToken();
      return await $larafetch(`${backendUrl}/check-token`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
    } catch (error) {
      console.error("Check token error:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!isLoggedIn.value) return;
    try {
      await getCsrfToken();
      const authToken = useCookie("auth_token");
      await $larafetch(`${backendUrl}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
      });
      user.value = null;
      useCookie("auth_token").value = null;
      await navigateTo("/login");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const forgotPassword = async (credentials) => {
    try {
      await getCsrfToken();
      return await $larafetch(`${backendUrl}/forget-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  };

  const checkForgotPasswordCode = async (credentials) => {
    try {
      await getCsrfToken();
      return await $larafetch(`${backendUrl}/check-code`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
    } catch (error) {
      console.error("Check forgot password code error:", error);
      throw error;
    }
  };

  const resetPassword = async (credentials) => {
    try {
      await getCsrfToken();
      return await $larafetch(`${backendUrl}/reset-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  };

  const changePassword = async (userId, credentials) => {
    try {
      await getCsrfToken();
      const authToken = useCookie("auth_token");
      return await $larafetch(
        `${backendUrl}/api/profile/${userId}/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken.value}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: credentials,
          credentials: "include",
          mode: "cors",
        }
      );
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  return {
    user,
    isLoggedIn,
    login,
    join,
    logout,
    forgotPassword,
    changePassword,
    refresh,
    complete,
    checkIdentify,
    checkToken,
    checkForgotPasswordCode,
    resetPassword,
    fetchCurrentUser,
  };
};
