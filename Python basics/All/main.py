

customer_sales = [
    {"customer": "Jammy", "order_amount": 190},
    {"customer": "Noah", "order_amount": 250},
    {"customer": "Omar", "order_amount": 320},
    {"customer": "Sophie", "order_amount": 180},
    {"customer": "Sophie", "order_amount": 275},
    {"customer": "Anika", "order_amount": 210},
    {"customer": "Sophie", "order_amount": 300},
    {"customer": "Sophie", "order_amount": 225}, 
    {"customer": "Chen", "order_amount": 195},
    {"customer": "Emily", "order_amount": 310},
    {"customer": "Liam", "order_amount": 280},
    {"customer": "Noah", "order_amount": 260},
    {"customer": "Ava", "order_amount": 230},
    {"customer": "Ethan", "order_amount": 205},
    {"customer": "Olivia", "order_amount": 330},
    {"customer": "Lucas", "order_amount": 185},
    {"customer": "Emma", "order_amount": 240},
    {"customer": "Lucas", "order_amount": 220},
    {"customer": "James", "order_amount": 290},
    {"customer": "Lucas", "order_amount": 200},
]

total = {}
for i in customer_sales:
    customer = i["customer"]
    order_amount =  i["order_amount"]  

    if customer not in total.keys():
        total[customer] = 0

    total[customer] += order_amount

    
total_sales = []
for key in total.keys():
    total_sales.append({"customer": key, "total": total[key]})

total_sales = [
    
]
    

print(total_sales)

# total = {'Jammy': 190, 'Noah': 510, 'Omar': 320, 'Sophie': 980, 'Anika': 210, 'Chen': 195, 'Emily': 310, 'Liam': 280, 'Ava': 230, 'Ethan': 205, 'Olivia': 330, 'Lucas': 605, 'Emma': 240, 'James': 290}
