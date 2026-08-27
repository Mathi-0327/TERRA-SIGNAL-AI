# TerraSignal AI - Valuation Model Card

**Model Name:** TerraSignal Predictive Valuation Engine  
**Production Version:** `v1.2.0-stable`  
**Training Date:** `2026-08-27T23:27:35.734284`  
**Status:** `PRODUCTION_READY`

---

## 1. Model Overview
The TerraSignal AI Valuation Engine provides automated fair market value estimations for residential properties across Chennai micro-markets. It processes physical property attributes combined with micro-market demand, supply, infrastructure, and environmental risk indicators.

## 2. Benchmark Model Comparison
| Algorithm | R2 Score | MAE (INR) | RMSE (INR) | MAPE (%) |
| :--- | :--- | :--- | :--- | :--- |
| **Ridge Regression (Baseline)** | 0.8829 | INR 2,963,209 | INR 4,552,116 | 25.49% |
| **Random Forest Regressor** | 0.9805 | INR 1,082,609 | INR 1,855,879 | 6.43% |
| **Gradient Boosting Regressor (Selected)** | **0.9872** | **INR 894,142** | **INR 1,504,090** | **5.3%** |

## 3. Key Feature Importances
Top factors driving property valuations:
- **`prop_type_encoded`**: 34.8%
- **`area_sqft`**: 31.2%
- **`base_micro_price_sqft`**: 14.9%
- **`demand_supply_ratio`**: 4.7%
- **`selling_days`**: 4.5%
- **`supply_index`**: 4.3%
- **`demand_index`**: 1.7%
- **`infra_score`**: 1.6%

## 4. Uncertainty & Error Bounds
The model outputs a 90% confidence interval defined as:
$$\text{Valuation Range} = \hat{y} \pm 1.645 \times \text{RMSE}$$

Predictions are clearly segregated into:
- **Observed Market Price** (Seller Asking)
- **Estimated Fair Market Value** (ML Median)
- **Lower & Upper Bound Bounds** (Conservative to Optimistic Band)
