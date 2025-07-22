my_list = []
for i in range(5):
    num = int(input(f"Enter numbers {i+1}:"))
    my_list.append(num)
print("Even Numbers:")
for number in my_list:
    if (number % 2 == 0):
        print(number)