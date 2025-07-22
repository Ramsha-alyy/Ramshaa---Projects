import frappe

@frappe.whitelist()
def get_coffee_items(pos_profile=None, customer=None, item_group=None, item_codes=None, cart_items=None, mode=0):
    """
    Combined method to fetch items and optionally create a Sales Invoice.
    If cart_items is passed, a Sales Invoice will be created.
    mode: 0 (Draft), 1 (Submit)
    """
    pos_discount = 0
    customer_discount = 0
    tax_rate = 0
    invoice_name = None
    docstatus = None
    pos_profile_doc = None 

  
    if pos_profile:
        pos_profile_doc = frappe.get_doc("POS Profile", pos_profile)
        pos_discount = pos_profile_doc.custom_discount or 0

        if pos_profile_doc.taxes_and_charges:
            tax_template = frappe.get_doc("Sales Taxes and Charges Template", pos_profile_doc.taxes_and_charges)
            for row in tax_template.taxes:
                if row.rate:
                    tax_rate = row.rate
                    break

    if customer:
        customer_discount = frappe.db.get_value("Customer", customer, "discount") or 0

    final_discount = max(pos_discount, customer_discount)


    where_clauses = [
        "ip.price_list = 'Standard Selling'",
        "i.disabled = 0"
    ]
    values = {}

    if item_group:
        where_clauses.append("i.item_group = %(item_group)s")
        values["item_group"] = item_group

    if item_codes:
        if isinstance(item_codes, list):
            codes_placeholders = ", ".join([f"%({f'code{i}'})s" for i in range(len(item_codes))])
            where_clauses.append(f"i.name IN ({codes_placeholders})")
            for i, code in enumerate(item_codes):
                values[f"code{i}"] = code
        elif isinstance(item_codes, str):
            where_clauses.append("i.name LIKE %(item_code)s")
            values["item_code"] = f"%{item_codes}%"

    where_clause = " AND ".join(where_clauses)

    query = f"""
        SELECT
            i.name,
            i.item_name,
            i.item_group,
            i.image,
            i.custom_discount_percentage,
            ip.price_list_rate as price
        FROM 
            `tabItem` i
        INNER JOIN 
            `tabItem Price` ip
        ON i.name = ip.item_code
        WHERE {where_clause}
    """

    items = frappe.db.sql(query, values, as_dict=True)

    item_groups = [d.name for d in frappe.get_all("Item Group", filters={"is_group": 0}, fields=["name"])]

    item_filters = {"disabled": 0}
    if item_group:
        item_filters["item_group"] = item_group

    item_codes_list = [d.name for d in frappe.get_all("Item", filters=item_filters, fields=["name"])]

    customer_name = frappe.db.get_value("Customer", customer, "customer_name") or "" if customer else ""
    pos_profile_name = frappe.db.get_value("POS Profile", pos_profile, "name") or "" if pos_profile else ""

    if cart_items and len(frappe.parse_json(cart_items)) > 0:
        try:
            cart_items = frappe.parse_json(cart_items)
            invoice = frappe.new_doc("Sales Invoice")
            invoice.customer = customer
            invoice.posting_date = frappe.utils.nowdate()
            invoice.set_posting_time = 1
            invoice.pos_profile = pos_profile
            invoice.is_pos = 1
            invoice.update_stock = 1

           
            if pos_profile_doc and pos_profile_doc.taxes_and_charges:
                invoice.taxes_and_charges = pos_profile_doc.taxes_and_charges
                template_doc = frappe.get_doc("Sales Taxes and Charges Template", pos_profile_doc.taxes_and_charges)
                for tax in template_doc.taxes:
                    invoice.append("taxes", {
                        "charge_type": tax.charge_type,
                        "account_head": tax.account_head,
                        "description": tax.description,
                        "rate": tax.rate
                    })

            for item in cart_items:
                invoice.append("items", {
                    "item_code": item.get("item_code"),
                    "qty": item.get("qty"),
                    "rate": item.get("price"),
                    "discount_percentage": item.get("custom_discount_percentage", 0)
                })
            
            if final_discount:
                    invoice.additional_discount_percentage = final_discount

            invoice.calculate_taxes_and_totals()
            invoice.append("payments", {
                    "mode_of_payment": "Cash",
                    "amount": invoice.grand_total or 0
                })

            invoice.insert()

            if int(mode) == 1:
                invoice.submit()

            invoice_name = invoice.name
            docstatus = invoice.docstatus

            if not invoice_name:
                invoice_name = "Not Created"

        except Exception as e:
            frappe.log_error(frappe.get_traceback(), "POS Invoice Creation Failed")
            frappe.throw(f"Error creating invoice: {e}")

    return {
        "items": items,
        "item_groups": item_groups,
        "item_codes": item_codes_list,
        "discount": final_discount,
        "customer_name": customer_name,
        "pos_profile_name": pos_profile_name,
        "gst_rate": tax_rate,
        "invoice_name": invoice_name,
        "docstatus": docstatus
    }