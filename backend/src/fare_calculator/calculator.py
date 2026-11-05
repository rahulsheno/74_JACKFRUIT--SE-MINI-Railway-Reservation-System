import time
import math
from typing import Any, Dict, Optional, Tuple
from backend.src.fare_calculator.models import FareBreakdownModel, RefundEstimateModel

# Indian Railway Peak Festival & Holiday Surcharges
FESTIVAL_DATES = {"2026-11-10", "2026-12-25", "2026-01-01", "2026-01-14", "2026-10-20"}

class FareCalculatorService:
    """
    Fare Calculation & Concession Subsystem (Owned by Vinayak Kalal).
    Computes base fare from distance/class, applies concession policies,
    calculates superfast/Tatkal surcharges, GST, and cancellation refunds.
    """

    # Base fare rate per kilometer by travel class (in INR)
    RATE_PER_KM = {
        "SL": 0.45,
        "CC": 0.90,
        "3A": 1.40,
        "2A": 2.10,
        "1A": 3.20,
        "EC": 2.50
    }

    # Minimum base fares per class
    MIN_FARE = {
        "SL": 140,
        "CC": 220,
        "3A": 495,
        "2A": 750,
        "1A": 1250,
        "EC": 950
    }

    # Concession discount percentages
    CONCESSIONS = {
        "SENIOR_CITIZEN_MALE": 0.40,      # 40% discount for men >= 60 yrs
        "SENIOR_CITIZEN_FEMALE": 0.50,    # 50% discount for women >= 58 yrs
        "STUDENT": 0.50,                  # 50% discount for educational travel
        "DIVYANGJAN": 0.75,               # 75% discount for disabled persons
        "ARMED_FORCES": 0.50,             # 50% discount for defense personnel
        "CHILD_5_11": 0.50,               # 50% discount for children aged 5-11
        "INFANT_UNDER_5": 1.00,           # Free travel for infants under 5
        "NONE": 0.0
    }

    SUPERFAST_SURCHARGE = {
        "SL": 30.0,
        "CC": 45.0,
        "3A": 45.0,
        "2A": 45.0,
        "1A": 75.0,
        "EC": 75.0
    }

    CLERKAGE_FEES = {
        "1A": 240.0,
        "2A": 200.0,
        "3A": 180.0,
        "CC": 180.0,
        "EC": 240.0,
        "SL": 120.0
    }

    GST_RATE = 0.05  # 5% GST for AC classes (1A, 2A, 3A, CC, EC)

    def calculate_fare(
        self,
        distance_km: float,
        coach_class: str,
        concession_type: str = "NONE",
        quota: str = "GENERAL",
        is_superfast: bool = True
    ) -> Dict:
        """
        Calculates itemized fare breakdown.
        """
        c_class = coach_class.upper().strip()
        if c_class not in self.RATE_PER_KM:
            raise ValueError(f"Invalid coach class: {coach_class}")
        if distance_km <= 0:
            raise ValueError("Distance must be greater than zero.")

        # 1. Base Distance Fare
        raw_base = distance_km * self.RATE_PER_KM[c_class]
        min_fare = self.MIN_FARE.get(c_class, 100.0)
        base_fare = max(raw_base, min_fare)

        # 2. Concession Discount (Tatkal disallows concession in Indian Railways)
        norm_quota = quota.strip().upper()
        norm_concession = concession_type.strip().upper() if norm_quota != "TATKAL" else "NONE"
        concession_rate = self.CONCESSIONS.get(norm_concession, 0.0)
        discount_amount = round(base_fare * concession_rate, 2)
        discounted_base = base_fare - discount_amount

        # 3. Quota Surcharges (e.g. Tatkal)
        tatkal_surcharge = 0.0
        if norm_quota == "TATKAL":
            tatkal_rate = 0.30 if c_class in ["3A", "2A", "1A", "EC"] else 0.10
            tatkal_surcharge = max(100.0, discounted_base * tatkal_rate)

        # 4. Superfast Surcharge
        sf_charge = self.SUPERFAST_SURCHARGE.get(c_class, 30.0) if is_superfast else 0.0

        # Subtotal before tax
        subtotal = discounted_base + tatkal_surcharge + sf_charge

        # 5. GST (Applicable to AC classes)
        gst = round(subtotal * self.GST_RATE, 2) if c_class != "SL" else 0.0

        total_fare = round(subtotal + gst)

        return {
            "distance_km": distance_km,
            "coach_class": c_class,
            "base_fare": round(base_fare, 2),
            "concession_type": norm_concession,
            "discount_amount": discount_amount,
            "quota": norm_quota,
            "tatkal_surcharge": round(tatkal_surcharge, 2),
            "superfast_surcharge": sf_charge,
            "gst": gst,
            "total_fare": total_fare
        }

    def calculate_cancellation_refund(
        self,
        total_paid: float,
        hours_before_departure: float,
        status: str = "CNF",
        coach_class: str = "3A"
    ) -> Dict:
        """
        IRCTC Standard Cancellation Refund Matrix.
        - WL / RAC: Flat clerkage deduction (INR 60)
        - Confirmed > 48 hours: Flat clerkage deduction (INR 240 for 1A, 200 for 2A, 180 for 3A, 120 for SL)
        - Confirmed 48 to 12 hours: 25% of fare deduction
        - Confirmed 12 to 4 hours: 50% of fare deduction
        - Confirmed < 4 hours: No refund (0%)
        """
        c_class = coach_class.upper().strip() if coach_class else "3A"
        clerkage_base = self.CLERKAGE_FEES.get(c_class, 180.0)

        if status in ["WL", "RAC"]:
            clerkage = 60.0
            refund = max(0.0, total_paid - clerkage)
            return {
                "total_paid": total_paid,
                "cancellation_charge": clerkage,
                "refund_amount": refund,
                "hours_before_departure": hours_before_departure,
                "reason": "Waitlist/RAC Clerkage Fee"
            }

        if hours_before_departure > 48:
            deduction = min(total_paid, clerkage_base)
        elif 12 <= hours_before_departure <= 48:
            deduction = max(clerkage_base, round(total_paid * 0.25, 2))
        elif 4 <= hours_before_departure < 12:
            deduction = max(clerkage_base, round(total_paid * 0.50, 2))
        else:
            deduction = total_paid

        deduction = min(total_paid, deduction)
        refund = max(0.0, total_paid - deduction)
        return {
            "total_paid": total_paid,
            "cancellation_charge": deduction,
            "refund_amount": refund,
            "hours_before_departure": hours_before_departure,
            "reason": "Standard Confirmed Cancellation Rules"
        }

    def simulate_payment(self, amount: float, payment_method: str = "UPI") -> Dict:
        """
        Simulate payment gateway processing and generation of transaction receipt.
        Includes UPI QR payload, card authorization token, and gateway reconciliation ID.
        """
        if amount <= 0:
            return {"status": "FAILED", "message": "Invalid transaction amount"}
        
        tx_id = f"TXN_{int(time.time() * 1000)}"
        method = payment_method.upper().strip()
        upi_qr = f"upi://pay?pa=irctc.cris@icici&pn=IRCTC_RESERVATION&am={amount:.2f}&tn={tx_id}"
        card_token = f"tok_pci_{int(time.time())}" if method == "CARD" else None

        return {
            "status": "SUCCESS",
            "transaction_id": tx_id,
            "amount": amount,
            "payment_method": method,
            "upi_qr_payload": upi_qr if method == "UPI" else None,
            "card_token": card_token,
            "timestamp": time.time(),
            "gateway_status": "PAID",
            "gateway_ref": f"GATEWAY_IRCTC_{tx_id[-6:]}"
        }

    def generate_eticket_tax_invoice(self, booking_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates an IRCTC/CRIS compliant Itemized GST Tax Invoice with SAC 9964.
        Calculates CGST/SGST for AC classes (5%), 0% GST for Sleeper,
        IRCTC convenience fees, and optional travel insurance.
        """
        if not booking_data:
            return {"status": "ERROR", "message": "Booking data required"}

        pnr = booking_data.get("pnr", f"PNR{int(time.time())}")
        train_number = booking_data.get("train_number", "12658")
        coach_class = str(booking_data.get("coach_class", "3A")).upper().strip()
        fare_summary = booking_data.get("fare_summary", {})
        total_fare = float(fare_summary.get("total_fare", 1250.0))
        passengers = booking_data.get("passengers", [{}])
        pax_count = max(1, len(passengers))

        # GST Rate: 5% for AC classes (1A, 2A, 3A, CC, EC), 0% for non-AC (SL, 2S)
        is_ac = coach_class in ["1A", "2A", "3A", "CC", "EC"]
        gst_rate = 5.0 if is_ac else 0.0
        
        # Base fare before tax
        taxable_fare = round(total_fare / (1 + (gst_rate / 100.0)), 2) if is_ac else total_fare
        total_gst = round(total_fare - taxable_fare, 2)
        cgst = round(total_gst / 2.0, 2)
        sgst = round(total_gst / 2.0, 2)

        # IRCTC Convenience Fee + 18% GST
        conv_fee = 15.0
        conv_fee_gst = 2.70
        total_conv_fee = round(conv_fee + conv_fee_gst, 2)

        # Travel insurance
        travel_insurance = round(0.35 * pax_count, 2)
        grand_total = round(total_fare + total_conv_fee + travel_insurance, 2)

        invoice_number = f"INV-CRIS-{pnr[-6:]}-{int(time.time()) % 10000}"

        return {
            "status": "SUCCESS",
            "invoice_number": invoice_number,
            "sac_code": "9964",
            "gstin_supplier": "29AAACR1234F1Z5",
            "supplier_name": "Indian Railway Catering and Tourism Corporation Ltd (IRCTC)",
            "pnr": pnr,
            "train_number": train_number,
            "coach_class": coach_class,
            "passenger_count": pax_count,
            "is_ac_coach": is_ac,
            "itemized_charges": {
                "base_taxable_fare": taxable_fare,
                "cgst_amount": cgst,
                "sgst_amount": sgst,
                "gst_percentage": gst_rate,
                "irctc_convenience_fee": conv_fee,
                "convenience_fee_gst": conv_fee_gst,
                "travel_insurance": travel_insurance,
                "ticket_fare": total_fare,
                "grand_total": grand_total
            },
            "payment_status": "PAID"
        }
