export const useUser = () => {
    return useState("user", () => undefined);
};

export const useAuth = () => {
    const router = useRouter();

    const user = useUser();
    const isLoggedIn = computed(() => !!user.value);

    async function refresh() {
        try {
            user.value = await fetchCurrentUser();
        } catch {
            user.value = null;
        }
    }

    const join = async (credentials) => await $larafetch("/join", {
        method: "post",
        body: credentials
    });

    const checkIdentify = async (credentials) => await $larafetch("/welcome", {
        method: "post",
        body: credentials
    });

    const login = async (credentials) => {
        if (isLoggedIn.value) return;

        const response = await $larafetch("/login", {method: "post", body: credentials});
        await refresh();
        return response;
    }

    const complete = async (credentials) => {
        const response = await $larafetch("/register-complete", {
            method: "post",
            body: credentials
        });
        await refresh();
        return response;
    }

    const checkToken = async (credentials) => await $larafetch("/check-token", {
        method: "post",
        body: credentials
    });

    const logout = async () => {
        if (!isLoggedIn.value) return;

        await $larafetch("/api/logout", {method: "post"});
        user.value = null;

        await navigateTo("/login");
    }

    const forgotPassword = async (credentials) => await $larafetch("/forget-password", {
        method: "post",
        body: credentials,
    });

    const checkForgotPasswordCode = async (credentials) => await $larafetch("/check-code", {
        method: "post",
        body: credentials,
    });

    const resetPassword = async (credentials) => await $larafetch("/reset-password", {
        method: "post",
        body: credentials,
    });

    const changePassword = async (userId, credentials) => await $larafetch(`/api/profile/${userId}/change-password`, {
        method: "post",
        body: credentials,
    });

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
        resetPassword
    };
};
export const fetchCurrentUser = async () => {
    try {
        return await $larafetch("/api/user", {
            redirectIfNotAuthenticated: false,
        });
    } catch (error) {
        if ([401, 419].includes(error?.response?.status)) return null;
        throw error;
    }
};
