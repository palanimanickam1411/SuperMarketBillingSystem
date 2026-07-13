const CUSTOMER_API_URL = "/api/customers";
const PRODUCT_API_URL = "/api/products";
const BILL_API_URL = "/api/bills";
const BILL_ITEM_API_URL = "/api/bill-items";

let products = [];
let billItems = [];
let total = 0;

// Initialize dropdowns
loadCustomers();
loadProducts();

function loadCustomers() {
    const customerSelect = document.getElementById("customer");
    if (!customerSelect) return;

    fetch(CUSTOMER_API_URL)
        .then(res => res.json())
        .then(data => {
            let option = '<option value="">Select Customer</option>';
            data.forEach(customer => {
                option += `<option value="${customer.id}">${customer.customerName} (${customer.phone})</option>`;
            });
            customerSelect.innerHTML = option;
        })
        .catch(err => {
            console.error("Error loading customers:", err);
            showToast("Failed to load customer list", "error");
        });
}

function loadProducts() {
    const productSelect = document.getElementById("product");
    if (!productSelect) return;

    fetch(PRODUCT_API_URL)
        .then(res => res.json())
        .then(data => {
            products = data;
            let option = '<option value="">Select Product</option>';
            data.forEach(product => {
                option += `<option value="${product.id}">${product.productName}</option>`;
            });
            productSelect.innerHTML = option;
        })
        .catch(err => {
            console.error("Error loading products:", err);
            showToast("Failed to load product list", "error");
        });
}

function onProductSelect() {
    const productId = parseInt(document.getElementById("product").value);
    const priceSpan = document.getElementById("productUnitPrice");
    const stockSpan = document.getElementById("productStock");

    if (isNaN(productId)) {
        priceSpan.textContent = "₹0.00";
        stockSpan.textContent = "0 units";
        return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
        priceSpan.textContent = `₹${product.price.toFixed(2)}`;
        stockSpan.textContent = `${product.quantity} units`;
        
        // Add visual cues for low stock
        if (product.quantity <= 5) {
            stockSpan.style.color = "#ef4444";
        } else {
            stockSpan.style.color = "var(--primary)";
        }
    }
}

function addItem() {
    const productId = parseInt(document.getElementById("product").value);
    const quantity = parseInt(document.getElementById("quantity").value);

    if (isNaN(productId)) {
        showToast("Please select a product", "error");
        return;
    }

    if (isNaN(quantity) || quantity <= 0) {
        showToast("Please enter a purchase quantity greater than 0", "error");
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast("Product not found", "error");
        return;
    }

    // Check current stock limit
    const existingItem = billItems.find(item => item.product.id === productId);
    const currentBilledQty = existingItem ? existingItem.quantity : 0;
    const requestedTotalQty = currentBilledQty + quantity;

    if (requestedTotalQty > product.quantity) {
        showToast(`Insufficient stock! Billed: ${currentBilledQty}, Stock: ${product.quantity}`, "error");
        return;
    }

    // Add or update items in array
    if (existingItem) {
        existingItem.quantity = requestedTotalQty;
    } else {
        billItems.push({
            product: product,
            quantity: quantity,
            price: product.price
        });
    }

    renderBillTable();
    showToast(`${product.productName} added to invoice`);
    
    // Clear item inputs and details
    document.getElementById("product").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("productUnitPrice").textContent = "₹0.00";
    document.getElementById("productStock").textContent = "0 units";
    document.getElementById("productStock").style.color = "var(--text-main)";
}

function renderBillTable() {
    const tbody = document.getElementById("billTable");
    const countBadge = document.getElementById("itemCountBadge");
    if (!tbody) return;

    if (billItems.length === 0) {
        tbody.innerHTML = `
            <tr id="emptyTableRow">
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 40px;">
                    No items added to invoice draft. Add products on the left.
                </td>
            </tr>
        `;
        countBadge.textContent = "0 Items Drafted";
        updateTotals(0);
        return;
    }

    let rows = "";
    total = 0;

    billItems.forEach((item, index) => {
        const itemAmount = item.price * item.quantity;
        total += itemAmount;

        rows += `
            <tr>
                <td><strong>${item.product.productName}</strong></td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td><strong>₹${itemAmount.toFixed(2)}</strong></td>
                <td style="text-align: right;">
                    <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Remove</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rows;
    countBadge.textContent = `${billItems.length} Items Drafted`;
    updateTotals(total);
}

function removeItem(index) {
    const removedItemName = billItems[index].product.productName;
    billItems.splice(index, 1);
    renderBillTable();
    showToast(`Removed ${removedItemName} from invoice`);
}

function updateTotals(subTotalValue) {
    document.getElementById("subTotal").textContent = `₹${subTotalValue.toFixed(2)}`;
    document.getElementById("grandTotalText").textContent = `₹${subTotalValue.toFixed(2)}`;
}

function clearInvoice() {
    billItems = [];
    total = 0;
    renderBillTable();
    document.getElementById("customer").value = "";
    document.getElementById("product").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("productUnitPrice").textContent = "₹0.00";
    document.getElementById("productStock").textContent = "0 units";
    showToast("Invoice layout cleared");
}

function saveBill() {
    const customerId = document.getElementById("customer").value;

    if (!customerId) {
        showToast("Please select a customer for this invoice", "error");
        return;
    }

    if (billItems.length === 0) {
        showToast("Cannot save empty invoice. Add items first.", "error");
        return;
    }

    // 1. Prepare bill metadata
    const bill = {
        billDate: new Date().toISOString().split("T")[0],
        totalAmount: total,
        customer: {
            id: parseInt(customerId)
        }
    };

    // Disable buttons to prevent double-clicks
    const buttons = document.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = true);

    showToast("Finalizing invoice... Please wait.");

    // 2. Save bill
    fetch(BILL_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bill)
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to save bill");
        return res.json();
    })
    .then(savedBill => {
        // 3. Save all bill items and update stock concurrently
        const saveItemPromises = [];
        const updateStockPromises = [];

        billItems.forEach(item => {
            // Save bill item details
            const billItem = {
                quantity: item.quantity,
                price: item.price,
                bill: {
                    id: savedBill.id
                },
                product: {
                    id: item.product.id
                }
            };
            
            saveItemPromises.push(
                fetch(BILL_ITEM_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(billItem)
                })
            );

            // Deduct stock of the product in database
            const newStock = item.product.quantity - item.quantity;
            const updatedProduct = {
                productName: item.product.productName,
                price: item.product.price,
                quantity: newStock,
                category: {
                    id: item.product.category ? item.product.category.id : null
                }
            };

            updateStockPromises.push(
                fetch(`${PRODUCT_API_URL}/${item.product.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedProduct)
                })
            );
        });

        // Resolve all backend requests
        return Promise.all([...saveItemPromises, ...updateStockPromises]);
    })
    .then(() => {
        showToast("Invoice generated and saved successfully!");
        setTimeout(() => {
            location.reload();
        }, 1500);
    })
    .catch(err => {
        console.error("Error finalizing invoice:", err);
        showToast("Failed to save transaction invoice.", "error");
        buttons.forEach(btn => btn.disabled = false);
    });
}