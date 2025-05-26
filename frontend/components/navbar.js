// frontend/components/navbar.js
function renderNavbar(activePage = "") {
  const navbarHTML = `
        <nav class="bg-gray-800 p-4 shadow-lg">
            <div class="container mx-auto flex justify-between items-center">
                <a href="dashboard.html" class="text-white text-xl font-bold hover:text-gray-300">Alutsista Dashboard</a>
                <div class="space-x-4">
                    <a href="dashboard.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                      activePage === "dashboard" ? "bg-gray-900 text-white" : ""
                    }">Dashboard</a>
                    <a href="manufaktur.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                      activePage === "manufaktur"
                        ? "bg-gray-900 text-white"
                        : ""
                    }">Manufaktur</a>
                    <a href="munisi.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                      activePage === "munisi" ? "bg-gray-900 text-white" : ""
                    }">Munisi</a>
                    <a href="pesawat.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                      activePage === "pesawat" ? "bg-gray-900 text-white" : ""
                    }">Pesawat</a>
                    <button id="logout-button" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm">Logout</button>
                </div>
            </div>
        </nav>
        <div id="global-message" class="text-center my-2"></div>
    `;
  const body = document.querySelector("body");
  body.insertAdjacentHTML("afterbegin", navbarHTML);

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", logoutUser);
  }
}
