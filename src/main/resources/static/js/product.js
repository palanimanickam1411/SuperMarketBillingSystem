const PRODUCT_API_URL = "/api/products";
const CATEGORY_API_URL = "/api/categories";

// Initial load
loadCategories();
loadProducts();

function loadCategories() {
    const categorySelect = document.getElementById("category");
    if (!categorySelect) return;

    fetch(CATEGORY_API_URL)
        .then(res => res.json())
        .then(data => {
            let option = '<option value="">Select Category</option>';
            data.forEach(category => {
                option += `<option value="${category.id}">${category.categoryName}</option>`;
            });
            categorySelect.innerHTML = option;
        })
        .catch(err => {
            console.error("Error loading categories:", err);
            showToast("Failed to load categories dropdown", "error");
        });
}

function loadProducts() {
    const tableBody = document.getElementById("productTable");
    if (!tableBody) return;

    fetch(PRODUCT_API_URL)
        .then(res => res.json())
        .then(data => {
            let rows = "";
            if (data.length === 0) {
                rows = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
                            No products found. Use the form to add one.
                        </td>
                    </tr>
                `;
            } else {
                data.forEach(product => {
                    const categoryName = product.category && product.category.categoryName ? product.category.categoryName : "Uncategorized";
                    const isLowStock = product.quantity <= 5;
                    const stockBadge = isLowStock 
                        ? `<span class="badge badge-low-stock">Low Stock: ${product.quantity}</span>`
                        : `<span class="badge badge-in-stock">In Stock: ${product.quantity}</span>`;

                    // Safe escaping for strings in onclick handler
                    const escapedName = product.productName.replace(/'/g, "\\'");

                    rows += `
                        <tr>
                            <td><strong>#PRD-${product.id}</strong></td>
                            <td>${product.productName}</td>
                            <td><strong>₹${product.price.toFixed(2)}</strong></td>
                            <td>${stockBadge}</td>
                            <td>${categoryName}</td>
                            <td style="text-align: right;">
                                <button class="btn btn-outline btn-sm" onclick="editProduct(${product.id}, '${escapedName}', ${product.price}, ${product.quantity}, ${product.category ? product.category.id : 'null'})" style="margin-right: 8px;">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
                            </td>
                        </tr>
                    `;
                });
            }
            tableBody.innerHTML = rows;
        })
        .catch(err => {
            console.error("Error loading products:", err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #ef4444; padding: 30px;">
                        Failed to fetch products. Please ensure the backend is running.
                    </td>
                </tr>
            `;
        });
}

function saveProduct() {
    const productNameInput = document.getElementById("productName");
    const priceInput = document.getElementById("price");
    const quantityInput = document.getElementById("quantity");
    const categorySelect = document.getElementById("category");
    const productIdInput = document.getElementById("productId");

    const productName = productNameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const quantity = parseInt(quantityInput.value);
    const categoryId = categorySelect.value;

    if (!productName) {
        showToast("Product name is required", "error");
        return;
    }
    if (isNaN(price) || price < 0) {
        showToast("Please enter a valid price", "error");
        return;
    }
    if (isNaN(quantity) || quantity < 0) {
        showToast("Please enter a valid stock quantity", "error");
        return;
    }
    if (!categoryId) {
        showToast("Please select a category", "error");
        return;
    }

    const editId = productIdInput.value;
    const isEdit = editId !== "";

    const product = {
        productName: productName,
        price: price,
        quantity: quantity,
        category: {
            id: parseInt(categoryId)
        }
    };

    const url = isEdit ? `${PRODUCT_API_URL}/${editId}` : PRODUCT_API_URL;
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    })
    .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
    })
    .then(() => {
        showToast(isEdit ? "Product updated successfully" : "Product saved successfully");
        
        // Reset form
        productNameInput.value = "";
        priceInput.value = "";
        quantityInput.value = "";
        categorySelect.value = "";
        productIdInput.value = "";

        if (isEdit) {
            document.getElementById("formTitle").textContent = "Create Product";
            document.getElementById("saveButton").textContent = "Save Product";
            document.getElementById("cancelButton").style.display = "none";
        }

        loadProducts();
    })
    .catch(err => {
        console.error("Error saving product:", err);
        showToast("Failed to save product.", "error");
    });
}

function editProduct(id, name, price, quantity, categoryId) {
    document.getElementById("productId").value = id;
    document.getElementById("productName").value = name;
    document.getElementById("price").value = price;
    document.getElementById("quantity").value = quantity;
    document.getElementById("category").value = categoryId || "";

    document.getElementById("formTitle").textContent = "Edit Product";
    document.getElementById("saveButton").textContent = "Update Product";
    document.getElementById("cancelButton").style.display = "inline-flex";

    // Scroll to form and focus name input
    document.getElementById("productName").focus();
}

function cancelEdit() {
    document.getElementById("productId").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("price").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("category").value = "";

    document.getElementById("formTitle").textContent = "Create Product";
    document.getElementById("saveButton").textContent = "Save Product";
    document.getElementById("cancelButton").style.display = "none";
}

function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    fetch(`${PRODUCT_API_URL}/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to delete product");
        showToast("Product deleted successfully");
        loadProducts();
    })
    .catch(err => {
        console.error("Error deleting product:", err);
        showToast("Failed to delete product.", "error");
    });
}