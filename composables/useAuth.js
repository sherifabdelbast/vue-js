export const useUser = () => {
  return useState("user", () => undefined);
};

export const useAuth = () => {
  const router = useRouter();
  const user = useUser();
  const isLoggedIn = computed(() => !!user.value);

  // Fetch CSRF token
  const getCsrfToken = async () => {
    try {
      await $larafetch(
        "https://taskat-app.up.railway.app/sanctum/csrf-cookie",
        {
          method: "GET",
          credentials: "include",
          mode: "cors",
        }
      );
      const token = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1] || ""
      );
      if (!token) throw new Error("No CSRF token found");
      return token;
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      throw error;
    }
  };

  // Fetch current user with Bearer token
  const fetchCurrentUser = async () => {
    try {
      const token = useCookie("auth_token");
      if (!token.value) return null;
      return await $larafetch("https://taskat-app.up.railway.app/api/user", {
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
    const token = await getCsrfToken();
    const response = await $larafetch(
      "https://taskat-app.up.railway.app/login",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      }
    );
    useCookie("auth_token", response.token); // Adjust based on response structure
    await refresh();
    return response;
  };

  const join = async (credentials) => {
    const token = await getCsrfToken();
    return await $larafetch("https://taskat-app.up.railway.app/join", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token,
      },
      body: credentials,
      credentials: "include",
      mode: "cors",
    });
  };

  const checkIdentify = async (credentials) => {
    const token = await getCsrfToken();
    return await $larafetch("https://taskat-app.up.railway.app/welcome", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token,
      },
      body: credentials,
      credentials: "include",
      mode: "cors",
    });
  };

  const complete = async (credentials) => {
    const token = await getCsrfToken();
    const response = await $larafetch(
      "https://taskat-app.up.railway.app/register-complete",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      }
    );
    useCookie("auth_token", response.token); // Adjust based on response
    await refresh();
    return response;
  };

  const checkToken = async (credentials) => {
    const token = await getCsrfToken();
    return await $larafetch("https://taskat-app.up.railway.app/check-token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token,
      },
      body: credentials,
      credentials: "include",
      mode: "cors",
    });
  };

  const logout = async () => {
    if (!isLoggedIn.value) return;
    const token = await getCsrfToken();
    const authToken = useCookie("auth_token");
    await $larafetch("https://taskat-app.up.railway.app/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token,
      },
      credentials: "include",
      mode: "cors",
    });
    user.value = null;
    useCookie("auth_token", null); // Clear token
    await navigateTo("/login");
  };

  const forgotPassword = async (credentials) => {
    const token = await getCsrfToken();
    return await $larafetch(
      "https://taskat-app.up.railway.app/forget-password",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      }
    );
  };

  const checkForgotPasswordCode = async (credentials) => {
    const token = await getCsrfToken();
    return await $larafetch("https://taskat-app.up.railway.app/check-code", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": token,
      },
      body: credentials,
      credentials: "include",
      mode: "cors",
    });
  };

  const resetPassword = async (credentials) => {
    const token = await getCsrfToken();
    return await $larafetch(
      "https://taskat-app.up.railway.app/reset-password",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      }
    );
  };

  const changePassword = async (userId, credentials) => {
    const token = await getCsrfToken();
    const authToken = useCookie("auth_token");
    return await $larafetch(
      `https://taskat-app.up.railway.app/api/profile/${userId}/change-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken.value}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": token,
        },
        body: credentials,
        credentials: "include",
        mode: "cors",
      }
    );
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
  };
};
