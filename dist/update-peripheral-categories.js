"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
/**
 * This script updates component categories to ensure peripheral categories
 * have the correct type value (peripheral).
 */
function updatePeripheralCategories() {
    return __awaiter(this, void 0, void 0, function () {
        var peripheralCategoryNames, result, updatedCategories, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 6]);
                    console.log('Starting update of peripheral categories...');
                    peripheralCategoryNames = [
                        'Keyboard', 'Mouse', 'Headphones',
                        'Monitor', 'Speakers', 'Camera',
                        'Microphone', 'Gamepad', 'MousePad'
                    ];
                    return [4 /*yield*/, prisma.componentCategory.updateMany({
                            where: {
                                name: {
                                    in: peripheralCategoryNames
                                }
                            },
                            data: {
                                type: 'peripheral'
                            }
                        })];
                case 1:
                    result = _a.sent();
                    console.log("Successfully updated ".concat(result.count, " peripheral categories"));
                    return [4 /*yield*/, prisma.componentCategory.findMany({
                            where: {
                                type: 'peripheral'
                            }
                        })];
                case 2:
                    updatedCategories = _a.sent();
                    console.log('Peripheral categories after update:');
                    updatedCategories.forEach(function (cat) {
                        console.log("- ".concat(cat.name, " (").concat(cat.slug, ")"));
                    });
                    return [2 /*return*/, result];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error updating peripheral categories:', error_1);
                    throw error_1;
                case 4: return [4 /*yield*/, prisma.$disconnect()];
                case 5:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Run the script
updatePeripheralCategories()
    .then(function () {
    console.log('Peripheral category update completed');
    process.exit(0);
})
    .catch(function (error) {
    console.error('Failed to update peripheral categories:', error);
    process.exit(1);
});
