import { useEffect, useState } from "react";
import axiosReq from "@/request/axiosReq";

export default function EventSelect({
    value,
    onChange,
    placeholder = "Select Event",
    disabled = false,
    className = "",
}) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);

            const res = await axiosReq.get(
                "/api/admin/events/dropdown/eventsByOrg"
            );

            setEvents(res.data?.data || []);
        } catch (error) {
            console.error("Failed to load events", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <select
            value={value || ""}
            onChange={(e) => {
                const selectedEvent = events.find(
                    (item) => item._id === e.target.value
                );

                onChange(e.target.value, selectedEvent);
            }}
            disabled={disabled || loading}
            className={`w-full border rounded-md px-3 py-2 text-sm ${className}`}
        >
            <option value="">
                {loading ? "Loading events..." : placeholder}
            </option>

            {events.map((event) => (
                <option
                    key={event._id}
                    value={event._id}
                >
                    {event.title}
                </option>
            ))}
        </select>
    );
}