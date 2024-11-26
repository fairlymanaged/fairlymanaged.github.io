const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const rateLimit = require('express-rate-limit');

const app = express();
const port = 443;

const limiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 5 // limit each IP to 5 requests per windowMs
});

var privateKey = fs.readFileSync(__dirname + '../../../private-key.pem', 'utf8');
var certificate = fs.readFileSync(__dirname + '../../../cert.crt', 'utf8');

var httpsServer = https.createServer(
    {
        key: privateKey,
        cert: certificate
    }
    , app);

httpsServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

var foundFiles = [];
const ipIndexMap = {}; // Map to store IPs and their corresponding indices

function getImage(files, ip) {
    if (!ipIndexMap[ip]) {
        ipIndexMap[ip] = 0;
    }
    const index = ipIndexMap[ip];
    const image = files[index];

    // Update the index for the next request
    ipIndexMap[ip] = (index + 1) % files.length;

    return image;
}

app.get('/getFriend', limiter, (req, res) => {
    const imagesDir = path.join(__dirname, 'friend-images');
    if (foundFiles.length > 0) {
        serveImage(req, foundFiles, res);
    } else {
        fs.readdir(imagesDir, (err, files) => {
            if (err) {
                return res.status(500).send('Unable to scan directory');
            }

            foundFiles = files;
            serveImage(req, foundFiles, res);
        });
    }
});

function serveImage(req, files, res) {
    const image = getImage(files, req.ip);
    const imagePath = path.join(__dirname, 'friend-images', image);
    console.log("serving image to ip: " + req.ip);
    return res.sendFile(imagePath);
}