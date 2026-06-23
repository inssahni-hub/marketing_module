// ======================
// SAFE HELPERS
// ======================
export const safeDate = (d) => {
  if (!d) return null
  const date = d instanceof Date ? d : new Date(d)
  return isNaN(date.getTime()) ? null : date
}

export const safeNumber = (n) => {
  if (n === "" || n === null || n === undefined) return 0
  const num = Number(n)
  return isNaN(num) ? 0 : num
}

// ======================
// API → FORM
// ======================
export const normalizeApiToForm = (ticket = {}) => {
  const sales = ticket.settings?.sales ?? {}
  const earlyBird = ticket.settings?.earlyBird ?? {}

  return {
    // ----------------------
    // BASIC
    // ----------------------
    paymentType: ticket.settings?.paymentType ?? "paid",
    title: ticket.title ?? "",
    price: ticket.price ?? "",
    totalCapacity: ticket.totalCapacity ?? "",

    // ----------------------
    // SALES (CATEGORY)
    // ----------------------
    saleStartDate: safeDate(
      sales.start?.date ?? ticket.saleStartDate
    ),
    saleStartTime:
      sales.start?.time ?? ticket.saleStartTime ?? null,

    saleEndDate: safeDate(
      sales.end?.date ?? ticket.saleEndDate
    ),
    saleEndTime:
      sales.end?.time ?? ticket.saleEndTime ?? null,

    // ----------------------
    // LIMITS
    // ----------------------
    minPerOrder: ticket.settings?.limits?.min ?? 1,
    maxPerOrder: ticket.settings?.limits?.max ?? 10,

    // ----------------------
    // CHANNELS
    // ----------------------
    channels: {
      online: !!ticket.settings?.channels?.online,
      offline: !!ticket.settings?.channels?.offline,
      door: !!ticket.settings?.channels?.door,
      all: !!ticket.settings?.channels?.all,
    },

    // ----------------------
    // DELIVERY
    // ----------------------
    delivery: {
      eticket: !!ticket.settings?.delivery?.eticket,
      willCall: !!ticket.settings?.delivery?.willCall,
    },

    absorbFees: !!ticket.settings?.absorbFees,
    waitingList: !!ticket.settings?.waitingList,

    // ----------------------
    // EARLY BIRD (CATEGORY)
    // ----------------------
    earlyBird: earlyBird.enabled
      ? {
          enabled: true,
          price: earlyBird.price ?? "",
          startDate: safeDate(
            earlyBird.start?.date ?? ticket.earlyBirdStartDate
          ),
          startTime:
            earlyBird.start?.time ?? ticket.earlyBirdStartTime ?? null,
          endDate: safeDate(
            earlyBird.end?.date ?? ticket.earlyBirdEndDate
          ),
          endTime:
            earlyBird.end?.time ?? ticket.earlyBirdEndTime ?? null,
        }
      : {
          enabled: false,
          price: "",
          startDate: null,
          startTime: null,
          endDate: null,
          endTime: null,
        },

    // ----------------------
    // SUBCATEGORIES
    // ----------------------
    subcategories:
      ticket.subcategories?.map((s) => ({
        title: s.title ?? "",
        price: s.price ?? "",
        totalCapacity: s.totalCapacity ?? "",
        earlyBird: s.earlyBird?.enabled
          ? {
              enabled: true,
              price: s.earlyBird.price ?? "",
              startDate: safeDate(s.earlyBird.start?.date),
              startTime: s.earlyBird.start?.time ?? null,
              endDate: safeDate(s.earlyBird.end?.date),
              endTime: s.earlyBird.end?.time ?? null,
            }
          : {
              enabled: false,
              price: "",
              startDate: null,
              startTime: null,
              endDate: null,
              endTime: null,
            },
      })) ?? [],
  }
}

// ======================
// FORM → API
// ======================
export const normalizeFormToApi = (form) => ({
  title: form.title,

  price:
    form.paymentType === "paid"
      ? safeNumber(form.price)
      : 0,

  totalCapacity: safeNumber(form.totalCapacity),

  hasSubcategories: form.subcategories.length > 0,

  settings: {
    paymentType: form.paymentType,
    absorbFees: !!form.absorbFees,
    waitingList: !!form.waitingList,

    sales: {
      start: form.saleStartDate
        ? {
            date: form.saleStartDate,
            time: form.saleStartTime,
          }
        : null,
      end: form.saleEndDate
        ? {
            date: form.saleEndDate,
            time: form.saleEndTime,
          }
        : null,
    },

    earlyBird: form.earlyBird?.enabled
      ? {
          enabled: true,
          price: safeNumber(form.earlyBird.price),
          start: {
            date: form.earlyBird.startDate,
            time: form.earlyBird.startTime,
          },
          end: {
            date: form.earlyBird.endDate,
            time: form.earlyBird.endTime,
          },
        }
      : { enabled: false },
  },

  subcategories: form.subcategories.map((s) => ({
    title: s.title,
    price: safeNumber(s.price),
    totalCapacity: safeNumber(s.totalCapacity),
    earlyBird: s.earlyBird?.enabled
      ? {
          enabled: true,
          price: safeNumber(s.earlyBird.price),
          start: {
            date: s.earlyBird.startDate,
            time: s.earlyBird.startTime,
          },
          end: {
            date: s.earlyBird.endDate,
            time: s.earlyBird.endTime,
          },
        }
      : { enabled: false },
  })),
})
