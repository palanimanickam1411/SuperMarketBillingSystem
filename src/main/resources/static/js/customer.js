const CUSTOMER_API_URL = "/api/customers";

// Initial load
loadCustomers();

function loadCustomers() {
    const tableBody = document.getElementById("customerTable");
    if (!tableBody) return;

    fetch(CUSTOMER_API_URL)
        .then(res => res.json())
        .then(data => {
            let rows = "";
            if (data.length === 0) {
                rows = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">
                            No customers found. Use the form to register one.
                        </td>
                    </tr>
                `;
            } else {
                data.forEach(customer => {
                    const escapedName = customer.customerName.replace(/'/g, "\\'");
                    const escapedPhone = customer.phone ? customer.phone.replace(/'/g, "\\'") : "";

                    rows += `
                        <tr>
                            <td><strong>#CST-${customer.id}</strong></td>
                            <td>${customer.customerName}</td>
                            <td>${customer.phone || 'N/A'}</td>
                            <td style="text-align: right;">
                                <button class="btn btn-outline btn-sm" onclick="editCustomer(${customer.id}, '${escapedName}', '${escapedPhone}')" style="margin-right: 8px;">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${customer.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            tableBody.innerHTML = rows;
        })
        .catch(err => {
            console.error("Error loading customers:", err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ef4444; padding: 30px;">
                        Failed to fetch customers. Please ensure the backend is running.
                    </td>
                </tr>
            `;
        });
}

function saveCustomer() {
    const customerNameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("phone");
    const customerIdInput = document.getElementById("customerId");

    const customerName = customerNameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!customerName) {
        showToast("Customer name is required", "error");
        return;
    }
    if (!phone) {
        showToast("Phone number is required", "error");
        return;
    }

    const editId = customerIdInput.value;
    const isEdit = editId !== "";

    const customer = {
        customerName: customerName,
        phone: phone
    };

    const url = isEdit ? `${CUSTOMER_API_URL}/${editId}` : CUSTOMER_API_URL;
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(customer)
    })
    .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
    })
    .then(() => {
        showToast(isEdit ? "Customer updated successfully" : "Customer saved successfully");

        // Reset form
        customerNameInput.value = "";
        phoneInput.value = "";
        customerIdInput.value = "";

        if (isEdit) {
            document.getElementById("formTitle").textContent = "Create Customer";
            document.getElementById("saveButton").textContent = "Save Customer";
            document.getElementById("cancelButton").style.display = "none";
        }

        loadCustomers();
    })
    .catch(err => {
        console.error("Error saving customer:", err);
        showToast("Failed to save customer.", "error");
    });
}

function editCustomer(id, name, phone) {
    document.getElementById("customerId").value = id;
    document.getElementById("customerName").value = name;
    document.getElementById("phone").value = phone;

    document.getElementById("formTitle").textContent = "Edit Customer";
    document.getElementById("saveButton").textContent = "Update Customer";
    document.getElementById("cancelButton").style.display = "inline-flex";

    // Focus input
    document.getElementById("customerName").focus();
}

function cancelEdit() {
    document.getElementById("customerId").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("phone").value = "";

    document.getElementById("formTitle").textContent = "Create Customer";
    document.getElementById("saveButton").textContent = "Save Customer";
    document.getElementById("cancelButton").style.display = "none";
}

function deleteCustomer(id) {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    fetch(`${CUSTOMER_API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to delete customer");
        showToast("Customer deleted successfully");
        loadCustomers();
    })
    .catch(err => {
        console.error("Error deleting customer:", err);
        showToast("Failed to delete customer.", "error");
    });
}