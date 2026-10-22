import { ApiError } from '../utils/APIerrors.js';

const rateLimitMap = new Map();

/**
 * Custom Rate Limiting Middleware
 * @param {Object} options 
 * @param {number} options.windowMs - Time window in milliseconds (default: 1 min)
 * @param {number} options.max - Maximum requests allowed per IP per window
 */
export const rateLimiter = ({ windowMs = 60 * 1000, max = 5 } = {}) => {
    // Clean up expired IP entries every window duration
    setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of rateLimitMap.entries()) {
            if (now - record.startTime >= windowMs) {
                rateLimitMap.delete(ip);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() 
            || req.ip 
            || req.socket.remoteAddress;

        const now = Date.now();
        const record = rateLimitMap.get(clientIp);

        // 1. New client or expired window -> reset tracking
        if (!record || (now - record.startTime >= windowMs)) {
            rateLimitMap.set(clientIp, { count: 1, startTime: now });

            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', max - 1);
            return next();
        }

        // 2. Limit exceeded -> throw ApiError(429) for global error handler
        if (record.count >= max) {
            const retryAfterSeconds = Math.ceil((record.startTime + windowMs - now) / 1000);

            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('Retry-After', retryAfterSeconds);

            throw new ApiError(
                429, 
                `Too many requests. Please try again in ${retryAfterSeconds} seconds.`
            );
        }

        // 3. Increment request count within valid window
        record.count += 1;
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - record.count);

        next();
    };
};