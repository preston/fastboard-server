// Author: Preston Lee

import * as fs from 'fs';
import path from 'path';
import { Ajv2020 } from 'ajv/dist/2020';

export class DataValidator {

    public ajv;

    static DASHBOARD_DATA_SCHEMA_FILE = path.join(path.dirname(__filename), '..', 'data', 'schemas', 'dashboard.json');
    static SETTINGS_DATA_SCHEMA_FILE = path.join(path.dirname(__filename), '..', 'data', 'schemas', 'settings.json');
    static DASHBOARD_DATA_SCHEMA = fs.readFileSync(DataValidator.DASHBOARD_DATA_SCHEMA_FILE).toString();
    static SETTINGS_DATA_SCHEMA = fs.readFileSync(DataValidator.SETTINGS_DATA_SCHEMA_FILE).toString();
    public dashboardDataValidator;
    public settingsDataValidator;


    constructor() {
        this.ajv = new Ajv2020({ allErrors: true });
        // this.ajv.addMetaSchema(require('ajv/lib/refs/json-schema-2019-09/schema.json'));
        this.dashboardDataValidator = this.ajv.compile(this.dashboardDataSchema());
        this.settingsDataValidator = this.ajv.compile(this.settingsDataSchema());
    }

    // FIXME Race condition here! Needs a mutex or similar.
    validateDashboardData(data: string) {
        if (this.dashboardDataValidator(data)) {
            return null;
        } else {
            return this.dashboardDataValidator.errors;
        }
    }

    validateSettingsData(data: string) {
        if (this.settingsDataValidator(data)) {
            return null;
        } else {
            return this.settingsDataValidator.errors;
        }
    }

    dashboardDataSchema(): any {
        // console.log("Dashboard data schema:");
        // console.log(DataValidator.DASHBOARD_DATA_SCHEMA);
        return JSON.parse(DataValidator.DASHBOARD_DATA_SCHEMA);
    }

    settingsDataSchema(): any {
        // console.log("Settings data schema:");
        // console.log(DataValidator.SETTINGS_DATA_SCHEMA);
        return JSON.parse(DataValidator.SETTINGS_DATA_SCHEMA);
    }

}