// frontend/js/munisi.js
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  renderNavbar("munisi");

  const munisiTableBody = document.getElementById("munisi-table-body");
  const addMunisiButton = document.getElementById("add-munisi-button");
  const munisiModal = document.getElementById("munisi-modal");
  const munisiForm = document.getElementById("munisi-form");
  const cancelModalButton = document.getElementById("cancel-modal-button");
  const modalTitleText = document.getElementById("modal-title-text");
  const munisiIdInput = document.getElementById("munisi-id");
  const manufakturSelect = document.getElementById("id_manufaktur_munisi");
  const messageContainer = document.getElementById("munisi-message-container");

  let currentMunisi = [];
  let manufakturs = [];

  function displayMunisiMessage(message, type) {
    displayMessage(message, type, "munisi-message-container");
  }

  async function fetchManufaktursForSelect() {
    try {
      const data = await apiRequest("/manufaktur", "GET");
      manufakturs = data;
      manufakturSelect.innerHTML =
        '<option value="">Select Manufaktur</option>'; // Default option
      if (data && data.length > 0) {
        data.forEach((manufaktur) => {
          const option = document.createElement("option");
          option.value = manufaktur.id_manufaktur;
          option.textContent = manufaktur.nama_manufaktur;
          manufakturSelect.appendChild(option);
        });
      }
    } catch (error) {
      displayMunisiMessage(
        "Failed to fetch manufakturs for selection.",
        "error"
      );
    }
  }

  async function fetchMunisi() {
    try {
      const data = await apiRequest("/munisipesawat", "GET"); // Endpoint for munitions
      currentMunisi = data;
      munisiTableBody.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach((item) => {
          const row = munisiTableBody.insertRow();
          row.innerHTML = `
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${
              item.id_munisi
            }</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${
              item.nama_munisi
            }</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${
              item.tipe_munisi
            }</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${
              item.stok_munisi !== null ? item.stok_munisi : "N/A"
            }</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${
              item.tahun_munisi !== null ? item.tahun_munisi : "N/A"
            }</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${
              item.manufaktur ? item.manufaktur.nama_manufaktur : "N/A"
            }</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">
              <button class="edit-button bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs" data-id="${
                item.id_munisi
              }">Edit</button>
              <button class="delete-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs" data-id="${
                item.id_munisi
              }">Delete</button>
            </td>
          `;
        });
      } else {
        munisiTableBody.innerHTML =
          '<tr><td colspan="7" class="text-center py-4">No munisi data found.</td></tr>';
      }
      addEventListenersToButtons();
    } catch (error) {
      displayMunisiMessage("Failed to fetch munisi.", "error");
    }
  }

  function openModal(munisiItem = null) {
    munisiForm.reset();
    manufakturSelect.value = ""; // Reset select
    if (munisiItem) {
      modalTitleText.textContent = "Edit Munisi";
      munisiIdInput.value = munisiItem.id_munisi;
      document.getElementById("nama_munisi").value = munisiItem.nama_munisi;
      document.getElementById("tipe_munisi").value = munisiItem.tipe_munisi;
      document.getElementById("stok_munisi").value = munisiItem.stok_munisi;
      document.getElementById("tahun_munisi").value = munisiItem.tahun_munisi;
      if (munisiItem.id_manufaktur) {
        manufakturSelect.value = munisiItem.id_manufaktur;
      }
    } else {
      modalTitleText.textContent = "Add New Munisi";
      munisiIdInput.value = "";
    }
    munisiModal.classList.remove("hidden");
  }

  function closeModal() {
    munisiModal.classList.add("hidden");
    munisiForm.reset();
  }

  addMunisiButton.addEventListener("click", () => openModal());
  cancelModalButton.addEventListener("click", closeModal);

  munisiForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(munisiForm);
    const data = Object.fromEntries(formData.entries());
    const id = munisiIdInput.value;

    // Convert empty strings for numbers to null for backend compatibility if needed
    if (data.stok_munisi === "") data.stok_munisi = null;
    if (data.tahun_munisi === "") data.tahun_munisi = null;
    if (data.id_manufaktur === "") data.id_manufaktur = null;

    try {
      if (id) {
        await apiRequest(`/munisipesawat/${id}`, "PUT", data);
        displayMunisiMessage("Munisi updated successfully!", "info");
      } else {
        await apiRequest("/munisipesawat", "POST", data);
        displayMunisiMessage("Munisi added successfully!", "info");
      }
      fetchMunisi();
      closeModal();
    } catch (error) {
      // displayMunisiMessage already called by apiRequest
    }
  });

  function addEventListenersToButtons() {
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const itemToEdit = currentMunisi.find(
          (item) => item.id_munisi.toString() === id
        );
        if (itemToEdit) {
          openModal(itemToEdit);
        }
      });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this munisi?")) {
          try {
            await apiRequest(`/munisipesawat/${id}`, "DELETE");
            displayMunisiMessage("Munisi deleted successfully!", "info");
            fetchMunisi();
          } catch (error) {
            // displayMunisiMessage already called by apiRequest
          }
        }
      });
    });
  }

  // Initial fetches
  fetchManufaktursForSelect();
  fetchMunisi();
});
