# OTP Authentication Setup Guide

## Overview
This system supports phone-based authentication using OTP (One-Time Password) sent via SMS or WhatsApp.

## Features
- ✅ Phone number authentication
- ✅ SMS OTP delivery
- ✅ WhatsApp OTP delivery
- ✅ Automatic user registration
- ✅ 6-digit verification codes
- ✅ 5-minute expiry time
- ✅ Development mode (shows OTP in console)
- ✅ Production mode (sends via Twilio)

## Setup Instructions

### 1. Install Twilio (Optional - for Production)
```bash
npm install twilio
```

### 2. Environment Variables
Add these to your `.env` file:

```env
# Twilio Configuration (Optional - for SMS/WhatsApp)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"          # For SMS
TWILIO_WHATSAPP_NUMBER="+1234567890"       # For WhatsApp
```

### 3. Get Twilio Credentials
1. Go to https://www.twilio.com/
2. Sign up for a free account
3. Get your Account SID and Auth Token from the console
4. Get a phone number for SMS
5. Set up WhatsApp sandbox or get approved WhatsApp number

## API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "+966501234567",    // E.164 format
  "method": "sms"               // or "whatsapp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully via SMS",
  "data": {
    "phone": "+966501234567",
    "method": "sms",
    "expiresIn": 300,
    "code": "123456"  // Only in development mode
  }
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "+966501234567",
  "code": "123456",
  "full_name": "Ahmed Ali"  // Optional, used for new users
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "phone": "+966501234567",
      "role": "CUSTOMER",
      "full_name": "Ahmed Ali"
    },
    "token": "jwt-token-here",
    "isNewUser": true
  }
}
```

## Phone Number Format

The system automatically formats phone numbers to E.164 format:
- `0501234567` → `+966501234567`
- `501234567` → `+966501234567`
- `+966501234567` → `+966501234567`

Default country code: **966** (Saudi Arabia)

## Development Mode

In development mode (`NODE_ENV=development`):
- OTP is printed to console
- OTP is returned in API response
- No SMS/WhatsApp is sent (saves costs)
- Works without Twilio configuration

Example console output:
```
┌─────────────────────────────────────┐
│  🔐 OTP CODE (Development Mode)     │
├─────────────────────────────────────┤
│  Phone: +966501234567               │
│  Code:  123456                      │
│  Method: SMS                        │
│  Valid for: 5 minutes               │
└─────────────────────────────────────┘
```

## Production Mode

In production mode:
- OTP is sent via Twilio SMS or WhatsApp
- OTP is NOT returned in API response
- Requires valid Twilio credentials
- Automatic retry logic
- Error handling and logging

## Security Features

1. **OTP Expiry**: Codes expire after 5 minutes
2. **One-Time Use**: Each code can only be used once
3. **Auto Cleanup**: Old unverified OTPs are deleted when new ones are requested
4. **Rate Limiting**: Recommended to add rate limiting middleware
5. **Phone Verification**: Marks phone as verified after successful OTP

## User Flow

1. User enters phone number
2. System sends OTP via SMS or WhatsApp
3. User receives code (123456)
4. User enters code
5. System verifies code
6. If new user: creates account automatically
7. If existing user: logs them in
8. Returns JWT token for authenticated requests

## Customization

### Change OTP Length
Edit `authController.js`:
```javascript
const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
// Change to:
const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
```

### Change Expiry Time
```javascript
const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
// Change to:
const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

### Change Message Template
Edit `smsService.js`:
```javascript
const message = `Your verification code is: ${code}\n\nValid for 5 minutes.\n\n- FoodDash`;
```

## Testing

### Test in Development
1. Call `/api/auth/send-otp` with a phone number
2. Check console for OTP code
3. Call `/api/auth/verify-otp` with phone and code
4. Receive JWT token

### Test in Production
1. Ensure Twilio is configured
2. Use a real phone number
3. Receive actual SMS/WhatsApp message
4. Verify code

## Troubleshooting

**Issue**: "SMS/WhatsApp service not configured"
- **Solution**: Add Twilio credentials to `.env` or run in development mode

**Issue**: "Invalid or expired OTP"
- **Solution**: Check if code expired (5 min limit) or was already used

**Issue**: "Phone number must be in E.164 format"
- **Solution**: Ensure phone starts with + and country code (+966...)

**Issue**: "Twilio error"
- **Solution**: Verify Twilio credentials and account balance

## Support

For SMS/WhatsApp setup help:
- Twilio Docs: https://www.twilio.com/docs
- WhatsApp API: https://www.twilio.com/whatsapp

