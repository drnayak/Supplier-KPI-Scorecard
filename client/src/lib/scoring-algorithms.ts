// SAP S4HC Scoring Algorithms Implementation

export interface PriceVarianceInput {
  poPrice: number;
  invoicePrice: number;
}

export interface QuantityVarianceInput {
  orderedQuantity: number;
  receivedQuantity: number;
}

export interface DeliveryVarianceInput {
  scheduledDate: Date;
  actualDate: Date;
}

export interface QualityInput {
  qualityNotifications: number;
  inspectionResult: 'OK' | 'NOT_OK';
}

export interface PpmInput {
  rejectedQuantity: number;
  totalReceivedQuantity: number;
}

export interface ScoreResult {
  score: number;
  variance: number;
  variancePercentage: number;
  scoreRange: string;
}

export interface DeliveryScoreResult {
  score: number;
  overdueDays: number;
  scoreRange: string;
}

export interface QualityScoreResult {
  notificationScore: number;
  inspectionScore: number;
  overallScore: number;
  scoreRange: string;
}

export interface PpmResult {
  ppmValue: number;
  scoreRange: string;
}

// Price Variance Scoring based on SAP documentation
export function calculatePriceScore(input: PriceVarianceInput): ScoreResult {
  const varianceAmount = input.invoicePrice - input.poPrice;
  const variancePercentage = (varianceAmount / input.poPrice) * 100;
  
  let score: number;
  let scoreRange: string;

  if (variancePercentage >= 20) {
    score = 5;
    scoreRange = "[20%, +∞]";
  } else if (variancePercentage >= 10) {
    score = 10;
    scoreRange = "[10%, 20%)";
  } else if (variancePercentage >= 5) {
    score = 20;
    scoreRange = "[5%, 10%)";
  } else if (variancePercentage >= 0) {
    score = 40;
    scoreRange = "[0%, 5%)";
  } else if (variancePercentage >= -5) {
    score = 60;
    scoreRange = "[-5%, 0%)";
  } else if (variancePercentage >= -10) {
    score = 80;
    scoreRange = "[-10%, -5%)";
  } else if (variancePercentage >= -20) {
    score = 90;
    scoreRange = "[-20%, -10%)";
  } else {
    score = 95;
    scoreRange = "[-100%, -20%)";
  }

  return {
    score,
    variance: varianceAmount,
    variancePercentage,
    scoreRange
  };
}

// Quantity Variance Scoring based on SAP documentation
export function calculateQuantityScore(input: QuantityVarianceInput): ScoreResult {
  const varianceQuantity = input.receivedQuantity - input.orderedQuantity;
  const variancePercentage = (varianceQuantity / input.orderedQuantity) * 100;
  
  let score: number;
  let scoreRange: string;

  if (variancePercentage >= 20) {
    score = 100;
    scoreRange = "[20%, +∞]";
  } else if (variancePercentage >= 10) {
    score = 95;
    scoreRange = "[10%, 20%)";
  } else if (variancePercentage >= 5) {
    score = 90;
    scoreRange = "[5%, 10%)";
  } else if (variancePercentage >= 0) {
    score = 80;
    scoreRange = "[0%, 5%)";
  } else if (variancePercentage >= -5) {
    score = 60;
    scoreRange = "[-5%, 0%)";
  } else if (variancePercentage >= -10) {
    score = 40;
    scoreRange = "[-10%, -5%)";
  } else if (variancePercentage >= -20) {
    score = 20;
    scoreRange = "[-20%, -10%)";
  } else {
    score = 10;
    scoreRange = "[-100%, -20%)";
  }

  return {
    score,
    variance: varianceQuantity,
    variancePercentage,
    scoreRange
  };
}

// Delivery Time Scoring based on SAP documentation
export function calculateDeliveryScore(input: DeliveryVarianceInput): DeliveryScoreResult {
  const timeDiff = input.actualDate.getTime() - input.scheduledDate.getTime();
  const overdueDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  let score: number;
  let scoreRange: string;

  if (overdueDays <= -60) {
    score = 5;
    scoreRange = "[-100, -60]";
  } else if (overdueDays <= -30) {
    score = 20;
    scoreRange = "[-60, -30]";
  } else if (overdueDays <= -10) {
    score = 40;
    scoreRange = "[-30, -10]";
  } else if (overdueDays <= -1) {
    score = 65;
    scoreRange = "[-10, -1]";
  } else if (overdueDays === 0) {
    score = 100;
    scoreRange = "[0, 0]";
  } else if (overdueDays <= 10) {
    score = 80;
    scoreRange = "[1, 10]";
  } else if (overdueDays <= 20) {
    score = 60;
    scoreRange = "[10, 20]";
  } else if (overdueDays <= 30) {
    score = 40;
    scoreRange = "[20, 30]";
  } else if (overdueDays <= 40) {
    score = 20;
    scoreRange = "[30, 40]";
  } else {
    score = 5;
    scoreRange = "[40, +∞]";
  }

  return {
    score,
    overdueDays,
    scoreRange
  };
}

// Quality Scoring based on SAP documentation
export function calculateQualityScore(input: QualityInput): QualityScoreResult {
  // Quality Notification Score
  let notificationScore: number;
  let scoreRange: string;

  if (input.qualityNotifications === 0) {
    notificationScore = 100;
    scoreRange = "[0, 0]";
  } else if (input.qualityNotifications <= 5) {
    notificationScore = 80;
    scoreRange = "[1, 5]";
  } else if (input.qualityNotifications <= 10) {
    notificationScore = 60;
    scoreRange = "[6, 10]";
  } else if (input.qualityNotifications <= 20) {
    notificationScore = 40;
    scoreRange = "[11, 20]";
  } else if (input.qualityNotifications <= 50) {
    notificationScore = 20;
    scoreRange = "[21, 50]";
  } else {
    notificationScore = 5;
    scoreRange = "[51, +∞]";
  }

  // Inspection Score
  const inspectionScore = input.inspectionResult === 'OK' ? 100 : 1;

  // Overall Quality Score (average of both)
  const overallScore = (notificationScore + inspectionScore) / 2;

  return {
    notificationScore,
    inspectionScore,
    overallScore,
    scoreRange
  };
}

// PPM Calculation based on SAP documentation
export function calculatePpm(input: PpmInput): PpmResult {
  const ppmValue = Math.round((input.rejectedQuantity / input.totalReceivedQuantity) * 1000000);
  
  let scoreRange: string;
  if (ppmValue === 0) {
    scoreRange = "Excellent (0 PPM)";
  } else if (ppmValue < 1000) {
    scoreRange = "Good (< 1K PPM)";
  } else if (ppmValue < 10000) {
    scoreRange = "Average (1K-10K PPM)";
  } else {
    scoreRange = "Poor (> 10K PPM)";
  }

  return {
    ppmValue,
    scoreRange
  };
}

// Helper function to get score color class
export function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  return 'red';
}

// Helper function to format PPM values
export function formatPpm(ppm: number): string {
  if (ppm >= 1000000) {
    return `${(ppm / 1000000).toFixed(1)}M`;
  } else if (ppm >= 1000) {
    return `${(ppm / 1000).toFixed(1)}K`;
  }
  return ppm.toString();
}
