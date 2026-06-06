export interface VendorMetrics {
  avg_price_deviation: number; // e.g., -5 for 5% below average, 10 for 10% above
  on_time_rate: number;        // e.g., 0.95 for 95% on-time delivery
  avg_response_days: number;   // e.g., 2.5 days
  total_won: number;           // e.g., 8
  total_submitted: number;     // e.g., 10
  dispute_rate: number;        // e.g., 0.02 for 2% dispute rate
  is_approved: boolean;
  is_blacklisted: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeVendorTrustScore(metrics: VendorMetrics): number {
  if (metrics.is_blacklisted) {
    return 0; // Blacklisted vendors immediately get a 0 score
  }

  // 1. Price Competitiveness (0–100)
  // Formula: 100 - clamp((avg_price_deviation + 20) × 2.5, 0, 100)
  const priceScore = 100 - clamp((metrics.avg_price_deviation + 20) * 2.5, 0, 100);

  // 2. Delivery Performance (0–100)
  // Formula: on_time_rate × 100
  const deliveryScore = metrics.on_time_rate * 100;

  // 3. Response Speed (0–100)
  // Formula: max(0, 100 - (avg_response_days × 12))
  const responseScore = Math.max(0, 100 - (metrics.avg_response_days * 12));

  // 4. Quote Win Rate (0–100)
  // Formula: (total_won / total_submitted) × 100
  const winRateScore = metrics.total_submitted > 0 
    ? (metrics.total_won / metrics.total_submitted) * 100 
    : 50; // Default to 50 if no quotes submitted yet

  // 5. Dispute-Free Rate (0–100)
  // Formula: (1 - dispute_rate) × 100
  const disputeFreeScore = (1 - metrics.dispute_rate) * 100;

  // Composite Trust Score
  let trustScore = (
    (priceScore * 0.25) +
    (deliveryScore * 0.30) +
    (responseScore * 0.15) +
    (winRateScore * 0.15) +
    (disputeFreeScore * 0.15)
  );

  // Additional modifiers
  if (metrics.is_approved) {
    trustScore = Math.min(100, trustScore + 5); // Small boost for being explicitly approved
  }

  return Number(trustScore.toFixed(2));
}

export function getTrustScoreTier(score: number) {
  if (score >= 85) return { label: 'Elite Vendor', color: 'teal', badge: '⭐ Elite' };
  if (score >= 70) return { label: 'Trusted', color: 'green', badge: '✓ Trusted' };
  if (score >= 55) return { label: 'Good Standing', color: 'blue', badge: 'Good' };
  if (score >= 40) return { label: 'Average', color: 'amber', badge: 'Average' };
  if (score >= 25) return { label: 'Needs Review', color: 'orange', badge: '⚠ Review' };
  return { label: 'High Risk', color: 'red', badge: '🚨 Risk' };
}
