import frappe
import json

@frappe.whitelist()
def get_students_via_sql():
    students = frappe.db.sql("""
        SELECT name, student_name FROM `tabStudent`
        ORDER BY student_name ASC
    """, as_dict=True)
    return students