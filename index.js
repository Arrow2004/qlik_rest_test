import express from 'express';
import cors  from 'cors';
import axios from 'axios'
import https from 'https';

const app = express();

// Enable CORS
app.use(cors('*'));

// Middlewaasare
app.use(express.json());

// Simple route
app.get('/', (req, res) => {
    res.json({
        message: 'Hello, world!',
        status: 'success'
    });
});



async function fetchAllPagesAxios(initialUrl, params = {}) {
    let allData = [];
    let url = initialUrl;
    try {
        while (url) {
            const response = await axios.get(url, {
                params,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                },
                timeout: 5000,
                insecureHTTPParser: true
            });

            const data = response.data;
            // If DRF format
            if (data) {
                allData.push(...data.results);
                url = data.next;   // next page URL
                params = {};       // IMPORTANT: next already contains params
            } else {
                // fallback (non-paginated)
                allData.push(...data);
                break;
            }
        }

        return allData;

    } catch (error) {
        console.error('Pagination error:', error.message);
        throw error;
    }
}
// Route using Axios (example: fetch external data)
app.post('/api/getStat', async (req, res) => {
    try {
        let {endPoint,date_from,date_to} = { ...req.body };
        console.log(endPoint, date_from, date_to);
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        const url = `https://tgbot.cbu.uz/api/v1/apply-jobs/${endPoint}/?date_from=${date_from}&date_to=${date_to}&format=json`;
        
        const response = await axios.get(url, { insecureHTTPParser: true });
        console.log(response.data);
        res.json({
            status: 'success',
            data: response.data
        });
    } catch (error) {
        console.log(req.body)
        console.log(error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});
app.get('/api/getStat', async (req, res) => {
    try {
        res.json({
            status: 'success',
            message: 'GET request received'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});
app.post('/api/getAll', async (req, res) => {
     try {
 
        const url = `https://tgbot.cbu.uz/api/v1/apply-jobs/?format=json`;

        const allData = await fetchAllPagesAxios(url);

        res.json({
            status: 'success',
            data: allData
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});
Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
module.exports = app;