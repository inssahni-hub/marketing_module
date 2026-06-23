export function normalizeSeatingTicketPayload(form, ticket) {
  const hasVariants = form.subcategories?.length > 0

  return {
    /* ---------- IMMUTABLE FIELDS ---------- */
    eventId: ticket.eventId,
    sectionId: ticket.sectionId,
    sectionName: ticket.sectionName,

    /* ---------- INVENTORY ---------- */
    totalCapacity: Number(ticket.totalCapacity),

    /* ---------- PRICING ---------- */
    basePrice: hasVariants ? 0 : Number(form.price || 0),
    hasVariants,

    variants: hasVariants
      ? form.subcategories.map((v) => ({
          name: v.title,
          price: Number(v.price),
          seatIds: [], // seat assignment later
          status: true,

          earlyBird: v.earlyBird?.enabled
            ? {
                enabled: true,
                price: Number(v.earlyBird.price),
                start: {
                  date: v.earlyBird.startDate || null,
                  time: v.earlyBird.startTime || null,
                },
                end: {
                  date: v.earlyBird.endDate || null,
                  time: v.earlyBird.endTime || null,
                },
              }
            : { enabled: false },
        }))
      : [],

    /* ---------- SETTINGS ---------- */
    settings: {
      paymentType: "paid",

      sales: {
        start: {
          date: form.saleStartDate || null,
          time: form.saleStartTime || null,
        },
        end: {
          date: form.saleEndDate || null,
          time: form.saleEndTime || null,
        },
      },

      limits: {
        minPerOrder: Number(form.minPerOrder ?? 1),
        maxPerOrder: Number(form.maxPerOrder ?? 10),
      },

      channels: {
        online: !!form.channels?.online,
        offline: !!form.channels?.offline,
        door: !!form.channels?.door,
        all: !!form.channels?.all,
      },

      delivery: {
        eticket: !!form.delivery?.eticket,
        willCall: !!form.delivery?.willCall,
      },

      absorbFees: !!form.absorbFees,
      waitingList: !!form.waitingList,

      earlyBird:
        !hasVariants && form.earlyBird?.enabled
          ? {
              enabled: true,
              price: Number(form.earlyBird.price),
              start: {
                date: form.earlyBird.startDate || null,
                time: form.earlyBird.startTime || null,
              },
              end: {
                date: form.earlyBird.endDate || null,
                time: form.earlyBird.endTime || null,
              },
            }
          : { enabled: false },
    },

    /* ---------- STATUS ---------- */
    status: true,
  }
}
