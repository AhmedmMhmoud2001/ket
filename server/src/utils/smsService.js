// SMS/WhatsApp Service for sending OTP

/**
 * Send OTP via SMS using Twilio
 * Note: You need to install twilio package and set up environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 * - TWILIO_WHATSAPP_NUMBER (for WhatsApp)
 */

let twilioClient = null;

// Initialize Twilio client if credentials are available
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const twilio = require('twilio');
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
} catch (error) {
    console.warn('Twilio not configured. SMS/WhatsApp will be disabled.');
}

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number in E.164 format (e.g., +966501234567)
 * @param {string} code - 6-digit OTP code
 * @param {string} method - 'sms' or 'whatsapp'
 * @returns {Promise<object>} - Result object
 */
exports.sendOTP = async (phone, code, method = 'sms') => {
    try {
        // Validate phone number format
        if (!phone.startsWith('+')) {
            throw new Error('Phone number must be in E.164 format (e.g., +966501234567)');
        }

        // Development mode - just log
        if (process.env.NODE_ENV === 'development' || !twilioClient) {
            console.log(`
┌─────────────────────────────────────┐
│  🔐 OTP CODE (Development Mode)     │
├─────────────────────────────────────┤
│  Phone: ${phone.padEnd(20)}       │
│  Code:  ${code}                     │
│  Method: ${method.toUpperCase().padEnd(18)} │
│  Valid for: 5 minutes               │
└─────────────────────────────────────┘
            `);
            
            return {
                success: true,
                message: 'OTP logged to console (development mode)',
                method: method,
                phone: phone
            };
        }

        // Production mode - send via Twilio
        const message = `Your verification code is: ${code}\n\nValid for 5 minutes.\n\n- FoodDash`;
        
        let result;
        
        if (method === 'whatsapp') {
            // Send via WhatsApp
            if (!process.env.TWILIO_WHATSAPP_NUMBER) {
                throw new Error('WhatsApp not configured');
            }
            
            result = await twilioClient.messages.create({
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${phone}`,
                body: message
            });
        } else {
            // Send via SMS
            if (!process.env.TWILIO_PHONE_NUMBER) {
                throw new Error('SMS not configured');
            }
            
            result = await twilioClient.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone,
                body: message
            });
        }

        return {
            success: true,
            message: `OTP sent via ${method.toUpperCase()}`,
            messageId: result.sid,
            method: method,
            phone: phone
        };

    } catch (error) {
        console.error(`Error sending OTP via ${method}:`, error);
        throw error;
    }
};

/**
 * Send OTP via WhatsApp
 * @param {string} phone - Phone number in E.164 format
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<object>} - Result object
 */
exports.sendWhatsAppOTP = async (phone, code) => {
    return exports.sendOTP(phone, code, 'whatsapp');
};

/**
 * Send OTP via SMS
 * @param {string} phone - Phone number in E.164 format
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<object>} - Result object
 */
exports.sendSMSOTP = async (phone, code) => {
    return exports.sendOTP(phone, code, 'sms');
};

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number
 * @param {string} countryCode - Default country code (e.g., '966' for Saudi Arabia)
 * @returns {string} - Formatted phone number
 */
exports.formatPhoneNumber = (phone, countryCode = '966') => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // If doesn't start with country code, add it
    if (!cleaned.startsWith(countryCode)) {
        cleaned = countryCode + cleaned;
    }
    
    // Add + prefix
    return '+' + cleaned;
};

