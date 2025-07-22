

let cart = {};
frappe.pages["ramsha-pos"].on_page_load = function (wrapper) {
  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: "Ramsha POS",
    single_column: true,
  });

  const filters = [
    {
      label: "POS Profile",
      fieldname: "pos_profile",
      fieldtype: "Link",
      options: "POS Profile",
      change() {
        loadPOSProfileData();
      },
    },
    {
      label: "Customer",
      fieldname: "customer",
      fieldtype: "Link",
      options: "Customer",
    },
    {
      label: "Date",
      fieldname: "date",
      fieldtype: "Date",
    },
    {
      label: "Sales Person",
      fieldname: "sales_person",
      fieldtype: "Link",
      options: "Sales Person",
    },
  ];

  for (const field of filters) {
    page.add_field({
      ...field,
      change() {
        loadCoffeeItems();
      },
    });
  }
  

  function loadCoffeeItems(options = {}) {
  const pos_profile = page.fields_dict.pos_profile?.get_value();
  const customer = page.fields_dict.customer?.get_value();
  const item_group = options.item_group || null;
  const item_code = options.item_codes || $("#item-search").val() || "";

  const cart_items = options.cart_items ? JSON.stringify(options.cart_items) : null;
  const mode = typeof options.mode !== "undefined" ? options.mode : null;
  console.log("Sending cart to backend:", cart_items);

  frappe.call({
    method: "test_app.test_app.page.ramsha_pos.ramsha_pos.get_coffee_items",
    args: {
      pos_profile,
      customer,
      item_group,
      item_codes: item_code,
      cart_items,
      mode,
    },
    callback: function (r) {
      if (r.message) {
        render_coffee_items(r.message.items);
        render_item_groups(r.message.item_groups);
        render_item_codes(r.message.item_codes);
        if (r.message.invoice_name) {
          window.last_created_invoice = r.message.invoice_name; 
          frappe.msgprint("Invoice Created: " + r.message.invoice_name + " (Docstatus: " + r.message.docstatus + ")");
        }

      
        const discount = r.message.discount || 0;
        const customerName = r.message.customer_name || "";
        const posProfileName = r.message.pos_profile_name || "";

        let labelText = "No Customer / POS Profile";
        if (customerName && posProfileName) labelText = `${customerName} | ${posProfileName}`;
        else if (customerName) labelText = customerName;
        else if (posProfileName) labelText = posProfileName;

        $("#selected-customer-label").text(labelText);
        $("#discount-text").text(`${discount}% OFF`);
        $("#discount-badge").toggle(discount > 0);

        window.current_discount = discount;
        window.current_gst_rate = r.message.gst_rate || 0;

        updateCartUI();

        if (r.message.invoice_name) {
          frappe.msgprint(`Sales Invoice Created: <b>${r.message.invoice_name}</b>`);
        }
      }
    },
  });
}
document.getElementById("print-btn")?.addEventListener("click", function () {
  const invoice_name = window.last_created_invoice;

  if (!invoice_name) {
    frappe.msgprint("No invoice has been created to print.");
    return;
  }

  const print_url = `/printview?doctype=Sales Invoice&name=${invoice_name}&trigger_print=1&format=Standard`;
  window.open(print_url, "_blank");
});


function render_item_groups(groups) {
  const container = document.getElementById("item-groups-row");
  if (!container) return;

  let html = "";
  groups.forEach((group) => {
    html += `<div class="group-tag" data-group="${group}" style="
      background: #103e35;
      color: #ffffff;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 14px;
      font-size: 12px;
      cursor: pointer;
    ">${group}</div>`;
  });

  container.innerHTML = html;


  document.querySelectorAll(".group-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      const group = tag.dataset.group;
      console.log("Clicked group:", group); 
      document.getElementById("item-search").value = "";
      loadCoffeeItems({ item_group: group });
    });
  });
}

function bindGroupTagClicks() {
  document.querySelectorAll(".group-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      const group = tag.dataset.group;
      console.log("Clicked group:", group);  
      document.getElementById("item-search").value = "";
      loadCoffeeItems({ item_group: group });
    });
  });
}

function render_item_codes(codes) {
  let datalist = document.getElementById("item-code-suggestions");
  if (!datalist) return;

  let options = codes.map(code => `<option value="${code}">`).join("");
  datalist.innerHTML = options;
}

  $(wrapper).find(".row.layout-main").append(`
	<div style="margin: 20px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
  
  
  <div style="display: flex; justify-content: space-between; flex-direction: column;">
    <label style="font-size: 12px; font-weight: 500; color: #444; margin-bottom: 4px;">Search by Item Code</label>
    <input
      id="item-search"
      type="text"
      placeholder="Enter item code"
	  list="item-code-suggestions"
      style="padding: 6px 10px; width: 180px; border: 1px solid #ccc; border-radius: 6px; font-size: 12px;" />
	  <datalist id="item-code-suggestions"></datalist>
  </div>

  <div id="item-groups-row" style="display: flex; flex-wrap: wrap; gap: 6px;">
   
  </div>

</div>
<div id="item-codes-row" style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;"></div>

	
			
	
<div style="padding: 20px; background: #f8f9fa; font-family: 'Poppins', sans-serif; width: 100%;">
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; width: 100%; box-sizing: border-box;">
  

   
    <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 12px; overflow-y: auto; max-height: 650px;">
      <div id="coffee-items" style="display: flex; flex-wrap: wrap; gap: 15px;"></div>
    </div>

 
    <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 12px; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #ddd;">
			<div style="font-weight: 600; font-size: 15px;" id="selected-customer-label"></div>
			<div id="discount-badge" style="display: none;">
				<span id="discount-text" style=" background: #103e35; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px;display: inline-block;"
				</span>
			</div>





		</div>
	  

      <div id="cart-items" style="min-height: 100px; padding: 10px; margin-bottom: 20px; text-align: center; color: #888; font-style: italic; font-size: 16px;">
        Select Item to Add to Cart.
      </div>

      <div style="border-top: 2px solid #ddd; font-size: 14px; margin-top:30px;">
        <div style="display: flex; justify-content: space-between; gap: 20px;">
          <div style="width: 48%; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Quantity of Items:</span><span><strong id="item-count">0</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span><span><strong id="subtotal">0</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>GST:</span><span><strong id="gst">0</strong></span>
            </div>
          </div>

          <div style="width: 48%; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Grand Total:</strong></span><span><strong id="grand-total">0</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Rounded Total:</strong></span><span><strong id="rounded-total">0</strong></span>
            </div>
			<div style="display: flex; justify-content: space-between;">
              <span><strong>Item Wise Discount:</strong></span><span><strong id="discount">0</strong></span>
            </div>

            <div style="display: flex; justify-content: space-between; color: red;">
              <span><strong>Balance:</strong></span><span><strong id="balance">0</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 25px; display: flex; justify-content: center; align-items: flex-start; gap: 20px;">
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: left; gap: 10px;">
            <label style="min-width: 100px; color: grey;"><strong>Cash</strong></label>
            <input type="number" id="cash-input" value="0" style="width: 100px; padding: 5px;" />
          </div>
          <div style="display: flex; justify-content: left; gap: 10px;">
            <label style="min-width: 100px; color: grey;"><strong>Credit Card</strong></label>
            <input type="number" id="card-input" value="0" style="width: 100px; padding: 5px;" />
          </div>
          <div style="display: flex; justify-content: left; gap: 10px;">
            <label style="min-width: 100px; color: grey;"><strong>Wire Transfer</strong></label>
            <input type="number" id="wire-input" value="0" style="width: 100px; padding: 5px;" />

          </div>
          <div style="display: flex; justify-content: left; gap: 10px;">
            <label style="min-width: 100px; color: grey;"><strong>Bank Draft</strong></label>
            <input type="number" id="draft-input" value="0" style="width: 100px; padding: 5px;" />
          </div>
        </div>

      
		
      </div>
	  <div>
			<div style="display: flex; justify-content: space-between; text-align; right; margin-top:30px;">
              <span><strong>Total Discount:</strong></span><span><strong id="total-discount">0</strong></span>
            </div>
        
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px; width: 50%;">
            <button id="print-btn" 
                    style="background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
              Print
            </button>

            <button id="draft-cart-btn" 
                    style="background: #ffc107; color: black; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
             Save as Draft
            </button>

            <button id="submit-cart-btn" 
                    style="background: #28a745; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
              Submit Invoice
            </button>
          </div>
          
		</div>
    </div>
  </div>
</div>
`);
 loadCoffeeItems();  

bindPaymentListeners();
document.getElementById("submit-cart-btn")?.addEventListener("click", function () {
  const cart_items = Object.values(cart).map(item => ({
  item_code: item.item_code,
  qty: item.qty,
  price: item.price,
  custom_discount_percentage: item.custom_discount_percentage || 0
  }));
  if (cart_items.length === 0) {
    frappe.msgprint("Cart is empty.");
    return;
  }

  loadCoffeeItems({ cart_items, mode: 1 }); 
});

document.getElementById("draft-cart-btn")?.addEventListener("click", function () {
  const cart_items = Object.values(cart).map(item => ({
  item_code: item.item_code,
  qty: item.qty,
  price: item.price,
  custom_discount_percentage: item.custom_discount_percentage || 0
 
  }));

  if (cart_items.length === 0) {
    frappe.msgprint("Cart is empty.");
    return;
  }

  loadCoffeeItems({ cart_items, mode: 0 }); 
});

};
function render_coffee_items(items) {
  const container = document.getElementById("coffee-items");
  container.innerHTML = "";

  items.forEach((item) => {
    const image = item.image || "/files/placeholder.jpg";
    const cartItem = cart[item.name] || { qty: 0 };

    const card = document.createElement("div");
    card.className = "coffee-card";
    card.style = `
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      width: 160px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    `;

    card.innerHTML = `
      <img src="${image}" style="width: 100%; height: 140px; object-fit: contain; margin-bottom: 10px;" />
      <div style="font-size: 14px; font-weight: 500; color: #222; margin-bottom: 5px;">${item.item_name}</div>
      <div style="font-size: 13px; color: #444; font-weight: 600; margin-bottom: 8px;">Rs ${item.price}</div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="changeQty('${item.item_code}', -1)" style="background: #eee; border: none; border-radius: 5px; width: 28px; height: 28px; cursor: pointer;">➖</button>
        <span id="qty-${item.name}" style="min-width: 20px; text-align: center;">${cartItem.qty}</span>
        <button onclick="addToCart('${item.name}', '${item.item_name}', ${item.price}, '${image}', ${item.custom_discount_percentage || 0})" style="background: #eee; border: none; border-radius: 5px; width: 28px; height: 28px; cursor: pointer;">➕</button>
      </div>
    `;

    container.appendChild(card);
  });
}



function addToCart(item_code, item_name, price, image, custom_discount_percentage = 0) {
  console.trace("addToCart triggered", item_code, item_name, price);

  const discountAmount = (price * custom_discount_percentage) / 100;
  const finalPrice = price - discountAmount;

  if (cart[item_code]) {
    cart[item_code].qty += 1;
  } else {
    cart[item_code] = {
      item_code,
      item_name,
      original_price: price,
      price: finalPrice,
      image,
      qty: 1,
      custom_discount_percentage,
    };
  }

  updateCartUI();
}

window.changeQty = function (item_code, delta) {
  if (cart[item_code]) {
    cart[item_code].qty += delta;

    if (cart[item_code].qty <= 0) {
      delete cart[item_code];
    }

    updateCartUI();
  }
};

function updateCartUI() {
  const cartDiv = document.getElementById("cart-items");
  if (!cartDiv) {
    console.error("Element with id 'cart-items' not found");
    return;
  }

  cartDiv.innerHTML = "";
  if (Object.keys(cart).length === 0) {
    cartDiv.innerHTML = `
      <div style="text-align: center; color: #888; font-style: italic; font-size: 15px;">
        Select Item to Add to Cart.
      </div>
    `;
    return;
  }

  let totalQty = 0;
  let subtotal = 0;
  let totalItemDiscounts = 0;
  let totalItemWiseDiscount = 0;

  console.log("Cart contents:", cart);
  console.log("Current discount rate:", window.current_discount);

  for (const key in cart) {
    const item = cart[key];
    totalQty += item.qty;
    const itemTotal = item.price * item.qty;

    const itemDiscount = item.custom_discount_percentage || 0;

    const itemDiscountAmount = itemTotal * (itemDiscount / 100);
    totalItemWiseDiscount += itemDiscountAmount;
    subtotal += itemTotal - itemDiscountAmount;

    console.log(`Item: ${item.item_name}`);
    console.log(`  Price: ${item.price}, Qty: ${item.qty}`);
    console.log(`  Item Total: ${itemTotal}`);
    console.log(`  Item Discount: ${itemDiscount}%`);
    console.log(`  Item Discount Amount: ${itemDiscountAmount}`);
    console.log(`  After Discount: ${itemTotal - itemDiscountAmount}`);

    let discountLine = "";
    if (itemDiscount > 0) {
      discountLine = `<div style="font-size: 12px; color: green;">Discount: ${itemDiscount}% (-Rs ${itemDiscountAmount.toFixed(0)})</div>`;
    }

    const discountText =
      item.custom_discount_percentage > 0
        ? `<span style="color: green; font-size: 12px;"> (${item.custom_discount_percentage}% OFF)</span>`
        : "";

    cartDiv.innerHTML += `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <img src="${item.image}" alt="${item.item_name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
        
        <div style="flex: 1;">
            <div style="font-weight: 600;">${item.item_name}</div>
      		<div style="font-size: 13px; color: #666;">Rs ${item.price} x ${item.qty}</div>
      		${discountLine}
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button onclick="changeQty('${item.item_code}', -1)" style="background: #eee; border: none; border-radius: 5px; width: 28px; height: 28px; cursor: pointer;">➖</button>
          <span style="min-width: 20px; text-align: center;">${cart[item.item_code]?.qty || 0}</span>
          <button onclick="addToCart('${item.item_code}', '${item.item_name}', ${item.price}, '${item.image}', ${item.custom_discount_percentage || 0})" style="background: #eee; border: none; border-radius: 5px; width: 28px; height: 28px; cursor: pointer;">➕</button>
        </div>
		
        <div style="width: 60px; text-align: right; font-weight: bold;">Rs ${(itemTotal - itemDiscountAmount).toFixed(0)}</div>
      </div>
    `;
  }

  Object.keys(cart).forEach((name) => {
    const qtySpan = document.getElementById(`qty-${name}`);
    if (qtySpan) {
      qtySpan.innerText = cart[name].qty;
    }
  });

  if (Object.keys(cart).length === 0) {
    document
      .querySelectorAll('[id^="qty-"]')
      .forEach((span) => (span.innerText = "0"));
  }

  const gstRate = window.current_gst_rate || 0;
  const gst = subtotal * (gstRate / 100);
  let grandTotal = subtotal + gst;

  const discountRate = window.current_discount || 0;
  const cartDiscountAmount = grandTotal * (discountRate / 100);
  const finalGrandTotal = Math.round(grandTotal - cartDiscountAmount)

  const rounded = Math.round(grandTotal);
  const balance = rounded;

  const totalDiscount = cartDiscountAmount + totalItemWiseDiscount;
  const finalTotalEl = document.getElementById("final-grand-total");
if (finalTotalEl) {
  finalTotalEl.innerText = `Rs ${finalGrandTotal.toFixed(2)}`;
}

  const totalDiscountEl = document.getElementById("total-discount");
  if (totalDiscountEl) {
  	totalDiscountEl.innerText = `Rs ${totalDiscount.toFixed(2)}`;
  }



  console.log("=== FINAL CALCULATIONS ===");
  console.log(`Subtotal (after item discounts): Rs ${subtotal.toFixed(2)}`);
  console.log(`Total Item Discounts: Rs ${totalItemDiscounts.toFixed(2)}`);
  console.log(`GST (17%): Rs ${gst.toFixed(2)}`);
  console.log(
    `Grand Total (before cart discount): Rs ${(subtotal + gst).toFixed(2)}`,
  );
  console.log(`Cart Discount Rate: ${discountRate}%`);
  console.log(`Cart Discount Amount: Rs ${cartDiscountAmount.toFixed(2)}`);
  console.log(`Final Grand Total: Rs ${grandTotal.toFixed(2)}`);
  console.log(`Rounded Total: Rs ${rounded}`);

  const updateElement = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = value;
    } else {
      console.warn(`Element with id '${id}' not found`);
    }
  };

  updateElement("item-count", totalQty);
  updateElement("subtotal", `Rs ${subtotal.toFixed(2)}`);
  updateElement("gst", `Rs ${gst.toFixed(2)}`);
  updateElement("grand-total", `Rs ${grandTotal.toFixed(2)}`);
  updateElement("rounded-total", `Rs ${rounded}`);
  updateElement("balance", `Rs ${balance}`);
  updateElement("cart-discount", `Rs ${cartDiscountAmount.toFixed(2)}`);
  updateElement("discount", `Rs ${totalItemWiseDiscount.toFixed(2)}`);
  updateElement("total-discount", `Rs ${totalDiscount.toFixed(2)}`);
  updateElement("final-grand-total", `Rs ${finalGrandTotal.toFixed(2)}`);

  if (typeof calculateBalance === "function") {
    calculateBalance();
  }
}

window.calculateBalance = function () {
  const cash = parseFloat(document.getElementById("cash-input")?.value) || 0;
  const card = parseFloat(document.getElementById("card-input")?.value) || 0;
  const wire = parseFloat(document.getElementById("wire-input")?.value) || 0;
  const draft = parseFloat(document.getElementById("draft-input")?.value) || 0;

  const paid = cash + card + wire + draft;

  if (paid === 0) {
    document.getElementById("balance").innerText = "Rs 0.00";
    document.getElementById("balance").parentElement.style.color = "red";
    return;
  }

  const grandTotalText =
    document.getElementById("grand-total")?.innerText || "0";
  const grandTotal = parseFloat(grandTotalText.replace("Rs", "").trim()) || 0;

  const rounded = Math.round(grandTotal);
  const balance = paid - rounded;

  const balanceEl = document.getElementById("balance");
  balanceEl.innerText = `Rs ${balance.toFixed(2)}`;

  if (balance < 0) {
    balanceEl.parentElement.style.color = "red";
  } else {
    balanceEl.parentElement.style.color = "blue";
  }

  document.getElementById("rounded-total").innerText = `Rs ${rounded}`;
};

function bindPaymentListeners() {
  ["cash-input", "card-input", "wire-input", "draft-input"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", calculateBalance);
    }
  });
}
function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = value;
  } else {
    console.warn(`Element with ID '${id}' not found`);
  }



}

