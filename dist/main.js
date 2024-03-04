"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.checkExistence = void 0;
const core = __importStar(require("@actions/core"));
const glob_1 = __importDefault(require("glob"));
async function checkExistence(pattern) {
    const globOptions = {
        follow: !((core.getInput('follow_symlinks') || 'true').toUpperCase() === 'FALSE'),
        nocase: (core.getInput('ignore_case') || 'false').toUpperCase() === 'TRUE'
    };
    return new Promise((resolve, reject) => {
        (0, glob_1.default)(pattern, globOptions, (err, files) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(files.length > 0);
            }
        });
    });
}
exports.checkExistence = checkExistence;
async function run() {
    try {
        const files = core.getInput('files', { required: true });
        const allow_failure = (core.getInput('allow_failure') || 'false').toUpperCase() === 'TRUE';
        if (core.getInput('allow_failure')) {
            core.warning(`❗The "allow_failure" variable is deprecated in favor of "fail"`);
        }
        const failure = (core.getInput('fail') || 'false').toUpperCase() === 'TRUE' ||
            allow_failure;
        const fileList = files
            .split(',')
            .map((item) => item.trim());
        const missingFiles = [];
        // Check in parallel
        await Promise.all(fileList.map(async (file) => {
            const isPresent = await checkExistence(file);
            if (!isPresent) {
                missingFiles.push(file);
            }
        }));
        if (missingFiles.length > 0) {
            if (failure) {
                core.setFailed(`These files don't exist: ${missingFiles.join(', ')}`);
            }
            else {
                core.info(`These files don't exist: ${missingFiles.join(', ')}`);
            }
            core.setOutput('files_exists', 'false');
        }
        else {
            core.info('🎉 All files exist');
            core.setOutput('files_exists', 'true');
        }
    }
    catch (error) {
        if (!(error instanceof Error)) {
            throw error;
        }
        core.setFailed(error.message);
    }
}
exports.run = run;
//# sourceMappingURL=main.js.map