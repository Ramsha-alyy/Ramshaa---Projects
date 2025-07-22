a = int(input("Enter a number"))
b = int(input("Enter a number"))
c = int(input("Enter a number"))

if a == b == c:
    print("All numbers are equal")
elif a >= b and a >= c:
    print("a is greater",a)
elif b >= a and b >= c:
    print("b is greater" ,b)
else:
    print("largest number is c" ,c)