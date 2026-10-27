import { requestApi } from "./api";

// Get doctor records from the API. The backend can return a list directly
// or put the list inside a doctors/data property.
export async function getDoctors(signal) {
  const result = await requestApi("/doctors", { signal, credentials: "omit" });

  if (result?.success === false) {
    throw new Error(result.message || "Doctor profiles are unavailable right now.");
  }

  const doctors = Array.isArray(result)
    ? result
    : result?.doctors || result?.data || [];

  if (!Array.isArray(doctors)) {
    throw new Error("The doctor service returned an unexpected response.");
  }

  return doctors;
}

export function matchesDoctor(doctor, searchText, city) {
  const text = searchText.trim().toLowerCase();
  const location = city.trim().toLowerCase();
  const doctorDetails = [
    doctor.name,
    doctor.specialization,
    doctor.qualification,
    doctor.hospitalName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesText = !text || doctorDetails.includes(text);
  const matchesCity = !location || String(doctor.city || "").toLowerCase().includes(location);

  return matchesText && matchesCity;
}
