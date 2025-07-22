#sum of list

def sum_of_list(numbers):
    total = 0
    for num in numbers:
        total += num
    return total

a = input("Enter numbers separated by spaces: ")
numbers = list(map(int, a.split()))
print("Sum: " , sum_of_list(numbers))


