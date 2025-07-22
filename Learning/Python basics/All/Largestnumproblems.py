#largest of 3 numbers
def find_largest(a, b, c):
    if a >= b and a >= c:
       return a
    elif b >= a and b >= c:
        return b
    else:
        return c

a = int(input("Enter first number: "))
b = int(input("Enter second number: "))
c = int(input("Enter third number: "))

largest = find_largest(a, b, c)
print(f"The largest of the 3 numbers is: {largest}")



