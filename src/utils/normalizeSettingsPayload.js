export function normalizeSettingsPayload(data = {}) {

  // 🔒 SAFE HELPERS

  const getFeeType = (type, fallback) => {
    return ["fixed", "percentage"].includes(type)
      ? type
      : fallback
  }

  const getNumber = (val, fallback) => {
    const num = Number(val)

    return isNaN(num)
      ? fallback
      : num
  }

  return {

    displayRemainingTickets:
      Boolean(data.displayRemainingTickets),

    eventType:
      data.eventType === "REGISTRATION"
        ? "REGISTRATION"
        : "TICKETED",

    checkoutLabels: {
      tickets:
        data.checkoutLabels?.tickets || "Tickets",

      addons:
        data.checkoutLabels?.addons || "Add-ons",
    },

    messages: {
      postSale:
        data.messages?.postSale || "",

      postPurchase:
        data.messages?.postPurchase || "",
    },

    // ✅ NEW REFUND POLICY

    refundPolicy:
      data.refundPolicy || "",

    // ✅ FULLY SAFE OFFLINE CHARGE

    offlineBookingCharge: {

      enabled:
        Boolean(
          data.offlineBookingCharge?.enabled
        ),

      platformFee: {

        type: getFeeType(
          data.offlineBookingCharge?.platformFee?.type,
          "fixed"
        ),

        value: getNumber(
          data.offlineBookingCharge?.platformFee?.value,
          0.99
        ),
      },

      processingFee: {

        type: getFeeType(
          data.offlineBookingCharge?.processingFee?.type,
          "percentage"
        ),

        value: getNumber(
          data.offlineBookingCharge?.processingFee?.value,
          3.5
        ),
      },
    },

    // OPTIONAL

    enableRecurring:
      Boolean(data.enableRecurring),
  }
}