// Shared email template system for Accountant AI
// All emails use consistent branding and styling

export const BRAND_COLORS = {
  primary: '#3b82f6',
  primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#f3f4f6',
  text: '#333333',
  textMuted: '#6b7280',
  border: '#e5e7eb',
};

export const EMAIL_FOOTER = `
  <div style="text-align: center; padding: 20px; color: ${BRAND_COLORS.textMuted}; font-size: 12px; border-top: 1px solid ${BRAND_COLORS.border}; margin-top: 30px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Accountant AI. All rights reserved.</p>
    <p style="margin: 5px 0 0 0;">
      <a href="https://accountant-ai.com/privacy" style="color: ${BRAND_COLORS.textMuted}; text-decoration: none;">Privacy Policy</a> • 
      <a href="https://accountant-ai.com/terms" style="color: ${BRAND_COLORS.textMuted}; text-decoration: none;">Terms of Service</a>
    </p>
    <p style="margin: 10px 0 0 0; font-size: 11px;">
      You're receiving this email because you signed up for Accountant AI.
    </p>
  </div>
`;

export const EMAIL_HEADER = (title: string, subtitle?: string) => `
  <div style="background: ${BRAND_COLORS.primaryGradient}; color: white; padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="margin: 0; font-size: 28px; font-weight: 700;">${title}</h1>
    ${subtitle ? `<p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${subtitle}</p>` : ''}
  </div>
`;

export const BASE_EMAIL_WRAPPER = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Accountant AI</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: ${BRAND_COLORS.text}; margin: 0; padding: 0; background-color: ${BRAND_COLORS.background};">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        ${content}
        ${EMAIL_FOOTER}
      </div>
    </body>
  </html>
`;

export const BUTTON_STYLE = `
  display: inline-block;
  background: ${BRAND_COLORS.primaryGradient};
  color: white;
  padding: 16px 32px;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0;
`;

// Email Templates

export const waitlistConfirmationEmail = (params: {
  fullName?: string;
  position: number;
  totalCount: number;
}) => {
  const greeting = params.fullName ? `Hi ${params.fullName},` : 'Hi there,';
  
  return BASE_EMAIL_WRAPPER(`
    ${EMAIL_HEADER('🎉 Welcome to Accountant AI!', "You're officially on the waitlist")}
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 16px;">${greeting}</p>
      
      <p style="font-size: 16px;">You're officially on the waitlist for <strong>Accountant AI</strong> - the future of AI-powered accounting!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: ${BRAND_COLORS.primaryGradient}; color: white; padding: 25px 40px; border-radius: 12px; display: inline-block;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your Position</p>
          <p style="margin: 8px 0; font-size: 52px; font-weight: bold;">#${params.position}</p>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">of ${params.totalCount} people waiting</p>
        </div>
      </div>
      
      <h3 style="color: #1f2937; margin-top: 30px; font-size: 18px;">🌟 What you'll get as an early supporter:</h3>
      <ul style="padding-left: 0; list-style: none;">
        <li style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✅</span>
          <strong>Priority access</strong> when we launch
        </li>
        <li style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✅</span>
          <strong>Exclusive 30% discount</strong> on launch pricing
        </li>
        <li style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✅</span>
          <strong>100 bonus AI credits</strong> (worth $50)
        </li>
        <li style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✅</span>
          <strong>Personal onboarding</strong> session
        </li>
        <li style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✅</span>
          <strong>Direct line</strong> to our founding team
        </li>
      </ul>
      
      <p style="font-size: 16px; margin-top: 30px; color: ${BRAND_COLORS.textMuted};">We're working hard to launch soon. You'll be the first to know!</p>
      
      <p style="margin-top: 30px; color: ${BRAND_COLORS.textMuted};">Questions? Just reply to this email.</p>
      
      <p style="margin-top: 20px;">Best,<br><strong>The Accountant AI Team</strong></p>
    </div>
  `);
};

export const launchNotificationEmail = (params: {
  fullName?: string;
  position: number;
  totalCount: number;
  appUrl: string;
}) => {
  const greeting = params.fullName ? `Hi ${params.fullName},` : 'Hi there,';
  
  return BASE_EMAIL_WRAPPER(`
    ${EMAIL_HEADER('🚀 We\'re Live!', 'Your wait is over - Accountant AI is officially here')}
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 16px;">${greeting}</p>
      
      <p style="font-size: 18px;"><strong>The moment you've been waiting for has arrived!</strong></p>
      
      <p style="font-size: 16px;">As waitlist member <strong>#${params.position}</strong> (out of ${params.totalCount}), you get exclusive early access benefits:</p>
      
      <div style="margin: 25px 0;">
        <div style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✨</span>
          30% off your first 3 months
        </div>
        <div style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✨</span>
          100 bonus AI credits (worth $50)
        </div>
        <div style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✨</span>
          Priority support for 90 days
        </div>
        <div style="margin: 12px 0; padding-left: 28px; position: relative;">
          <span style="position: absolute; left: 0;">✨</span>
          Free personal onboarding call
        </div>
      </div>
      
      <div style="background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">Your exclusive launch code:</p>
        <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #92400e; letter-spacing: 3px;">EARLY30</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${params.appUrl}/auth" style="${BUTTON_STYLE}">
          🎯 Claim Your Early Access →
        </a>
      </div>
      
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-weight: bold; color: #dc2626;">⏰ This offer expires in 48 hours!</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #991b1b;">Don't miss out on your exclusive benefits</p>
      </div>
      
      <p style="font-size: 16px;">Thank you for believing in us from day one. We can't wait to help you transform your accounting!</p>
      
      <p style="margin-top: 25px;">Best,<br><strong>The Accountant AI Team</strong></p>
    </div>
  `);
};

export const paymentReceiptEmail = (params: {
  fullName?: string;
  amount: string;
  currency: string;
  planName: string;
  transactionId: string;
  date: string;
}) => {
  const greeting = params.fullName ? `Hi ${params.fullName},` : 'Hi there,';
  
  return BASE_EMAIL_WRAPPER(`
    ${EMAIL_HEADER('💳 Payment Confirmed', 'Thank you for your purchase')}
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 16px;">${greeting}</p>
      
      <p style="font-size: 16px;">Your payment has been successfully processed. Here are your receipt details:</p>
      
      <div style="background: #f9fafb; border: 1px solid ${BRAND_COLORS.border}; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: ${BRAND_COLORS.textMuted};">Plan</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 600;">${params.planName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: ${BRAND_COLORS.textMuted};">Amount</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 600; font-size: 18px;">${params.currency}${params.amount}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: ${BRAND_COLORS.textMuted};">Date</td>
            <td style="padding: 10px 0; text-align: right;">${params.date}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: ${BRAND_COLORS.textMuted};">Transaction ID</td>
            <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 12px;">${params.transactionId}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #ecfdf5; border-radius: 8px; padding: 15px 20px; margin: 20px 0;">
        <p style="margin: 0; color: #065f46; font-weight: 500;">✅ Your subscription is now active!</p>
      </div>
      
      <p style="font-size: 14px; color: ${BRAND_COLORS.textMuted};">This receipt serves as confirmation of your purchase. If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
      
      <p style="margin-top: 25px;">Best,<br><strong>The Accountant AI Team</strong></p>
    </div>
  `);
};

export const passwordResetEmail = (params: {
  fullName?: string;
  resetUrl: string;
}) => {
  const greeting = params.fullName ? `Hi ${params.fullName},` : 'Hi there,';
  
  return BASE_EMAIL_WRAPPER(`
    ${EMAIL_HEADER('🔐 Reset Your Password')}
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 16px;">${greeting}</p>
      
      <p style="font-size: 16px;">We received a request to reset your password for your Accountant AI account.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${params.resetUrl}" style="${BUTTON_STYLE}">
          Reset Password
        </a>
      </div>
      
      <p style="font-size: 14px; color: ${BRAND_COLORS.textMuted};">This link will expire in 1 hour for security reasons.</p>
      
      <div style="background: #fef3c7; border-radius: 8px; padding: 15px 20px; margin: 25px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>⚠️ Didn't request this?</strong><br>
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      
      <p style="margin-top: 25px;">Best,<br><strong>The Accountant AI Team</strong></p>
    </div>
  `);
};

export const welcomeEmail = (params: {
  fullName?: string;
  appUrl: string;
}) => {
  const greeting = params.fullName ? `Hi ${params.fullName},` : 'Hi there,';
  
  return BASE_EMAIL_WRAPPER(`
    ${EMAIL_HEADER('👋 Welcome to Accountant AI!', 'Your journey to smarter accounting starts now')}
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 16px;">${greeting}</p>
      
      <p style="font-size: 16px;">Welcome to <strong>Accountant AI</strong>! We're thrilled to have you on board.</p>
      
      <h3 style="color: #1f2937; margin-top: 30px; font-size: 18px;">🚀 Get started in 3 easy steps:</h3>
      
      <div style="margin: 25px 0;">
        <div style="display: flex; align-items: flex-start; margin: 15px 0;">
          <div style="background: ${BRAND_COLORS.primaryGradient}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</div>
          <div style="margin-left: 15px;">
            <strong>Complete your profile</strong>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.textMuted}; font-size: 14px;">Add your business details for personalized insights</p>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start; margin: 15px 0;">
          <div style="background: ${BRAND_COLORS.primaryGradient}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</div>
          <div style="margin-left: 15px;">
            <strong>Connect your accounts</strong>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.textMuted}; font-size: 14px;">Link your bank accounts for automatic transaction import</p>
          </div>
        </div>
        <div style="display: flex; align-items: flex-start; margin: 15px 0;">
          <div style="background: ${BRAND_COLORS.primaryGradient}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</div>
          <div style="margin-left: 15px;">
            <strong>Ask Arnold anything</strong>
            <p style="margin: 5px 0 0 0; color: ${BRAND_COLORS.textMuted}; font-size: 14px;">Our AI assistant is ready to help with taxes, reports & more</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${params.appUrl}/dashboard" style="${BUTTON_STYLE}">
          Go to Dashboard →
        </a>
      </div>
      
      <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #0369a1;">
          <strong>💡 Pro tip:</strong> Use voice commands to add transactions quickly. Just say "Hey Arnold, add expense £50 for office supplies"
        </p>
      </div>
      
      <p style="font-size: 16px;">If you need any help getting started, our support team is always here for you.</p>
      
      <p style="margin-top: 25px;">Best,<br><strong>The Accountant AI Team</strong></p>
    </div>
  `);
};

export const alertNotificationEmail = (params: {
  fullName?: string;
  alertTitle: string;
  alertMessage: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
}) => {
  const greeting = params.fullName ? `Hi ${params.fullName},` : 'Hi there,';
  
  const priorityColors = {
    low: { bg: '#f0f9ff', border: '#0ea5e9', text: '#0369a1' },
    medium: { bg: '#fefce8', border: '#eab308', text: '#854d0e' },
    high: { bg: '#fff7ed', border: '#f97316', text: '#9a3412' },
    urgent: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
  };
  
  const colors = priorityColors[params.priority] || priorityColors.medium;
  
  return BASE_EMAIL_WRAPPER(`
    ${EMAIL_HEADER('🔔 Alert from Accountant AI')}
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="font-size: 16px;">${greeting}</p>
      
      <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 20px; border-radius: 0 12px 12px 0; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: ${colors.text}; font-size: 18px;">${params.alertTitle}</h3>
        <p style="margin: 0; color: ${colors.text};">${params.alertMessage}</p>
      </div>
      
      ${params.actionUrl ? `
        <div style="text-align: center; margin: 25px 0;">
          <a href="${params.actionUrl}" style="${BUTTON_STYLE}">
            ${params.actionText || 'View Details'} →
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: ${BRAND_COLORS.textMuted};">You're receiving this alert based on your notification preferences. You can manage your alert settings in your account.</p>
      
      <p style="margin-top: 25px;">Best,<br><strong>The Accountant AI Team</strong></p>
    </div>
  `);
};
