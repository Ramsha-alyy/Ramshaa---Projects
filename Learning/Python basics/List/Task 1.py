
my_list = []
my_list.extend(["apple" , "banana", "cherry"])
my_list.remove("banana")

for fruits in my_list:
   print(fruits)
if "apple" in my_list:
   print("Apple is in the list")
print("Length of the items in the list", len(my_list))
