import { NextResponse } from 'next/server';

/**
 * Root API endpoint
 * Provides API information and available endpoints
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'AstroSetu API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        me: '/api/auth/me',
        sendOTP: '/api/auth/send-otp',
        verifyOTP: '/api/auth/verify-otp',
        setup2FA: '/api/auth/setup-2fa',
        verify2FA: '/api/auth/verify-2fa-login',
      },
      astrology: {
        kundli: '/api/astrology/kundli',
        match: '/api/astrology/match',
        horoscope: '/api/astrology/horoscope',
        panchang: '/api/astrology/panchang',
        muhurat: '/api/astrology/muhurat',
        numerology: '/api/astrology/numerology',
        remedies: '/api/astrology/remedies',
        dasha: '/api/astrology/dasha',
        dosha: '/api/astrology/dosha',
        config: '/api/astrology/config',
      },
      reports: {
        life: '/api/reports/life',
        ascendant: '/api/reports/ascendant',
        lalkitab: '/api/reports/lalkitab',
        dashaPhal: '/api/reports/dasha-phal',
        sadesati: '/api/reports/sadesati',
        varshphal: '/api/reports/varshphal',
        love: '/api/reports/love',
        general: '/api/reports/general',
        gochar: '/api/reports/gochar',
        mangalDosha: '/api/reports/mangal-dosha',
        babyname: '/api/reports/babyname',
      },
      payments: {
        createOrder: '/api/payments/create-order',
        verify: '/api/payments/verify',
        config: '/api/payments/config',
        createUPI: '/api/payments/create-upi-order',
        initiateUPI: '/api/payments/initiate-upi',
        checkUPIStatus: '/api/payments/check-upi-status',
        createBankTransfer: '/api/payments/create-bank-transfer',
        verifyBankTransfer: '/api/payments/verify-bank-transfer',
      },
      wallet: {
        balance: '/api/wallet',
        addMoney: '/api/wallet/add-money',
      },
      chat: {
        sessions: '/api/chat/sessions',
        sessionMessages: '/api/chat/sessions/[id]/messages',
      },
      astrologers: {
        list: '/api/astrologers',
        details: '/api/astrologers/[id]',
      },
      users: {
        profile: '/api/users/profile',
      },
    },
    documentation: 'See API documentation for details',
  });
}

