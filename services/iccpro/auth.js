const axios = require("axios");
const config = require("../../config");

const ICC = config.iccpro;

let cache = {
    token: null,
    expire: 0
};

async function getToken() {

    const now = Date.now();

    // ==================================================
    // 🔥 TOKEN CACHE
    // ==================================================
    if (cache.token && now < cache.expire) {
        return cache.token;
    }

    try {

        const response = await axios.post(
            `${ICC.baseUrl}${ICC.tokenUrl}`,

            new URLSearchParams({
                grant_type: "password",
                username: ICC.username,
                password: ICC.password,
                client_id: ICC.clientId,
                client_secret: ICC.clientSecret
            }).toString(),

            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: ICC.timeout
            }
        );

        const data = response.data;

        if (!data.access_token) {
            console.error("[ICC AUTH INVALID RESPONSE]", data);
            throw new Error("ICC PRO auth failed");
        }

        cache.token = data.access_token;

        // 🔥 marge sécurité 1 min
        cache.expire =
            now + (data.expires_in * 1000) - 60000;

        console.log("🔐 ICC TOKEN OK");

        return cache.token;

    } catch (err) {

        console.error(
            "[ICC AUTH ERROR]",
            err.response?.data || err.message
        );

        throw err;
    }
}

module.exports = { getToken };