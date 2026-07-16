const CATEGORY_API_URL = "/api/categories";

// Initial load
loadCategories();

function loadCategories() {
    const tableBody = document.getElementById("categoryTable");
    if (!tableBody) return;

    fetch(CATEGORY_API_URL)
        .then(res => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.json();
        })
        .then(data => {
            let rows = "";
            if (data.length === 0) {
                rows = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">
                            No categories found. Use the form to add one.
                        </td>
                    </tr>
                `;
            } else {
                data.forEach(category => {
                    rows += `
                        <tr>
                            <td><strong>#CAT-${category.id}</strong></td>
                            <td>${category.categoryName}</td>
                            <td>${category.gstRate || 0}%</td>
                            <td style="text-align: right;">
                                <button class="btn btn-outline btn-sm" onclick="editCategory(${category.id}, '${category.categoryName.replace(/'/g, "\\'")}', ${category.gstRate || 0})" style="margin-right: 8px;">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            tableBody.innerHTML = rows;
        })
        .catch(err => {
            console.error("Error loading categories:", err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ef4444; padding: 30px;">
                        Failed to fetch categories. Please ensure the backend is running.
                    </td>
                </tr>
            `;
        });
}

function saveCategory() {
    const categoryNameInput = document.getElementById("categoryName");
    const categoryIdInput = document.getElementById("categoryId");
    const gstRateInput = document.getElementById("gstRate");
    
    const categoryName = categoryNameInput.value.trim();
    if (!categoryName) {
        showToast("Category name cannot be empty", "error");
        return;
    }

    const editId = categoryIdInput.value;
    const isEdit = editId !== "";
    
    const category = { 
        categoryName: categoryName,
        gstRate: parseFloat(gstRateInput.value) || 0
    };
    const url = isEdit ? `${CATEGORY_API_URL}/${editId}` : CATEGORY_API_URL;
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(category)
    })
    .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
    })
    .then(() => {
        showToast(isEdit ? "Category updated successfully" : "Category saved successfully");
        
        // Reset form
        categoryNameInput.value = "";
        categoryIdInput.value = "";
        gstRateInput.value = "0";
        
        // If edit, restore create layout
        if (isEdit) {
            document.getElementById("formTitle").textContent = "Create Category";
            document.getElementById("saveButton").textContent = "Save Category";
            document.getElementById("cancelButton").style.display = "none";
        }
        
        loadCategories();
    })
    .catch(err => {
        console.error("Error saving category:", err);
        showToast("Failed to save category. Please try again.", "error");
    });
}

function editCategory(id, name, gstRate) {
    document.getElementById("categoryId").value = id;
    document.getElementById("categoryName").value = name;
    document.getElementById("gstRate").value = gstRate || 0;
    
    document.getElementById("formTitle").textContent = "Edit Category";
    document.getElementById("saveButton").textContent = "Update Category";
    document.getElementById("cancelButton").style.display = "inline-flex";
    
    // Focus the input
    document.getElementById("categoryName").focus();
}

function cancelEdit() {
    document.getElementById("categoryId").value = "";
    document.getElementById("categoryName").value = "";
    document.getElementById("gstRate").value = "0";
    
    document.getElementById("formTitle").textContent = "Create Category";
    document.getElementById("saveButton").textContent = "Save Category";
    document.getElementById("cancelButton").style.display = "none";
}

function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category? All products in this category might become orphaned.")) return;
    
    fetch(`${CATEGORY_API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to delete category");
        showToast("Category deleted successfully");
        loadCategories();
    })
    .catch(err => {
        console.error("Error deleting category:", err);
        showToast("Failed to delete category.", "error");
    });
}