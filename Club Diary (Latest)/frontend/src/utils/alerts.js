import Swal from "sweetalert2";

const base = {
  confirmButtonColor: "#4f46e5",
  cancelButtonColor: "#94a3b8",
  background: "#ffffff",
  color: "#0f172a"
};

export function successAlert(title, text = "") {
  return Swal.fire({ ...base, icon: "success", title, text, timer: 1800, showConfirmButton: false });
}

export function errorAlert(title, text = "") {
  return Swal.fire({ ...base, icon: "error", title, text });
}

export async function confirmAlert(title, text, confirmText = "Confirm") {
  const result = await Swal.fire({
    ...base,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText
  });
  return result.isConfirmed;
}
