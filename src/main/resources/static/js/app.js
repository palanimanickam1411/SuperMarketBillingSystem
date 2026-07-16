// Session Guard: Handled by Spring Security on the backend
// The backend will redirect unauthorized users to login.html

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
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/logout";
    document.body.appendChild(form);
    form.submit();
};


// Toast notification helper
function showToast(message, type = 'success') {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${type === 'success' ? '#2e1065' : '#ef4444'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
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
let _allBillsCache = [];

function loadDashboardData() {
    const now = new Date();
    const currentYear  = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const monthName = now.toLocaleString('default', { month: 'long' });
    const todayString = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    // Set month/year name labels
    ['currentMonthName', 'currentMonthName2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = monthName;
    });
    const yearLabelEl = document.getElementById('currentYearLabel');
    if (yearLabelEl) yearLabelEl.textContent = currentYear;

    // 1. Get all bills
    fetch(APP_BILL_API)
        .then(res => res.json())
        .then(bills => {
            _allBillsCache = bills;

            // Filter bills for current month
            const monthBills = bills.filter(bill => {
                if (!bill.billDate) return false;
                const d = new Date(bill.billDate);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            });

            // Filter bills for today
            const todayBills = bills.filter(bill => bill.billDate === todayString);

            // Filter bills for current year
            const yearBills = bills.filter(bill => {
                if (!bill.billDate) return false;
                const d = new Date(bill.billDate);
                return d.getFullYear() === currentYear;
            });

            const monthRevenue = monthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
            const todayRev = todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

            // Update monthly stats
            const totalRevEl = document.getElementById("totalRevenue");
            if (totalRevEl) totalRevEl.textContent = `₹${monthRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            const totalInvEl = document.getElementById("totalInvoices");
            if (totalInvEl) totalInvEl.textContent = monthBills.length;

            // Update today's stats
            const todayRevEl = document.getElementById("todayRevenue");
            if (todayRevEl) todayRevEl.textContent = `₹${todayRev.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            const todayInvEl = document.getElementById("todayInvoices");
            if (todayInvEl) todayInvEl.textContent = todayBills.length;

            // Update yearly stats
            const yearlyInvEl = document.getElementById("yearlyInvoices");
            if (yearlyInvEl) yearlyInvEl.textContent = yearBills.length;

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

}

// Helper: build invoice display label (monthly number if available, else DB id)
function invoiceLabel(bill) {
    if (bill.monthlyInvoiceNumber != null && bill.billDate) {
        const d = new Date(bill.billDate);
        const mon = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        const yr  = d.getFullYear();
        return `#${mon}-${yr}-${String(bill.monthlyInvoiceNumber).padStart(3, '0')}`;
    }
    return `#INV-${bill.id}`;
}

// Open invoice list modal — 'month' or 'today'
function openInvoicesModal(type) {
    const modal = document.getElementById("invoicesModal");
    const titleEl = document.getElementById("invoicesModalTitle");
    const tbody = document.getElementById("invoicesModalTable");
    if (!modal || !tbody) return;

    const now = new Date();
    const currentYear  = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthName    = now.toLocaleString('default', { month: 'long' });
    const todayString  = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    let filteredBills = [];
    if (type === 'month') {
        titleEl.textContent = `Invoices — ${monthName} ${currentYear}`;
        filteredBills = _allBillsCache.filter(bill => {
            if (!bill.billDate) return false;
            const d = new Date(bill.billDate);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });
    } else {
        titleEl.textContent = `Today's Invoices — ${todayString}`;
        filteredBills = _allBillsCache.filter(bill => bill.billDate === todayString);
    }

    // Sort by monthly invoice number asc (or id)
    filteredBills = [...filteredBills].sort((a, b) => (a.monthlyInvoiceNumber || a.id) - (b.monthlyInvoiceNumber || b.id));

    if (filteredBills.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No invoices found for this period.</td></tr>`;
    } else {
        let html = '';
        filteredBills.forEach(bill => {
            const custName = bill.customerName || "Walk-in Customer";
            const dateFormatted = bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-GB') : "N/A";
            html += `
                <tr>
                    <td><strong>${invoiceLabel(bill)}</strong></td>
                    <td>${custName}</td>
                    <td>${dateFormatted}</td>
                    <td><strong>₹${(bill.totalAmount || 0).toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="viewInvoicePdf(${bill.id})" style="margin-right:4px;">View</button>
                        <button class="btn btn-primary btn-sm" onclick="downloadInvoicePdf(${bill.id})" style="margin-right:4px;">Download PDF</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBillFromModal(${bill.id}, '${type}')">Delete</button>
                    </td>
                </tr>`;
        });
        tbody.innerHTML = html;
    }

    modal.classList.add('open');
}

function closeInvoicesModal(e) {
    const modal = document.getElementById("invoicesModal");
    if (!modal) return;
    if (!e || e.target === modal) {
        modal.classList.remove('open');
    }
}

// Open yearly breakdown modal
function openYearlyModal() {
    const modal = document.getElementById("yearlyModal");
    const titleEl = document.getElementById("yearlyModalTitle");
    const tbody = document.getElementById("yearlyModalTable");
    const summaryEl = document.getElementById("yearlyModalSummary");
    if (!modal || !tbody) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    titleEl.textContent = `Invoice Breakdown — ${currentYear}`;

    // Filter year's bills
    const yearBills = _allBillsCache.filter(bill => {
        if (!bill.billDate) return false;
        return new Date(bill.billDate).getFullYear() === currentYear;
    });

    if (yearBills.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:30px; color:var(--text-muted);">No invoices found for ${currentYear}.</td></tr>`;
        if (summaryEl) summaryEl.textContent = '';
        modal.classList.add('open');
        return;
    }

    // Group by month (0-indexed)
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthMap = {}; // monthIndex -> { count, revenue }
    yearBills.forEach(bill => {
        const m = new Date(bill.billDate).getMonth();
        if (!monthMap[m]) monthMap[m] = { count: 0, revenue: 0 };
        monthMap[m].count++;
        monthMap[m].revenue += bill.totalAmount || 0;
    });

    // Build sorted rows (only months with data)
    const sortedMonths = Object.keys(monthMap).map(Number).sort((a, b) => a - b);
    let html = '';
    let totalCount = 0;
    let totalRevenue = 0;
    sortedMonths.forEach(m => {
        const { count, revenue } = monthMap[m];
        totalCount += count;
        totalRevenue += revenue;
        html += `
            <tr>
                <td><strong>${MONTH_NAMES[m]}</strong></td>
                <td>${count}</td>
                <td>₹${revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>`;
    });
    tbody.innerHTML = html;

    if (summaryEl) {
        summaryEl.innerHTML = `
            <span style="margin-right:24px;">Total Invoices: <span style="color:var(--primary);">${totalCount}</span></span>
            <span>Total Revenue: <span style="color:var(--primary);">₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>`;
    }

    modal.classList.add('open');
}

function closeYearlyModal(e) {
    const modal = document.getElementById("yearlyModal");
    if (!modal) return;
    if (!e || e.target === modal) {
        modal.classList.remove('open');
    }
}

// Delete bill and refresh modal
function deleteBillFromModal(id, modalType) {
    if (!confirm("Are you sure you want to delete this invoice? This cannot be undone.")) return;
    fetch(`${APP_BILL_API}/${id}`, { method: "DELETE" })
    .then(res => {
        if (!res.ok) throw new Error('Failed to delete invoice');
        showToast("Invoice deleted successfully");
        loadDashboardData();
        setTimeout(() => openInvoicesModal(modalType), 700);
    })
    .catch(err => {
        console.error("Error deleting bill:", err);
        showToast("Failed to delete invoice", "error");
    });
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
        const custName = bill.customerName || "Walk-in Customer";
        const dateFormatted = bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-GB') : "N/A";
        
        html += `
            <tr>
                <td><strong>${invoiceLabel(bill)}</strong></td>
                <td>${custName}</td>
                <td>${dateFormatted}</td>
                <td><strong>₹${(bill.totalAmount || 0).toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="viewInvoicePdf(${bill.id})" style="margin-right: 4px;">View</button>
                    <button class="btn btn-primary btn-sm" onclick="downloadInvoicePdf(${bill.id})" style="margin-right: 4px;">Download PDF</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBill(${bill.id})">Delete</button>
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
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to delete invoice');
        }
        showToast("Invoice deleted successfully");
        loadDashboardData();
    })
    .catch(err => {
        console.error("Error deleting bill:", err);
        showToast("Failed to delete invoice", "error");
    });
}

// Download invoice PDF from dashboard
function downloadInvoicePdf(billId) {
    showToast("Generating PDF... Please wait.");
    Promise.all([
        fetch(`${APP_BILL_API}/${billId}`).then(res => res.json()),
        fetch(`/api/bill-items/bill/${billId}`).then(res => res.json())
    ])
    .then(([bill, billItems]) => {
        if (!billItems || billItems.length === 0) {
            showToast("No items found for this invoice", "error");
            return;
        }
        generateColorfulPdf(bill, billItems, 'download');
    })
    .catch(err => {
        console.error("Error generating PDF:", err);
        showToast("Failed to generate PDF", "error");
    });
}

function viewInvoicePdf(billId) {
    showToast("Opening invoice... Please wait.");
    Promise.all([
        fetch(`${APP_BILL_API}/${billId}`).then(res => res.json()),
        fetch(`/api/bill-items/bill/${billId}`).then(res => res.json())
    ])
    .then(([bill, billItems]) => {
        if (!billItems || billItems.length === 0) {
            showToast("No items found for this invoice", "error");
            return;
        }
        generateColorfulPdf(bill, billItems, 'view');
    })
    .catch(err => {
        console.error("Error opening PDF:", err);
        showToast("Failed to open PDF", "error");
    });
}

function generateColorfulPdf(bill, billItems, action) {
    const custName = bill.customerName || "Walk-in Customer";
    const custPhone = bill.customerPhone || "";
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;

    // ── HEADER BAND ──────────────────────────────────────────────────────────
    doc.setFillColor(46, 16, 101);          // dark purple
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Accent stripe (orange/gold, like example)
    doc.setFillColor(234, 179, 8);
    doc.rect(0, 38, pageWidth, 7, 'F');

    // Brand name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text("BILL BEE", 14, 22);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("SUPERMARKET", 14, 30);

    // Invoice label on the right
    doc.setFontSize(9);
    doc.setTextColor(220, 200, 255);
    doc.text(`INVOICE NO: ${invoiceLabel(bill)}`, 130, 22);
    doc.text(`Date: ${bill.billDate}`, 130, 29);

    // ── BILL-TO SECTION ───────────────────────────────────────────────────────
    // Left column: empty (could add store address later)
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Bill Bee Supermarket", 14, 60);
    doc.text("Your one-stop billing solution", 14, 65);

    // Right column: customer
    doc.setTextColor(46, 16, 101);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice to:", 130, 56);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(custName, 130, 65);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    if (custPhone) {
        doc.text(`Phone: ${custPhone}`, 130, 71);
    }

    // ── ITEMS TABLE ───────────────────────────────────────────────────────────
    const tableColumn = ["Description", "Qty", "Unit Price (Rs.)", "Subtotal (Rs.)"];
    const tableRows = [];
    let subTotal = 0;

    billItems.forEach(item => {
        const lineTotal = item.price * item.quantity;
        subTotal += lineTotal;
        tableRows.push([
            item.product ? item.product.productName : "Unknown Item",
            String(item.quantity),
            item.price.toFixed(2),
            lineTotal.toFixed(2)
        ]);
    });

    doc.autoTable({
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: [46, 16, 101],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left'
        },
        columnStyles: {
            0: { halign: 'left', cellWidth: 80 },
            1: { halign: 'center', cellWidth: 20 },
            2: { halign: 'right', cellWidth: 45 },
            3: { halign: 'right', cellWidth: 45 }
        },
        alternateRowStyles: { fillColor: [243, 232, 255] },
        styles: { fontSize: 10, cellPadding: 5 },
        margin: { left: 14, right: 14 }
    });

    // ── TOTALS SECTION ────────────────────────────────────────────────────────
    const finalY = doc.lastAutoTable.finalY + 8;
    
    let totalGstAmount = 0;
    billItems.forEach(item => {
        const catGst = item.product && item.product.category ? (item.product.category.gstRate || 0) : 0;
        totalGstAmount += (item.price * item.quantity) * (catGst / 100);
    });

    // Subtotal row
    doc.setFillColor(243, 232, 255);
    doc.rect(110, finalY, 86, 9, 'F');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", 114, finalY + 6);
    doc.text(`Rs. ${subTotal.toFixed(2)}`, 192, finalY + 6, null, null, "right");

    // Total GST row
    doc.setFillColor(255, 255, 255);
    doc.rect(110, finalY + 9, 86, 9, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(110, finalY + 9, 86, 9, 'S');
    doc.text("Item-wise GST", 114, finalY + 15);
    doc.text(`Rs. ${totalGstAmount.toFixed(2)}`, 192, finalY + 15, null, null, "right");

    // Grand Total row (dark purple)
    doc.setFillColor(46, 16, 101);
    doc.rect(110, finalY + 18, 86, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 114, finalY + 26);
    doc.text(`Rs. ${bill.totalAmount.toFixed(2)}`, 192, finalY + 26, null, null, "right");

    // ── FOOTER & DISCLAIMERS ──────────────────────────────────────────────────
    let footerY = finalY + 45;
    
    // Check if footer spills to next page
    if (footerY > 270) {
        doc.addPage();
        footerY = 20;
    }
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Note: GST is calculated separately for each product based on its category's applicable GST rate.", 15, footerY);

    footerY += 8;
    
    // Gold stripe footer
    doc.setFillColor(234, 179, 8);
    doc.rect(0, footerY + 20, pageWidth, 4, 'F');

    // Dark footer
    doc.setFillColor(46, 16, 101);
    doc.rect(0, footerY + 24, pageWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Thank You for Shopping!", 105, footerY + 34, null, null, "center");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 200, 255);
    doc.text("Bill Bee Supermarket  |  Powered by BillBee", 105, footerY + 39, null, null, "center");

    // ── SAVE OR OPEN ──────────────────────────────────────────────────────────
    if (action === 'download') {
        const fileName = invoiceLabel(bill).replace('#', '') + '.pdf';
        doc.save(fileName);
        showToast("Invoice PDF downloaded successfully!");
    } else {
        window.open(doc.output('bloburl'), '_blank');
        showToast("Invoice opened in new tab!");
    }
}
