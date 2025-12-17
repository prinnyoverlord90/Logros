"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRedeem = exports.validateUser = exports.validateReward = exports.validateAchievement = void 0;
const joi_1 = __importDefault(require("joi"));
const validateAchievement = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
        points: joi_1.default.number().integer().min(1).required(),
        category: joi_1.default.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error)
        return res.status(400).json({ error: error.details[0].message });
    next();
};
exports.validateAchievement = validateAchievement;
const validateReward = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
        cost: joi_1.default.number().integer().min(1).required()
    });
    const { error } = schema.validate(req.body);
    if (error)
        return res.status(400).json({ error: error.details[0].message });
    next();
};
exports.validateReward = validateReward;
const validateUser = (req, res, next) => {
    const schema = joi_1.default.object({
        twitchId: joi_1.default.string().required(),
        username: joi_1.default.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error)
        return res.status(400).json({ error: error.details[0].message });
    next();
};
exports.validateUser = validateUser;
const validateRedeem = (req, res, next) => {
    const schema = joi_1.default.object({
        rewardId: joi_1.default.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error)
        return res.status(400).json({ error: error.details[0].message });
    next();
};
exports.validateRedeem = validateRedeem;
