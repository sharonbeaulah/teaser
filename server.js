const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

// Initialize the express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(require("cors")());

// POST route to store user data
app.post("/store-data", (req, res) => {
    const { email, timer } = req.body;

    if (!email || !timer) {
        return res.status(400).json({ error: "Email and timer are required." });
    }

    const userData = {
        email: email.trim().toLowerCase(),
        timer,
        timestamp: new Date().toISOString(),
    };

    fs.readFile("data.json", "utf8", (err, data) => {
        if (err && err.code !== "ENOENT") {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Failed to read data." });
        }

        let existingData = [];
        if (data) {
            try {
                existingData = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing JSON:", parseErr);
                return res.status(500).json({ error: "Invalid JSON format in file." });
            }
        }

        const emailExists = existingData.some(
            (entry) => entry.email.trim().toLowerCase() === userData.email
        );

        if (emailExists) {
            return res.status(200).json({ message: "Email already exists. Data not stored again." });
        }

        const updatedData = [...existingData, userData];

        fs.writeFile("data.json", JSON.stringify(updatedData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to file:", writeErr);
                return res.status(500).json({ error: "Failed to store data." });
            }
            res.status(200).json({ success: "Data stored successfully!" });
        });
    });
});

// GET route to retrieve stored data
app.get("/get-data", (req, res) => {
    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Failed to retrieve data." });
        }
        res.status(200).json(JSON.parse(data || "[]"));
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
