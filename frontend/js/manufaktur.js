// frontend/js/manufaktur.js
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  renderNavbar("manufaktur");

  const manufakturTableBody = document.getElementById("manufaktur-table-body");
  const addManufakturButton = document.getElementById("add-manufaktur-button");
  const manufakturModal = document.getElementById("manufaktur-modal");
  const manufakturForm = document.getElementById("manufaktur-form");
  const cancelModalButton = document.getElementById("cancel-modal-button");
  const modalTitleText = document.getElementById("modal-title-text");
  const manufakturIdInput = document.getElementById("manufaktur-id");
  const messageContainer = document.getElementById(
    "manufaktur-message-container"
  );

  let currentManufakturs = []; // To store fetched manufakturs

  function displayManufakturMessage(message, type) {
    displayMessage(message, type, "manufaktur-message-container");
  }

  // Fetch and display all manufakturs
  async function fetchManufakturs() {
    try {
      const data = await apiRequest("/manufaktur", "GET"); //
      currentManufakturs = data; // Store the fetched data
      manufakturTableBody.innerHTML = ""; // Clear existing rows
      if (data && data.length > 0) {
        data.forEach((manufaktur) => {
          const row = manufakturTableBody.insertRow();
          row.innerHTML = `
                        <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${manufaktur.id_manufaktur}</td>
                        <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${manufaktur.nama_manufaktur}</td>
                        <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">${manufaktur.negara}</td>
                        <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            <button class="edit-button bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs" data-id="${manufaktur.id_manufaktur}">Edit</button>
                            <button class="delete-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs" data-id="${manufaktur.id_manufaktur}">Delete</button>
                        </td>
                    `;
        });
      } else {
        manufakturTableBody.innerHTML =
          '<tr><td colspan="4" class="text-center py-4">No manufaktur data found.</td></tr>';
      }
      addEventListenersToButtons();
    } catch (error) {
      displayManufakturMessage("Failed to fetch manufakturs.", "error");
      // console.error('Failed to fetch manufakturs:', error); // Logged by apiRequest
    }
  }

  function openModal(manufaktur = null) {
    manufakturForm.reset();
    if (manufaktur) {
      modalTitleText.textContent = "Edit Manufaktur";
      manufakturIdInput.value = manufaktur.id_manufaktur;
      document.getElementById("nama_manufaktur").value =
        manufaktur.nama_manufaktur;
      document.getElementById("negara").value = manufaktur.negara;
    } else {
      modalTitleText.textContent = "Add New Manufaktur";
      manufakturIdInput.value = ""; // Clear ID for new entry
    }
    manufakturModal.classList.remove("hidden");
  }

  function closeModal() {
    manufakturModal.classList.add("hidden");
    manufakturForm.reset();
  }

  addManufakturButton.addEventListener("click", () => openModal());
  cancelModalButton.addEventListener("click", closeModal);

  manufakturForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(manufakturForm);
    const data = Object.fromEntries(formData.entries());
    const id = manufakturIdInput.value;

    try {
      if (id) {
        // Update existing
        await apiRequest(`/manufaktur/${id}`, "PUT", data); //
        displayManufakturMessage("Manufaktur updated successfully!", "info");
      } else {
        // Create new
        await apiRequest("/manufaktur", "POST", data); //
        displayManufakturMessage("Manufaktur added successfully!", "info");
      }
      fetchManufakturs();
      closeModal();
    } catch (error) {
      // Message is handled by apiRequest, but you can add specific logic here if needed
      // displayManufakturMessage(error.message || `Failed to ${id ? 'update' : 'add'} manufaktur.`, 'error');
      // console.error(`Failed to ${id ? 'update' : 'add'} manufaktur:`, error); // Logged by apiRequest
    }
  });

  function addEventListenersToButtons() {
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const manufakturToEdit = currentManufakturs.find(
          (m) => m.id_manufaktur.toString() === id
        );
        if (manufakturToEdit) {
          openModal(manufakturToEdit);
        }
      });
    });

    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this manufaktur?")) {
          try {
            await apiRequest(`/manufaktur/${id}`, "DELETE"); //
            displayManufakturMessage(
              "Manufaktur deleted successfully!",
              "info"
            );
            fetchManufakturs();
          } catch (error) {
            // displayManufakturMessage(error.message || 'Failed to delete manufaktur.', 'error');
            // console.error('Failed to delete manufaktur:', error); // Logged by apiRequest
          }
        }
      });
    });
  }

  // Initial fetch
  fetchManufakturs();
});
