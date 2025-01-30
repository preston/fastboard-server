// Author: Preston Lee

import fs from 'fs';
import path from 'path';
import express from "express";
import basicAuth from 'express-basic-auth';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { DataValidator } from './data_validator';

const my_version = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString()).version;


if (!process.env.FASTBOARD_SERVER_USERNAME) {
    console.error('FASTBOARD_SERVER_USERNAME must be set. Exiting, sorry!');
    process.exit(1);
}
if (!process.env.FASTBOARD_SERVER_PASSWORD) {
    console.error('FASTBOARD_SERVER_PASSWORD must be set. Exiting, sorry!');
    process.exit(1);
}
const app = express();

// Errors are not helpful to the user when doing this.
app.use(express.json({ limit: '100mb' }));
app.use(cors());

let validator = new DataValidator();

// Root URL
app.get('/', (req, res) => {
    res.json({
        message: "This server may be accessed via HTTP REST calls. You probably meant to call the /dashboards discovery endpoint instead.",
        datetime: Date.now(),
        version: my_version
    });
});


app.get('/schemas/dashboard.json', (req, res) => {
    res.status(200).send(fs.readFileSync(DataValidator.DASHBOARD_DATA_SCHEMA_FILE));
});

app.get('/schemas/settings.json', (req, res) => {
    res.status(200).send(fs.readFileSync(DataValidator.SETTINGS_DATA_SCHEMA_FILE));
});

// Requires authentication for all routes below this point.
const users: { [key: string]: string } = {};
users[process.env.FASTBOARD_SERVER_USERNAME as string] = process.env.FASTBOARD_SERVER_PASSWORD as string;
const auth = basicAuth({ users: users });

app.get('/dashboards', auth, (req, res) => {
    const response: any =
    {
        "dashboards": []
    }
    const base_path = path.join(__dirname, 'data', 'dashboards');
    fs.readdirSync(base_path).forEach(file => {
        let raw = fs.readFileSync(path.join(base_path, file)).toString();
        try {
            let json = JSON.parse(raw);
            let meta = {
                "id": file,
                "dashboard_name": json.dashboard_name,
                "updated_at": json.updated_at
            };
            response.dashboards.push(meta);
        } catch (error) {
            console.error("Error parsing dashboard file. It will be ignored.", file);

        }
    });
    res.json(response);
});

app.get('/dashboards/:id', auth, (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'dashboards', req.params.id));
        res.status(200).send(data);
        console.log('GET /dashboards/' + req.params.id);
    } catch (error) {
        console.error(error);
        res.status(404).send({ message: 'Dashboard not found.', id: req.params.id });
        console.error('GET /dashboards/' + req.params.id + ' failed.');

    }
});

app.post('/dashboards/:id', auth, (req, res) => {
    console.log('POST /dashboards/' + req.params.id);
    try {
        console.log(req.body);

        const json = req.body;// JSON.parse(req.body);
        const errors = validator.validateDashboardData(json);
        if (errors) {
            console.log(json);
            console.log('Validation failed', errors);
            res.status(400).json({ errors: errors });
        } else {
            console.log('Validation passed.');
            const file_path = path.join(__dirname, 'data', 'dashboards', req.params.id);
            console.log('Writing to ' + file_path);
            try {
                fs.writeFileSync(file_path, JSON.stringify(json, null, "\t"));
                res.status(200).send({ all: 'good' });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: 'Could not save data.', id: req.params.id, error: error });
            }
        }
    } catch (error) {
        console.log('Could not parse document as JSON.');
        res.status(400).send({ message: 'Could not parse document as JSON.' });
    }
});

app.delete('/dashboards/:id', auth, (req, res) => {
    try {
        const file_path = path.join(__dirname, 'data', 'dashboards', req.params.id);
        console.log('Deleting ' + file_path);        
        const data = fs.unlinkSync(file_path);
        res.status(200).send(data);
        console.log('DELETE /dashboards/' + req.params.id);
    } catch (error) {
        console.error(error);
        res.status(404).send({ message: 'Dashboard not found.', id: req.params.id });
        console.error('DELETE /dashboards/' + req.params.id + ' failed.');

    }
});

export default app;
