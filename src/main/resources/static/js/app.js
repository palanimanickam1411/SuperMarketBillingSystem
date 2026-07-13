// Session Guard: Check login state except on login.html page
const isLoginPage = window.location.pathname.endsWith("login.html");
if (!isLoginPage && localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

// API endpoints
const APP_BILL_API = "/api/bills";
const APP_PRODUCT_API = "/api/products";
const APP_CUSTOMER_API = "/api/customers";

document.addEventListener("DOMContentLoaded", () => {
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("open");
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener("click", (e) => {
            if (sidebar.classList.contains("open") && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
                sidebar.classList.remove("open");
            }
        });
    }

    // ---- Dynamic Profile ----
    applyProfileToPage();

    const userProfile = document.querySelector(".user-profile");
    if (userProfile) {
        // Build dropdown
        const dropdown = document.createElement("div");
        dropdown.className = "profile-dropdown";
        dropdown.id = "profileDropdown";
        const profileName = getProfileName();
        dropdown.innerHTML = `
            <div class="dropdown-header">Logged in as <strong id="dropdownNameLabel">${profileName}</strong></div>
            <button class="dropdown-item" id="editProfileBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" onclick="logoutUser()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
            </button>
        `;
        userProfile.parentNode.insertBefore(dropdown, userProfile.nextSibling);
        
        userProfile.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("open");
        });
        
        document.addEventListener("click", () => {
            dropdown.classList.remove("open");
        });

        // Edit Profile button
        dropdown.querySelector("#editProfileBtn").addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.remove("open");
            openEditProfileModal();
        });
    }

    // Inject Edit Profile modal into body (once)
    if (!document.getElementById("editProfileModal")) {
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        modal.id = "editProfileModal";
        modal.innerHTML = `
            <div class="modal-box">
                <h2 class="modal-title">Edit Profile</h2>
                <div class="modal-avatar-preview" id="modalAvatarPreview"></div>
                <div class="form-group" style="text-align:left; margin-bottom:16px;">
                    <label for="profileNameInput" style="font-weight:600; font-size:14px; display:block; margin-bottom:6px;">Display Name</label>
                    <input type="text" id="profileNameInput" class="form-control" placeholder="Enter your name" maxlength="30">
                </div>
                <input type="file" id="profilePicInput" accept="image/*" style="display:none;">
                <div class="modal-footer">
                    <button class="btn btn-outline btn-sm" id="modalCancelBtn">Cancel</button>
                    <button class="btn btn-primary btn-sm" id="modalSaveBtn">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeEditProfileModal();
        });
        document.getElementById("modalCancelBtn").addEventListener("click", closeEditProfileModal);
        document.getElementById("modalSaveBtn").addEventListener("click", saveProfile);
    }

    // Load dashboard stats if we are on the index.html page
    if (document.getElementById("totalRevenue")) {
        loadDashboardData();
    }
});

// ---- Profile Helpers ----

function getProfileName() {
    return localStorage.getItem("profileName") || "Admin";
}

function getProfilePic() {
    return localStorage.getItem("profilePic") || null;
}

function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function applyProfileToPage() {
    const name = getProfileName();
    const pic  = getProfilePic();
    const initials = getInitials(name);

    // Update all user-name spans
    document.querySelectorAll(".user-name").forEach(el => { el.textContent = name; });

    // Collect ALL avatar elements — both <img class="user-avatar"> and <div class="user-avatar-initials">
    const avatarEls = document.querySelectorAll(".user-avatar, .user-avatar-initials");

    avatarEls.forEach(el => {
        if (pic) {
            // Need a photo — ensure it is an <img>
            if (el.tagName === "IMG") {
                el.src = pic;
                el.alt = name;
                el.className = "user-avatar";
            } else {
                // Replace the initials div with an img
                const img = document.createElement("img");
                img.src = pic;
                img.alt = name;
                img.className = "user-avatar";
                el.parentNode.replaceChild(img, el);
            }
        } else {
            // No photo — ensure it is an initials div
            if (el.tagName !== "IMG") {
                el.className = "user-avatar-initials";
                el.textContent = initials;
            } else {
                // Replace the img with an initials div
                const div = document.createElement("div");
                div.className = "user-avatar-initials";
                div.textContent = initials;
                el.parentNode.replaceChild(div, el);
            }
        }
    });
}

function openEditProfileModal() {
    const modal = document.getElementById("editProfileModal");
    const nameInput = document.getElementById("profileNameInput");
    const preview = document.getElementById("modalAvatarPreview");
    const picInput = document.getElementById("profilePicInput");
    const name = getProfileName();
    const pic = getProfilePic();

    nameInput.value = name;
    renderModalAvatar(preview, name, pic);

    // Update preview on name change
    nameInput.oninput = () => renderModalAvatar(preview, nameInput.value || "?", getProfilePic());

    // Upload pic click
    let uploadLabel = preview.querySelector(".modal-avatar-label");
    if (!uploadLabel) {
        uploadLabel = document.createElement("span");
        uploadLabel.className = "modal-avatar-label";
        uploadLabel.textContent = "Upload Photo";
        preview.appendChild(uploadLabel);
    }
    uploadLabel.onclick = () => picInput.click();

    picInput.onchange = () => {
        const file = picInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            localStorage.setItem("profilePic", ev.target.result);
            renderModalAvatar(preview, nameInput.value || "?", ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    modal.classList.add("open");
}

function renderModalAvatar(preview, name, pic) {
    let circle = preview.querySelector(".modal-avatar-circle, .modal-avatar-img");
    if (!circle) {
        circle = document.createElement(pic ? "img" : "div");
        preview.insertBefore(circle, preview.firstChild);
    }
    if (pic) {
        circle.outerHTML = `<img src="${pic}" class="modal-avatar-img" alt="Avatar">`;
    } else {
        const initials = getInitials(name);
        if (circle.tagName === "IMG") {
            const d = document.createElement("div");
            d.className = "modal-avatar-circle";
            d.textContent = initials;
            preview.insertBefore(d, preview.firstChild);
            circle.remove();
        } else {
            circle.className = "modal-avatar-circle";
            circle.textContent = getInitials(name);
        }
    }
    // Ensure upload label present
    if (!preview.querySelector(".modal-avatar-label")) {
        const lbl = document.createElement("span");
        lbl.className = "modal-avatar-label";
        lbl.textContent = "Upload Photo";
        preview.appendChild(lbl);
    }
}

function closeEditProfileModal() {
    const modal = document.getElementById("editProfileModal");
    if (modal) modal.classList.remove("open");
}

function saveProfile() {
    const nameInput = document.getElementById("profileNameInput");
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    localStorage.setItem("profileName", name);
    closeEditProfileModal();
    applyProfileToPage();
    // Refresh dropdown label
    const lbl = document.getElementById("dropdownNameLabel");
    if (lbl) lbl.textContent = name;
    showToast("Profile updated successfully!");
}

// Logout handler
window.logoutUser = function() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
};


// Toast notification helper
function showToast(message, type = 'success') {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? '#10b981' : '#ef4444'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }
    
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// Fetch dashboard totals and fill UI
function loadDashboardData() {
    // 1. Get all bills for revenue & invoice stats
    fetch(APP_BILL_API)
        .then(res => res.json())
        .then(bills => {
            const billCount = bills.length;
            const revenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
            
            document.getElementById("totalInvoices").textContent = billCount;
            document.getElementById("totalRevenue").textContent = `₹${revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
            renderRecentBills(bills);
        })
        .catch(err => {
            console.error("Error loading bills stats:", err);
            showToast("Failed to load invoice statistics", "error");
        });

    // 2. Get all products count
    fetch(APP_PRODUCT_API)
        .then(res => res.json())
        .then(products => {
            document.getElementById("totalProducts").textContent = products.length;
        })
        .catch(err => console.error("Error loading products count:", err));

    // 3. Get all customers count
    fetch(APP_CUSTOMER_API)
        .then(res => res.json())
        .then(customers => {
            document.getElementById("totalCustomers").textContent = customers.length;
        })
        .catch(err => console.error("Error loading customers count:", err));
}

// Render dynamic recent transactions list
function renderRecentBills(bills) {
    const tbody = document.getElementById("recentBillsTable");
    if (!tbody) return;
    
    if (bills.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">
                    No transactions generated yet.
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort descending by bill ID (latest transactions first) and take top 5
    const latestBills = [...bills].sort((a, b) => b.id - a.id).slice(0, 5);
    
    let html = "";
    latestBills.forEach(bill => {
        const custName = bill.customer && bill.customer.customerName ? bill.customer.customerName : "Walk-in Customer";
        const dateFormatted = bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-GB') : "N/A";
        
        html += `
            <tr>
                <td><strong>#INV-${bill.id}</strong></td>
                <td>${custName}</td>
                <td>${dateFormatted}</td>
                <td><strong>₹${bill.totalAmount.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="deleteBill(${bill.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Support deletion directly from dashboard
function deleteBill(id) {
    if (!confirm("Are you sure you want to delete this invoice? This cannot be undone.")) return;
    
    fetch(`${APP_BILL_API}/${id}`, {
        method: "DELETE"
    })
    .then(() => {
        showToast("Invoice deleted successfully");
        loadDashboardData();
    })
    .catch(err => {
        console.error("Error deleting bill:", err);
        showToast("Failed to delete invoice", "error");
    });
}
