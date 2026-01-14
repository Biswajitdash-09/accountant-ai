// Survey configuration for enhanced waitlist form

export interface SurveyOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SurveyResponses {
  user_type: string;
  stress_level: string;
  pain_points: string[];
  value_rating: string;
  pricing_preference: string;
  urgency_triggers: string[];
  notification_preferences: string[];
}

export const userTypes: SurveyOption[] = [
  { value: 'individual', label: 'Individual', icon: '👤' },
  { value: 'small_business', label: 'Small business owner', icon: '🏪' },
  { value: 'accountant', label: 'Accountant/finance professional', icon: '📊' },
  { value: 'startup', label: 'Startup founder', icon: '🚀' },
  { value: 'other', label: 'Other', icon: '✨' },
];

export const stressLevels: SurveyOption[] = [
  { value: 'very_stressful', label: 'Very stressful — I worry about penalties or mistakes', icon: '😰' },
  { value: 'stressful', label: 'Stressful — I manage, but it\'s confusing', icon: '😓' },
  { value: 'mildly_stressful', label: 'Mildly stressful', icon: '😕' },
  { value: 'not_stressful', label: 'Not stressful', icon: '😊' },
];

export const painPoints: SurveyOption[] = [
  { value: 'paid_fines', label: 'Paid fines or penalties', icon: '💸' },
  { value: 'overpaid_taxes', label: 'Overpaid taxes', icon: '📉' },
  { value: 'missed_deadlines', label: 'Missed deadlines', icon: '⏰' },
  { value: 'unexpected_charges', label: 'Had unexpected charges from a bank or authority', icon: '😱' },
  { value: 'hired_expensive', label: 'Had to hire expensive professionals', icon: '💰' },
  { value: 'none', label: 'None of the above', icon: '✅' },
];

export const valueRatings: SurveyOption[] = [
  { value: 'extremely_valuable', label: 'Extremely valuable — I need this', icon: '🌟' },
  { value: 'very_valuable', label: 'Very valuable', icon: '⭐' },
  { value: 'somewhat_valuable', label: 'Somewhat valuable', icon: '👍' },
  { value: 'not_valuable', label: 'Not valuable', icon: '🤷' },
];

export const pricingPreferences: SurveyOption[] = [
  { value: 'yes_30_50', label: 'Yes — $30-$50/month', icon: '💎' },
  { value: 'yes_under_30', label: 'Yes — under $30/month', icon: '💵' },
  { value: 'maybe', label: 'Maybe', icon: '🤔' },
  { value: 'no', label: 'No', icon: '❌' },
];

export const urgencyTriggers: SurveyOption[] = [
  { value: 'new_tax_laws', label: 'New tax laws/increased penalties', icon: '📜' },
  { value: 'audit_fear', label: 'Fear of audit or fines', icon: '🔍' },
  { value: 'compliance_pressure', label: 'Bank or government compliance pressure', icon: '🏛️' },
  { value: 'recommendation', label: 'Recommendation from a trusted person', icon: '👥' },
  { value: 'other', label: 'Other', icon: '💭' },
];

export const notificationPreferences: SurveyOption[] = [
  { value: 'yes_early_access', label: 'Yes, I want early access', icon: '🎯' },
  { value: 'yes_feedback', label: 'Yes, I\'d like to give feedback', icon: '💬' },
  { value: 'no', label: 'No', icon: '🚫' },
];

export const surveySteps = [
  { id: 1, title: 'Your Info', description: 'Basic details' },
  { id: 2, title: 'About You', description: 'Background & challenges' },
  { id: 3, title: 'Your Experience', description: 'Past issues & value' },
  { id: 4, title: 'Preferences', description: 'Pricing & notifications' },
];

export const getDefaultSurveyResponses = (): SurveyResponses => ({
  user_type: '',
  stress_level: '',
  pain_points: [],
  value_rating: '',
  pricing_preference: '',
  urgency_triggers: [],
  notification_preferences: ['yes_early_access'],
});
