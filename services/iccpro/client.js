const axios = require("axios");

const { getToken } = require("./auth");
const config = require("../../config");

const ICC = config.iccpro;

// ======================================================
// 🔎 ICC GET
// ======================================================
async function iccGet(path) {

    const token = await getToken();

    try {

        const response = await axios.get(
            `${ICC.baseUrl}${path}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: ICC.timeout
            }
        );

        return response.data;

    } catch (err) {

        const status = err.response?.status;
        const data = err.response?.data;

        console.error(
            `[ICC GET ERROR] ${path}`,
            status,
            data || err.message
        );

        throw err;
    }
}

module.exports = { iccGet };