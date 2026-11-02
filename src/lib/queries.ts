import { api } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";

export type Tour = components["schemas"]["TourRead"];
export type Booking = components["schemas"]["BookingResponse"];
export type CabinetBooking = components["schemas"]["CabinetBookingResponse"];
export type CabinetSummary = components["schemas"]["CabinetSummaryResponse"];
export type BookingDocuments = components["schemas"]["BookingDocumentsResponse"];
export type Invoice = components["schemas"]["InvoiceRead"];

export type TourFilters = {
  query?: string;
  price_min?: number | null;
  price_max?: number | null;
  sort?: components["schemas"]["TourSort"];
  limit?: number;
  offset?: number;
};

export async function fetchTours(filters: TourFilters = {}): Promise<Tour[]> {
  const { data, error } = await api.GET("/tours", {
    params: { query: filters },
  });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTour(tourId: string): Promise<Tour> {
  const { data, error } = await api.GET("/tours/{tour_id}", {
    params: { path: { tour_id: tourId } },
  });
  if (error) throw error;
  return data as Tour;
}

export async function createBooking(
  input: components["schemas"]["BookingCreateRequest"],
): Promise<Booking> {
  const { data, error } = await api.POST("/bookings", { body: input });
  if (error) throw error;
  return data as Booking;
}

export async function fetchBooking(bookingId: string): Promise<Booking> {
  const { data, error } = await api.GET("/bookings/{booking_id}", {
    params: { path: { booking_id: bookingId } },
  });
  if (error) throw error;
  return data as Booking;
}

export async function fetchCabinet(): Promise<CabinetSummary> {
  const { data, error } = await api.GET("/cabinet");
  if (error) throw error;
  return data as CabinetSummary;
}

export async function fetchActiveBookings(): Promise<CabinetBooking[]> {
  const { data, error } = await api.GET("/cabinet/bookings/active");
  if (error) throw error;
  return data ?? [];
}

export async function fetchHistory(): Promise<CabinetBooking[]> {
  const { data, error } = await api.GET("/cabinet/bookings/history");
  if (error) throw error;
  return data ?? [];
}

export async function fetchDocuments(): Promise<BookingDocuments[]> {
  const { data, error } = await api.GET("/cabinet/documents");
  if (error) throw error;
  return data ?? [];
}

export async function fetchInvoice(invoiceId: string): Promise<Invoice> {
  const { data, error } = await api.GET("/invoices/{invoice_id}", {
    params: { path: { invoice_id: invoiceId } },
  });
  if (error) throw error;
  return data as Invoice;
}

export async function payInvoice(invoiceId: string): Promise<Invoice> {
  const { data, error } = await api.POST("/invoices/{invoice_id}/pay", {
    params: { path: { invoice_id: invoiceId } },
  });
  if (error) throw error;
  return data as Invoice;
}

export async function requestOtp(email: string): Promise<void> {
  const { error } = await api.POST("/auth/otp/request", { body: { email } });
  if (error) throw error;
}
