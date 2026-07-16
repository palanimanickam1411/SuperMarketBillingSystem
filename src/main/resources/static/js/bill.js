
const PRODUCT_API_URL = "/api/products";
const BILL_API_URL = "/api/bills";
const BILL_ITEM_API_URL = "/api/bill-items";

let products = [];
let billItems = [];
let total = 0;

// Initialize dropdowns

loadProducts();



function loadProducts() {
    const container = document.getElementById("productListContainer");
    if (!container) return;

    fetch(PRODUCT_API_URL)
        .then(res => res.json())
        .then(data => {
            products = data;
            if (data.length === 0) {
                container.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center;">No products available.</p>';
                return;
            }
            let html = '';
            data.forEach(product => {
                const stockColor = product.quantity <= 5 ? '#ef4444' : 'var(--text-main)';
                html += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-card); margin-bottom: 6px; border-radius: 6px;">
                    <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1;">
                        <input type="checkbox" id="chk_${product.id}" value="${product.id}" onchange="toggleQtyInput(${product.id})" style="margin-top: 4px; transform: scale(1.2);">
                        <label for="chk_${product.id}" style="font-size: 14px; font-weight: 600; margin: 0; cursor: pointer; flex: 1;">
                            ${product.productName}
                            <div style="font-size: 12px; font-weight: 500; color: var(--text-muted); margin-top: 2px;">₹${product.price.toFixed(2)} | Stock: <span style="color: ${stockColor}">${product.quantity}</span></div>
                        </label>
                    </div>
                    <div style="width: 70px;">
                        <input type="number" id="qty_${product.id}" class="form-control" style="padding: 6px; font-size: 13px; text-align: center;" placeholder="Qty" min="1" disabled>
                    </div>
                </div>`;
            });
            container.innerHTML = html;
        })
        .catch(err => {
            console.error("Error loading products:", err);
            showToast("Failed to load product list", "error");
        });
}

function toggleQtyInput(productId) {
    const chk = document.getElementById(`chk_${productId}`);
    const qtyInput = document.getElementById(`qty_${productId}`);
    qtyInput.disabled = !chk.checked;
    if (chk.checked) {
        qtyInput.value = 1;
        qtyInput.focus();
    } else {
        qtyInput.value = '';
    }
}

function addSelectedItems() {
    const container = document.getElementById("productListContainer");
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showToast("Please select at least one product", "error");
        return;
    }

    let addedCount = 0;
    let hasError = false;

    checkboxes.forEach(chk => {
        const productId = parseInt(chk.value);
        const qtyInput = document.getElementById(`qty_${productId}`);
        const quantity = parseInt(qtyInput.value);

        if (isNaN(quantity) || quantity <= 0) {
            showToast(`Please enter a valid quantity for selected product`, "error");
            hasError = true;
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = billItems.find(item => item.product.id === productId);
        const currentBilledQty = existingItem ? existingItem.quantity : 0;
        const requestedTotalQty = currentBilledQty + quantity;

        if (requestedTotalQty > product.quantity) {
            showToast(`Insufficient stock for ${product.productName}! Billed: ${currentBilledQty}, Stock: ${product.quantity}`, "error");
            hasError = true;
            return;
        }

        if (existingItem) {
            existingItem.quantity = requestedTotalQty;
        } else {
            billItems.push({
                product: product,
                quantity: quantity,
                price: product.price
            });
        }
        addedCount++;
        
        // Reset UI for this item
        chk.checked = false;
        toggleQtyInput(productId);
    });

    if (addedCount > 0 && !hasError) {
        renderBillTable();
        showToast(`Added ${addedCount} product(s) to invoice`);
    } else if (addedCount > 0 && hasError) {
        renderBillTable();
        showToast(`Added ${addedCount} product(s), but some had errors.`, "error");
    }
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
        updateTotals(0, 0);
        return;
    }

    let rows = "";
    total = 0;
    let totalGst = 0;

    billItems.forEach((item, index) => {
        const itemAmount = item.price * item.quantity;
        total += itemAmount;
        
        const catGst = item.product.category ? (item.product.category.gstRate || 0) : 0;
        const itemGst = itemAmount * (catGst / 100);
        totalGst += itemGst;

        rows += `
            <tr>
                <td>
                    <strong>${item.product.productName}</strong>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">GST: ${catGst}%</div>
                </td>
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
    updateTotals(total, totalGst);
}

function removeItem(index) {
    const removedItemName = billItems[index].product.productName;
    billItems.splice(index, 1);
    renderBillTable();
    showToast(`Removed ${removedItemName} from invoice`);
}

function updateTotals(subTotalValue, gstAmount = 0) {
    const grandTotal = subTotalValue + gstAmount;

    document.getElementById("subTotal").textContent = `₹${subTotalValue.toFixed(2)}`;
    const gstAmountEl = document.getElementById("gstAmount");
    if (gstAmountEl) gstAmountEl.textContent = `₹${gstAmount.toFixed(2)}`;
    document.getElementById("grandTotalText").textContent = `₹${grandTotal.toFixed(2)}`;
}

function clearInvoice() {
    billItems = [];
    total = 0;
    renderBillTable();
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    
    // Clear product selections
    const container = document.getElementById("productListContainer");
    if (container) {
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(chk => {
            chk.checked = false;
            const productId = chk.value;
            toggleQtyInput(productId);
        });
    }

    showToast("Invoice layout cleared");
}

function saveBill() {
    const customerName = document.getElementById("customerName").value.trim().toUpperCase();
    const customerPhone = document.getElementById("customerPhone").value.trim();

    if (!customerName) {
        showToast("Please enter a customer name for this invoice", "error");
        return;
    }

    if (billItems.length === 0) {
        showToast("Cannot save empty invoice. Add items first.", "error");
        return;
    }

    // 1. Prepare bill metadata
    let totalGst = 0;
    billItems.forEach(item => {
        const catGst = item.product.category ? (item.product.category.gstRate || 0) : 0;
        totalGst += (item.price * item.quantity) * (catGst / 100);
    });
    const grandTotal = total + totalGst;

    const bill = {
        billDate: new Date().toISOString().split("T")[0],
        totalAmount: grandTotal,
        customerName: customerName,
        customerPhone: customerPhone
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
                billId: savedBill.id,
                productId: item.product.id
            };
            
            saveItemPromises.push(
                fetch(BILL_ITEM_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(billItem)
                }).then(res => {
                    if (!res.ok) throw new Error("Failed to save bill item");
                    return res.json();
                })
            );

            // Deduct stock of the product in database
            const newStock = item.product.quantity - item.quantity;
            const updatedProduct = {
                productName: item.product.productName,
                price: item.product.price,
                quantity: newStock,
                category: item.product.category
            };

            updateStockPromises.push(
                fetch(`${PRODUCT_API_URL}/${item.product.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedProduct)
                }).then(res => {
                    if (!res.ok) throw new Error("Failed to update product stock");
                    return res.json();
                })
            );
        });

        // Resolve all backend requests
        return Promise.all([...saveItemPromises, ...updateStockPromises]).then(() => savedBill);
    })
    .then((savedBill) => {
        showToast("Invoice saved successfully!");
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