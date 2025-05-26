// frontend/js/pesawat.js
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  renderNavbar("pesawat");

  const pesawatTableBody = document.getElementById("pesawat-table-body");
  const addPesawatButton = document.getElementById("add-pesawat-button");
  const pesawatModal = document.getElementById("pesawat-modal");
  const pesawatForm = document.getElementById("pesawat-form");
  const cancelModalButton = document.getElementById("cancel-modal-button");
  const modalTitleText = document.getElementById("modal-title-text");
  const pesawatIdInput = document.getElementById("pesawat-id");
  const manufakturSelectPesawat = document.getElementById(
    "id_manufaktur_pesawat"
  );
  const munisiSelectPesawat = document.getElementById("id_munisi_pesawat");
  const messageContainer = document.getElementById("pesawat-message-container");

  // Image related elements
  const gambarPesawatFileInput = document.getElementById("gambar_pesawat_file");
  const gambarUrlTextInput = document.getElementById("gambar_url_text");
  const currentImagePreview = document.getElementById("current-image-preview");
  const currentImageUrlText = document.getElementById("current-image-url");
  const hapusGambarCheckbox = document.getElementById("hapus_gambar_sebelumnya_checkbox");


  let currentPesawatData = []; // Renamed to avoid conflict
  // let manufakturs = []; // Already declared, keep for scope
  // let munisiList = []; // Already declared, keep for scope

  function displayPesawatMessage(message, type) {
    displayMessage(message, type, "pesawat-message-container");
  }

  async function fetchManufaktursForSelect() {
    try {
      const data = await apiRequest("/manufaktur", "GET");
      // manufakturs = data; // Already global in this scope
      manufakturSelectPesawat.innerHTML =
        '<option value="">Select Manufaktur</option>';
      if (data && data.length > 0) {
        data.forEach((manufaktur) => {
          const option = document.createElement("option");
          option.value = manufaktur.id_manufaktur;
          option.textContent = manufaktur.nama_manufaktur;
          manufakturSelectPesawat.appendChild(option);
        });
      }
    } catch (error) {
      displayPesawatMessage(
        "Failed to fetch manufakturs for selection.",
        "error"
      );
    }
  }

  async function fetchMunisiForSelect() {
    try {
      const data = await apiRequest("/munisipesawat", "GET");
      // munisiList = data; // Already global
      munisiSelectPesawat.innerHTML = '<option value="">Select Munisi</option>';
      if (data && data.length > 0) {
        data.forEach((munisi) => {
          const option = document.createElement("option");
          option.value = munisi.id_munisi;
          option.textContent = `${munisi.nama_munisi} (${munisi.tipe_munisi})`;
          munisiSelectPesawat.appendChild(option);
        });
      }
    } catch (error) {
      displayPesawatMessage("Failed to fetch munisi for selection.", "error");
    }
  }

  async function fetchPesawat() {
    try {
      const data = await apiRequest("/pesawat", "GET");
      currentPesawatData = data;
      pesawatTableBody.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach((item) => {
          const row = pesawatTableBody.insertRow();
          const API_URL_FOR_IMAGES = "http://localhost:5000"; // Adjust if your API serves from a different base
          const gambarSrc = item.gambar_url ? (item.gambar_url.startsWith('http') ? item.gambar_url : `${API_URL_FOR_IMAGES}${item.gambar_url}`) : '';
          const gambarCellHTML = gambarSrc
            ? `<img src="${gambarSrc}" alt="${item.nama_pesawat}" class="h-16 w-auto object-cover">`
            : "N/A";

          row.innerHTML = `
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.id_pesawat}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.nama_pesawat}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.tipe_pesawat}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.variant_pesawat || "N/A"}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.jumlah_pesawat !== null ? item.jumlah_pesawat : "N/A"}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.tahun_pesawat !== null ? item.tahun_pesawat : "N/A"}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.manufakturPesawat ? item.manufakturPesawat.nama_manufaktur : "N/A"}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${item.menggunakanMunisi ? item.menggunakanMunisi.nama_munisi : "N/A"}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${gambarCellHTML}</td>
            <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">
              <button class="edit-button bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs" data-id="${item.id_pesawat}">Edit</button>
              <button class="delete-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs" data-id="${item.id_pesawat}">Delete</button>
            </td>
          `;
        });
      } else {
        pesawatTableBody.innerHTML =
          '<tr><td colspan="10" class="text-center py-4">No pesawat data found.</td></tr>';
      }
      addEventListenersToButtons();
    } catch (error) {
      displayPesawatMessage("Failed to fetch pesawat.", "error");
    }
  }

  function openModal(pesawatItem = null) {
    pesawatForm.reset(); // Resets all form fields, including file input
    manufakturSelectPesawat.value = "";
    munisiSelectPesawat.value = "";
    hapusGambarCheckbox.checked = false; // Uncheck the delete box

    // Image preview reset
    currentImagePreview.classList.add("hidden");
    currentImagePreview.src = "#";
    currentImageUrlText.textContent = "";


    if (pesawatItem) {
      modalTitleText.textContent = "Edit Pesawat";
      pesawatIdInput.value = pesawatItem.id_pesawat;
      document.getElementById("nama_pesawat").value = pesawatItem.nama_pesawat;
      document.getElementById("tipe_pesawat").value = pesawatItem.tipe_pesawat;
      document.getElementById("variant_pesawat").value = pesawatItem.variant_pesawat || "";
      document.getElementById("jumlah_pesawat").value = pesawatItem.jumlah_pesawat || "";
      document.getElementById("tahun_pesawat").value = pesawatItem.tahun_pesawat || "";
      
      // gambarUrlTextInput.value = pesawatItem.gambar_url || ""; // Set if it's a URL from DB
      // For editing, show current image if available
      if (pesawatItem.gambar_url) {
        const API_URL_FOR_IMAGES = "http://localhost:5000";
        const imgSrc = pesawatItem.gambar_url.startsWith('http') ? pesawatItem.gambar_url : `${API_URL_FOR_IMAGES}${pesawatItem.gambar_url}`;
        currentImagePreview.src = imgSrc;
        currentImagePreview.classList.remove("hidden");
        currentImageUrlText.textContent = `Current: ${pesawatItem.gambar_url}`;
        // If the stored URL is not a file upload path, put it in the text field
        if (!pesawatItem.gambar_url.startsWith('/uploads/pesawat/')) {
            gambarUrlTextInput.value = pesawatItem.gambar_url;
        } else {
            gambarUrlTextInput.value = ''; // Clear text URL if it was an upload
        }
      } else {
        gambarUrlTextInput.value = '';
      }


      if (pesawatItem.id_manufaktur) {
        manufakturSelectPesawat.value = pesawatItem.id_manufaktur;
      }
      if (pesawatItem.id_munisi) {
        munisiSelectPesawat.value = pesawatItem.id_munisi;
      }
    } else {
      modalTitleText.textContent = "Add New Pesawat";
      pesawatIdInput.value = "";
      gambarUrlTextInput.value = "";
    }
    gambarPesawatFileInput.value = ""; // Explicitly clear file input
    pesawatModal.classList.remove("hidden");
  }

  function closeModal() {
    pesawatModal.classList.add("hidden");
    pesawatForm.reset();
  }

  addPesawatButton.addEventListener("click", () => openModal());
  cancelModalButton.addEventListener("click", closeModal);

  pesawatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(pesawatForm); // Use FormData directly
    const id = pesawatIdInput.value;

    // Ensure empty optional number fields that are not set are not sent as "0" or empty string if backend expects null
    // FormData handles empty text fields as empty strings. Multer/backend will get them.
    // For optional numeric fields or foreign keys, if not set, they should be omitted or handled by backend if sent as empty.
    // Example: if 'jumlah_pesawat' is empty, formData.get('jumlah_pesawat') is ''. Backend needs to handle this.
    // Backend seems to handle nulls for these, so empty string might be coerced or cause issues if not handled.

    // If id_manufaktur or id_munisi is empty, remove it from formData so backend uses null or default.
    if (formData.get('id_manufaktur') === "") {
        formData.delete('id_manufaktur');
    }
    if (formData.get('id_munisi') === "") {
        formData.delete('id_munisi');
    }
     if (formData.get('jumlah_pesawat') === "") {
        formData.set('jumlah_pesawat', null); // Or delete if backend handles absence
    }
    if (formData.get('tahun_pesawat') === "") {
        formData.set('tahun_pesawat', null); // Or delete
    }

    // The 'hapus_gambar_sebelumnya_checkbox' is either 'on' or not present.
    // The backend controller has logic for 'hapus_gambar_sebelumnya' based on 'true' string.
    if (hapusGambarCheckbox.checked) {
        formData.set('hapus_gambar_sebelumnya', 'true');
    } else {
        formData.delete('hapus_gambar_sebelumnya'); // Or set to 'false' if backend expects it
    }


    try {
      let response;
      if (id) {
        response = await apiRequest(`/pesawat/${id}`, "PUT", formData);
        displayPesawatMessage("Pesawat updated successfully!", "info");
      } else {
        response = await apiRequest("/pesawat", "POST", formData);
        displayPesawatMessage("Pesawat added successfully!", "info");
      }
      fetchPesawat();
      closeModal();
    } catch (error) {
      // displayMessage is called by apiRequest
      // No need to call displayPesawatMessage here as apiRequest already does.
    }
  });

  function addEventListenersToButtons() {
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const itemToEdit = currentPesawatData.find(
          (item) => item.id_pesawat.toString() === id
        );
        if (itemToEdit) {
          openModal(itemToEdit);
        }
      });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this pesawat?")) {
          try {
            await apiRequest(`/pesawat/${id}`, "DELETE");
            displayPesawatMessage("Pesawat deleted successfully!", "info");
            fetchPesawat();
          } catch (error) {
            // displayMessage is called by apiRequest
          }
        }
      });
    });
  }

  // Initial fetches
  fetchManufaktursForSelect();
  fetchMunisiForSelect();
  fetchPesawat();
});